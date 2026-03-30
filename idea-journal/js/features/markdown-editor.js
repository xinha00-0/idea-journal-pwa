const DRAFT_KEY_PREFIX = 'idea-journal-draft-';
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000;

export class MarkdownEditor {
  constructor(elementId, options = {}) {
    this.elementId = elementId;
    this.element = document.getElementById(elementId);
    this.onContentChange = null;
    this._debounceTimer = null;
    this._draftKey = DRAFT_KEY_PREFIX + elementId;
    this.options = options;
    this.editor = null;
    this.init();
  }

  init() {
    const defaultToolbar = [
      'bold', 'italic', 'heading', 'quote',
      'unordered-list', 'ordered-list', 'link',
      'image', 'table', 'preview'
    ];

    const easymdeOptions = {
      element: this.element,
      spellChecker: false,
      toolbar: this.options.toolbar || defaultToolbar,
      status: false,
      autofocus: false,
      placeholder: this.options.placeholder || '',
      ...this.options
    };

    delete easymdeOptions.onContentChange;

    if (typeof EasyMDE !== 'undefined') {
      this.editor = new EasyMDE(easymdeOptions);
      this.editor.codemirror.on('change', () => {
        if (this.onContentChange) {
          this.onContentChange(this.getContent());
        }
        this.autoSaveDraft();
      });
    }
  }

  getContent() {
    if (this.editor) {
      return this.editor.value();
    }
    return this.element ? this.element.value || '' : '';
  }

  setContent(content) {
    if (this.editor) {
      this.editor.value(content || '');
    } else if (this.element) {
      this.element.value = content || '';
    }
  }

  insertMarkdown(syntax) {
    if (this.editor) {
      const cm = this.editor.codemirror;
      const cursor = cm.getCursor();
      cm.replaceRange(syntax, cursor);
      cm.focus();
    } else if (this.element) {
      const start = this.element.selectionStart || this.element.value.length;
      const before = this.element.value.substring(0, start);
      const after = this.element.value.substring(start);
      this.element.value = before + syntax + after;
    }
  }

  insertImage(imageData) {
    const { url, alt } = imageData;
    const syntax = `![${alt || ''}](${url || ''})`;
    this.insertMarkdown(syntax);
  }

  clear() {
    this.setContent('');
  }

  destroy() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
    if (this.editor && typeof this.editor.toTextArea === 'function') {
      this.editor.toTextArea();
    }
    this.editor = null;
    this.onContentChange = null;
    this.element = null;
  }

  setOnContentChange(callback) {
    this.onContentChange = callback;
  }

  autoSaveDraft() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this._saveDraftNow();
    }, 1000);
  }

  _saveDraftNow() {
    try {
      const content = this.getContent();
      if (!content) return;
      const data = {
        content,
        timestamp: Date.now()
      };
      localStorage.setItem(this._draftKey, JSON.stringify(data));
    } catch (e) {
      // ignore storage errors
    }
  }

  loadDraft() {
    try {
      const raw = localStorage.getItem(this._draftKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data.timestamp !== 'number') return null;
      const age = Date.now() - data.timestamp;
      if (age > DRAFT_EXPIRY_MS) {
        this.clearDraft();
        return null;
      }
      if (!data.content) return null;
      this.setContent(data.content);
      return data.content;
    } catch (e) {
      return null;
    }
  }

  clearDraft() {
    try {
      localStorage.removeItem(this._draftKey);
    } catch (e) {
      // ignore
    }
  }
}
