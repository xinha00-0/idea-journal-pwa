export class MarkdownEditor {
  constructor(elementId, options = {}) {
    this.element = document.getElementById(elementId);
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
    this.instance = new EasyMDE(this.options);
    
    // 监听内容变化
    this.instance.codemirror.on('change', () => {
      this.onContentChange?.(this.getContent());
      // 自动保存草稿（防抖）
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => {
        this.autoSaveDraft();
      }, 1000);
    });
    
    // 加载草稿
    const draft = this.loadDraft();
    if (draft) {
      this.setContent(draft);
    }
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
  
  // 事件处理器
  setOnContentChange(callback) {
    this.onContentChange = callback;
  }
  
  // 自动保存草稿
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
      // 草稿保留24小时
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
