export class MarkdownEditor {
  constructor(elementId, options = {}) {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }
    
    if (typeof EasyMDE === 'undefined') {
      throw new Error('EasyMDE is not loaded. Please include easymde.min.js in your HTML.');
    }
    
    this.options = {
      spellChecker: false,
      autofocus: true,
      placeholder: '此刻你在想什么？支持 Markdown 语法...',
      status: ['lines', 'words', 'cursor'],
      toolbar: [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'image', 'table', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide'
      ],
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.instance = new EasyMDE({
      element: this.element,
      ...this.options
    });
    
    this.instance.codemirror.on('change', () => {
      this.onContentChange?.(this.getContent());
    });
  }
  
  getContent() {
    return this.instance.value();
  }
  
  setContent(content) {
    this.instance.value(content);
  }
  
  insertMarkdown(syntax) {
    const cm = this.instance.codemirror;
    const doc = cm.getDoc();
    const cursor = doc.getCursor();
    doc.replaceRange(syntax, cursor);
  }
  
  insertImage(imageData) {
    const markdown = `![图片](${imageData})`;
    this.insertMarkdown(markdown);
  }
  
  clear() {
    this.instance.value('');
  }
  
  destroy() {
    this.instance.toTextArea();
    this.instance = null;
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
      const { content, timestamp } = JSON.parse(draft);
      const draftAge = Date.now() - new Date(timestamp).getTime();
      if (draftAge < 24 * 60 * 60 * 1000) {
        return content;
      } else {
        localStorage.removeItem('draft-idea');
      }
    }
    return null;
  }
  
  clearDraft() {
    localStorage.removeItem('draft-idea');
  }
}
