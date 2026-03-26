import { MarkdownEditor } from '../../js/features/markdown-editor.js';

describe('MarkdownEditor', () => {
  let editor;
  
  beforeEach(() => {
    // 创建DOM元素
    document.body.innerHTML = '<textarea id="editor"></textarea>';
    editor = new MarkdownEditor('editor');
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
