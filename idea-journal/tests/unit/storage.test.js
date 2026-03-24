import { IdeaDatabase } from '../../js/storage/database.js';
import { indexedDB } from 'fake-indexeddb';

// 设置全局indexedDB
global.indexedDB = indexedDB;

// Polyfill structuredClone if not available
if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

describe('IdeaDatabase', () => {
  let db;
  
  beforeEach(async () => {
    db = new IdeaDatabase();
    await db.init();
  });
  
  afterEach(async () => {
    await db.clear();
    await db.clearCategories();
    await db.clearTags();
  });
  
  test('应该创建数据库', () => {
    expect(db).toBeDefined();
  });
  
  test('应该添加想法', async () => {
    const idea = {
      title: '测试想法',
      content: '测试内容',
      tags: ['测试'],
      created: new Date()
    };
    
    const id = await db.addIdea(idea);
    expect(id).toBeDefined();
    
    const savedIdea = await db.getIdea(id);
    expect(savedIdea.title).toBe('测试想法');
  });
  
  test('应该获取所有想法', async () => {
    await db.addIdea({ title: '想法1', content: '内容1' });
    await db.addIdea({ title: '想法2', content: '内容2' });
    
    const ideas = await db.getAllIdeas();
    expect(ideas.length).toBe(2);
  });
  
  test('应该更新想法', async () => {
    const id = await db.addIdea({ title: '原标题', content: '原内容' });
    const updatedIdea = { id, title: '新标题', content: '新内容' };
    
    await db.updateIdea(updatedIdea);
    const idea = await db.getIdea(id);
    expect(idea.title).toBe('新标题');
  });
  
  test('应该删除想法', async () => {
    const id = await db.addIdea({ title: '要删除的想法', content: '' });
    await db.deleteIdea(id);
    
    const idea = await db.getIdea(id);
    expect(idea).toBeUndefined();
  });
  
  test('应该清空所有想法', async () => {
    await db.addIdea({ title: '想法1', content: '' });
    await db.addIdea({ title: '想法2', content: '' });
    
    await db.clear();
    const ideas = await db.getAllIdeas();
    expect(ideas.length).toBe(0);
  });
  
  // 分类CRUD测试
  test('应该添加分类', async () => {
    const category = { name: '工作', order: 1 };
    const id = await db.addCategory(category);
    expect(id).toBeDefined();
    
    const savedCategory = await db.getCategory(id);
    expect(savedCategory.name).toBe('工作');
  });
  
  test('应该获取所有分类', async () => {
    await db.addCategory({ name: '个人', order: 1 });
    await db.addCategory({ name: '工作', order: 2 });
    
    const categories = await db.getAllCategories();
    expect(categories.length).toBe(2);
  });
  
  test('应该更新分类', async () => {
    const id = await db.addCategory({ name: '旧名称', order: 1 });
    await db.updateCategory({ id, name: '新名称', order: 1 });
    
    const category = await db.getCategory(id);
    expect(category.name).toBe('新名称');
  });
  
  test('应该删除分类', async () => {
    const id = await db.addCategory({ name: '要删除的分类', order: 1 });
    await db.deleteCategory(id);
    
    const category = await db.getCategory(id);
    expect(category).toBeUndefined();
  });
  
  // 标签CRUD测试
  test('应该添加标签', async () => {
    const tag = { name: '测试标签' };
    const id = await db.addTag(tag);
    expect(id).toBeDefined();
    
    const savedTag = await db.getTag(id);
    expect(savedTag.name).toBe('测试标签');
  });
  
  test('应该获取所有标签', async () => {
    await db.addTag({ name: '标签1' });
    await db.addTag({ name: '标签2' });
    
    const tags = await db.getAllTags();
    expect(tags.length).toBe(2);
  });
  
  test('应该更新标签', async () => {
    const id = await db.addTag({ name: '旧名称' });
    await db.updateTag({ id, name: '新名称' });
    
    const tag = await db.getTag(id);
    expect(tag.name).toBe('新名称');
  });
  
  test('应该删除标签', async () => {
    const id = await db.addTag({ name: '要删除的标签' });
    await db.deleteTag(id);
    
    const tag = await db.getTag(id);
    expect(tag).toBeUndefined();
  });
  
  test('应该清空所有标签', async () => {
    await db.addTag({ name: '标签1' });
    await db.addTag({ name: '标签2' });
    
    await db.clearTags();
    const tags = await db.getAllTags();
    expect(tags.length).toBe(0);
  });
});