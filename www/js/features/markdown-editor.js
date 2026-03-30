export class MarkdownEditor {
  constructor(elementId, options = {}) {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    this.instance = null;
    this.onContentChange = null;

    this.options = {
      spellChecker: false,
      autofocus: false,
      placeholder: '此刻你在想什么？支持 Markdown 语法...',
      status: false,
      toolbar: false,
      ...options
    };

    this.init();
  }

  init() {
    if (typeof EasyMDE !== 'undefined') {
      this.instance = new EasyMDE({
        element: this.element,
        ...this.options
      });

      this.instance.codemirror.on('change', () => {
        if (this.onContentChange) {
          this.onContentChange(this.getContent());
        }
      });
    } else {
      this.element.addEventListener('input', () => {
        if (this.onContentChange) {
          this.onContentChange(this.getContent());
        }
      });
    }
  }

  getContent() {
    if (this.instance) {
      return this.instance.value();
    }
    return this.element.value || '';
  }

  setContent(content) {
    if (this.instance) {
      this.instance.value(content);
    } else {
      this.element.value = content;
    }
  }

  insertMarkdown(syntax) {
    if (this.instance) {
      const cm = this.instance.codemirror;
      const doc = cm.getDoc();
      const cursor = doc.getCursor();
      doc.replaceRange(syntax, cursor);
      cm.focus();
    } else {
      const start = this.element.selectionStart;
      const value = this.element.value;
      this.element.value = value.substring(0, start) + syntax + value.substring(start);
      this.element.selectionStart = this.element.selectionEnd = start + syntax.length;
      this.element.focus();
    }
  }

  insertImage(imageData) {
    const markdown = `![图片](${imageData})`;
    this.insertMarkdown(markdown);
  }

  clear() {
    if (this.instance) {
      this.instance.value('');
    } else {
      this.element.value = '';
    }
  }

  destroy() {
    if (this.instance) {
      this.instance.toTextArea();
      this.instance = null;
    }
  }

  setOnContentChange(callback) {
    this.onContentChange = callback;
  }

  autoSaveDraft() {
    const content = this.getContent();
    if (content.trim()) {
      localStorage.setItem('draft-idea', JSON.stringify({
        content,
        timestamp: new Date().toISOString()
      }));
    }
  }

  loadDraft() {
    const draft = localStorage.getItem('draft-idea');
    if (draft) {
      try {
        const { content, timestamp } = JSON.parse(draft);
        const draftAge = Date.now() - new Date(timestamp).getTime();
        if (draftAge < 24 * 60 * 60 * 1000) {
          return content;
        } else {
          localStorage.removeItem('draft-idea');
        }
      } catch (e) {
        localStorage.removeItem('draft-idea');
      }
    }
    return null;
  }

  clearDraft() {
    localStorage.removeItem('draft-idea');
  }
}
