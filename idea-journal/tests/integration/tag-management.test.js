import { TagManager } from '../../js/features/tag-manager.js';
import { IdeaDatabase } from '../../js/storage/database.js';

// Polyfill structuredClone if not available
if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

describe('TagManager', () => {
  let tagManager;
  let db;
  
  beforeEach(async () => {
    db = new IdeaDatabase();
    await db.init();
    tagManager = new TagManager(db);
  });
  
  afterEach(async () => {
    await db.clear();
    await db.clearTags();
    await db.clearCategories();
  });
  
  test('应该创建标签', async () => {
    const tag = await tagManager.createTag({
      name: '测试标签',
      color: '#006e1c'
    });
    expect(tag.id).toBeDefined();
    expect(tag.name).toBe('测试标签');
    expect(tag.color).toBe('#006e1c');
  });
  
  test('应该获取所有标签', async () => {
    await tagManager.createTag({ name: '标签1', color: '#0061a4' });
    await tagManager.createTag({ name: '标签2', color: '#0061a4' });
    
    const tags = await tagManager.getAllTags();
    expect(tags.length).toBe(2);
  });
  
  test('应该为想法添加标签', async () => {
    const ideaId = await db.addIdea({
      title: '测试想法',
      content: '测试内容',
      tags: [],
      created: Date.now()
    });
    
    const tag1 = await tagManager.createTag({ name: '标签1', color: '#0061a4' });
    const tag2 = await tagManager.createTag({ name: '标签2', color: '#0061a4' });
    
    await tagManager.addTagsToIdea(ideaId, [tag1.id, tag2.id]);
    
    const updatedIdea = await db.getIdea(ideaId);
    expect(updatedIdea.tags).toContain(tag1.id);
    expect(updatedIdea.tags).toContain(tag2.id);
  });
  
  test('应该通过ID获取标签', async () => {
    const tag = await tagManager.createTag({
      name: '测试标签',
      color: '#006e1c'
    });
    
    const retrievedTag = await tagManager.getTagById(tag.id);
    expect(retrievedTag.id).toBe(tag.id);
    expect(retrievedTag.name).toBe('测试标签');
  });
  
  test('应该更新标签', async () => {
    const tag = await tagManager.createTag({
      name: '原始名称',
      color: '#006e1c'
    });
    
    const updatedTag = await tagManager.updateTag(tag.id, {
      name: '更新后的名称'
    });
    
    expect(updatedTag.name).toBe('更新后的名称');
    expect(updatedTag.color).toBe('#006e1c');
  });
  
  test('应该删除标签', async () => {
    const tag = await tagManager.createTag({
      name: '要删除的标签',
      color: '#006e1c'
    });
    
    await tagManager.deleteTag(tag.id);
    
    const retrievedTag = await tagManager.getTagById(tag.id);
    expect(retrievedTag).toBeUndefined();
  });
  
  test('应该增加标签计数', async () => {
    const tag = await tagManager.createTag({
      name: '测试标签',
      color: '#006e1c'
    });
    
    await tagManager.incrementTagCount(tag.id);
    
    const retrievedTag = await tagManager.getTagById(tag.id);
    expect(retrievedTag.count).toBe(1);
  });
  
  test('应该获取热门标签', async () => {
    const tag1 = await tagManager.createTag({ name: '热门标签', color: '#0061a4' });
    const tag2 = await tagManager.createTag({ name: '冷门标签', color: '#0061a4' });
    const tag3 = await tagManager.createTag({ name: '中等标签', color: '#0061a4' });

    await tagManager.updateTag(tag1.id, { count: 10 });
    await tagManager.updateTag(tag2.id, { count: 2 });
    await tagManager.updateTag(tag3.id, { count: 5 });

    const popularTags = await tagManager.getPopularTags(2);
    expect(popularTags.length).toBe(2);
    expect(popularTags[0].name).toBe('热门标签');
    expect(popularTags[1].name).toBe('中等标签');
  });
  
  test('应该为想法添加唯一标签', async () => {
    const ideaId = await db.addIdea({
      title: '测试想法',
      content: '测试内容',
      tags: [],
      created: Date.now()
    });
    
    const tag1 = await tagManager.createTag({ name: '标签1', color: '#0061a4' });
    const tag2 = await tagManager.createTag({ name: '标签2', color: '#0061a4' });
    
    await tagManager.addTagsToIdea(ideaId, [tag1.id]);
    await tagManager.addTagsToIdea(ideaId, [tag1.id, tag2.id]);
    
    const updatedIdea = await db.getIdea(ideaId);
    expect(updatedIdea.tags.length).toBe(2);
  });
});
