import { MarkdownEditor } from '../../js/features/markdown-editor.js';

describe('MarkdownEditor', () => {
  let editor;
  let mockEasyMDE;
  let mockCodeMirror;
  let currentValue = '';
  
  beforeEach(() => {
    document.body.innerHTML = '<textarea id="editor"></textarea>';
    currentValue = '';
    
    const mockFn = () => {
      const fn = function() { return mockEasyMDE; };
      fn.mockImpl = () => {};
      return fn;
    };
    
    mockCodeMirror = {
      getDoc: () => ({
        getCursor: () => ({ line: 0, ch: 0 }),
        replaceRange: (text) => { currentValue += text; }
      }),
      on: mockFn()
    };
    
    mockEasyMDE = {
      value: function(val) { 
        if (val !== undefined) { currentValue = val; }
        return currentValue; 
      },
      codemirror: mockCodeMirror,
      toTextArea: mockFn()
    };
    
    global.EasyMDE = mockFn();
    editor = new MarkdownEditor('editor');
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
  });
  
  test('应该初始化编辑器', () => {
    expect(editor).toBeDefined();
    expect(editor.instance).toBeDefined();
  });
  
  test('应该设置内容', () => {
    const content = '# 标题\n\n这是内容';
    editor.setContent(content);
    expect(editor.getContent()).toBe(content);
  });
  
  test('应该插入Markdown语法', () => {
    editor.setContent('普通文本');
    editor.insertMarkdown('**粗体**');
    expect(editor.getContent()).toContain('**粗体**');
  });
});
