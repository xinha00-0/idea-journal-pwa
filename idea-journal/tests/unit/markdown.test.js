import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { MarkdownEditor } from '../../js/features/markdown-editor.js';

describe('MarkdownEditor', () => {
  let editor;
  let textarea;

  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();

    textarea = document.createElement('textarea');
    textarea.id = 'test-editor';
    document.body.appendChild(textarea);
  });

  afterEach(() => {
    if (editor) {
      editor.destroy();
      editor = null;
    }
    const el = document.getElementById('test-editor');
    if (el) el.remove();
    jest.useRealTimers();
  });

  test('应该创建MarkdownEditor实例', () => {
    editor = new MarkdownEditor('test-editor');
    expect(editor).toBeDefined();
    expect(editor.element).toBe(textarea);
  });

  test('应该在不存在的元素上安全处理', () => {
    editor = new MarkdownEditor('nonexistent');
    expect(editor).toBeDefined();
    expect(editor.element).toBeNull();
  });

  test('getContent应该返回空字符串（无EasyMDE时）', () => {
    editor = new MarkdownEditor('test-editor');
    expect(editor.getContent()).toBe('');
  });

  test('setContent应该设置textarea值（无EasyMDE时）', () => {
    editor = new MarkdownEditor('test-editor');
    editor.setContent('Hello World');
    expect(textarea.value).toBe('Hello World');
  });

  test('getContent应该返回已设置的内容', () => {
    editor = new MarkdownEditor('test-editor');
    editor.setContent('测试内容');
    expect(editor.getContent()).toBe('测试内容');
  });

  test('clear应该清空内容', () => {
    editor = new MarkdownEditor('test-editor');
    editor.setContent('一些内容');
    editor.clear();
    expect(editor.getContent()).toBe('');
  });

  test('setContent空字符串应该清空内容', () => {
    editor = new MarkdownEditor('test-editor');
    editor.setContent('内容');
    editor.setContent('');
    expect(editor.getContent()).toBe('');
  });

  test('setContent null应该清空内容', () => {
    editor = new MarkdownEditor('test-editor');
    editor.setContent('内容');
    editor.setContent(null);
    expect(editor.getContent()).toBe('');
  });

  test('destroy应该清理引用', () => {
    editor = new MarkdownEditor('test-editor');
    editor.destroy();
    expect(editor.editor).toBeNull();
    expect(editor.onContentChange).toBeNull();
    expect(editor.element).toBeNull();
  });

  test('setOnContentChange应该设置回调', () => {
    editor = new MarkdownEditor('test-editor');
    const cb = () => {};
    editor.setOnContentChange(cb);
    expect(editor.onContentChange).toBe(cb);
  });

  test('insertImage应该插入Markdown图片语法', () => {
    editor = new MarkdownEditor('test-editor');
    editor.insertImage({ url: 'https://example.com/img.png', alt: '图片' });
    expect(editor.getContent()).toBe('![图片](https://example.com/img.png)');
  });

  test('insertImage无alt应该插入空alt', () => {
    editor = new MarkdownEditor('test-editor');
    editor.insertImage({ url: 'https://example.com/img.png' });
    expect(editor.getContent()).toBe('![](https://example.com/img.png)');
  });

  test('insertMarkdown应该插入语法到光标位置', () => {
    editor = new MarkdownEditor('test-editor');
    editor.setContent('Hello');
    textarea.selectionStart = 5;
    editor.insertMarkdown(' World');
    expect(editor.getContent()).toBe('Hello World');
  });

  test('autoSaveDraft应该在1秒后保存到localStorage', () => {
    editor = new MarkdownEditor('test-editor');
    editor.setContent('草稿内容');
    editor.autoSaveDraft();

    const key = 'idea-journal-draft-test-editor';
    expect(localStorage.getItem(key)).toBeNull();

    jest.advanceTimersByTime(1000);

    const saved = JSON.parse(localStorage.getItem(key));
    expect(saved.content).toBe('草稿内容');
    expect(typeof saved.timestamp).toBe('number');
  });

  test('autoSaveDraft应该防抖，只保存最后一次', () => {
    editor = new MarkdownEditor('test-editor');
    editor.setContent('第一次');
    editor.autoSaveDraft();

    jest.advanceTimersByTime(500);

    editor.setContent('第二次');
    editor.autoSaveDraft();

    jest.advanceTimersByTime(2000);

    const saved = JSON.parse(localStorage.getItem('idea-journal-draft-test-editor'));
    expect(saved.content).toBe('第二次');
  });

  test('autoSaveDraft不应保存空内容', () => {
    editor = new MarkdownEditor('test-editor');
    editor.autoSaveDraft();
    jest.advanceTimersByTime(2000);

    expect(localStorage.getItem('idea-journal-draft-test-editor')).toBeNull();
  });

  test('loadDraft应该加载有效草稿', () => {
    const draft = {
      content: '保存的草稿',
      timestamp: Date.now()
    };
    localStorage.setItem('idea-journal-draft-test-editor', JSON.stringify(draft));

    editor = new MarkdownEditor('test-editor');
    const result = editor.loadDraft();

    expect(result).toBe('保存的草稿');
    expect(editor.getContent()).toBe('保存的草稿');
  });

  test('loadDraft过期的草稿应返回null并清除', () => {
    const expiredDraft = {
      content: '过期草稿',
      timestamp: Date.now() - 25 * 60 * 60 * 1000
    };
    localStorage.setItem('idea-journal-draft-test-editor', JSON.stringify(expiredDraft));

    editor = new MarkdownEditor('test-editor');
    const result = editor.loadDraft();

    expect(result).toBeNull();
    expect(localStorage.getItem('idea-journal-draft-test-editor')).toBeNull();
  });

  test('loadDraft无草稿时返回null', () => {
    editor = new MarkdownEditor('test-editor');
    const result = editor.loadDraft();
    expect(result).toBeNull();
  });

  test('loadDraft无效JSON时返回null', () => {
    localStorage.setItem('idea-journal-draft-test-editor', 'not-json');

    editor = new MarkdownEditor('test-editor');
    const result = editor.loadDraft();
    expect(result).toBeNull();
  });

  test('clearDraft应该从localStorage删除草稿', () => {
    localStorage.setItem('idea-journal-draft-test-editor', '{"content":"test","timestamp":1}');
    editor = new MarkdownEditor('test-editor');
    editor.clearDraft();
    expect(localStorage.getItem('idea-journal-draft-test-editor')).toBeNull();
  });

  test('destroy应该取消防抖定时器', () => {
    editor = new MarkdownEditor('test-editor');
    editor.setContent('内容');
    editor.autoSaveDraft();
    editor.destroy();

    jest.advanceTimersByTime(5000);
    expect(localStorage.getItem('idea-journal-draft-test-editor')).toBeNull();
  });

  test('草稿key应包含元素ID', () => {
    textarea.id = 'my-editor';
    editor = new MarkdownEditor('my-editor');
    editor.setContent('test');
    editor.autoSaveDraft();
    jest.advanceTimersByTime(2000);

    expect(localStorage.getItem('idea-journal-draft-my-editor')).not.toBeNull();
  });

  test('accept选项应传递给EasyMDE配置', () => {
    const options = {
      placeholder: '输入想法...',
      toolbar: ['bold', 'italic']
    };
    editor = new MarkdownEditor('test-editor', options);
    expect(editor).toBeDefined();
  });

  test('onContentChange回调在无EasyMDE时不会自动触发', () => {
    let called = false;
    editor = new MarkdownEditor('test-editor');
    editor.setOnContentChange(() => { called = true; });
    editor.setContent('新内容');
    expect(called).toBe(false);
  });

  test('insertMarkdown在无EasyMDE时不应抛出错误', () => {
    editor = new MarkdownEditor('test-editor');
    expect(() => editor.insertMarkdown('**bold**')).not.toThrow();
  });

  test('loadDraft跳过timestamp不是数字的数据', () => {
    localStorage.setItem('idea-journal-draft-test-editor', JSON.stringify({ content: 'test', timestamp: 'bad' }));

    editor = new MarkdownEditor('test-editor');
    const result = editor.loadDraft();
    expect(result).toBeNull();
  });

  test('loadDraft跳过content为空的数据', () => {
    localStorage.setItem('idea-journal-draft-test-editor', JSON.stringify({ content: '', timestamp: Date.now() }));

    editor = new MarkdownEditor('test-editor');
    const result = editor.loadDraft();
    expect(result).toBeNull();
  });
});
