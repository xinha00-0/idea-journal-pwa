import { TagManager } from '../../js/features/tag-manager.js';
import { IdeaDatabase } from '../../js/storage/database.js';
import { indexedDB } from 'fake-indexeddb';

global.indexedDB = indexedDB;

if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

describe('TagManager Integration', () => {
  let db;
  let tagManager;

  beforeEach(async () => {
    db = new IdeaDatabase();
    await db.init();
    tagManager = new TagManager(db);
  });

  afterEach(async () => {
    await db.clear();
    await db.clearTags();
  });

  describe('createTag', () => {
    test('should create a tag with defaults', async () => {
      const tag = await tagManager.createTag({ name: 'Important' });

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe('Important');
      expect(tag.color).toBe('#6366f1');
      expect(tag.count).toBe(0);
      expect(tag.created).toBeDefined();
    });

    test('should create a tag with custom color', async () => {
      const tag = await tagManager.createTag({ name: 'Urgent', color: '#ef4444' });

      expect(tag.color).toBe('#ef4444');
    });

    test('should reject duplicate tag name', async () => {
      await tagManager.createTag({ name: 'Test' });

      await expect(tagManager.createTag({ name: 'Test' }))
        .rejects.toThrow('Tag "Test" already exists');
    });
  });

  describe('getAllTags / getTagById', () => {
    test('should return all tags', async () => {
      await tagManager.createTag({ name: 'A' });
      await tagManager.createTag({ name: 'B' });

      const tags = await tagManager.getAllTags();
      expect(tags.length).toBe(2);
    });

    test('should return tag by id', async () => {
      const created = await tagManager.createTag({ name: 'FindMe' });

      const found = await tagManager.getTagById(created.id);
      expect(found.name).toBe('FindMe');
    });
  });

  describe('updateTag', () => {
    test('should update tag fields', async () => {
      const tag = await tagManager.createTag({ name: 'Old' });
      const updated = await tagManager.updateTag(tag.id, { name: 'New', color: '#10b981' });

      expect(updated.name).toBe('New');
      expect(updated.color).toBe('#10b981');
    });

    test('should reject updating to duplicate name', async () => {
      await tagManager.createTag({ name: 'A' });
      const tagB = await tagManager.createTag({ name: 'B' });

      await expect(tagManager.updateTag(tagB.id, { name: 'A' }))
        .rejects.toThrow('Tag "A" already exists');
    });

    test('should throw for non-existent tag', async () => {
      await expect(tagManager.updateTag(9999, { name: 'X' }))
        .rejects.toThrow('Tag with id 9999 not found');
    });
  });

  describe('deleteTag', () => {
    test('should delete a tag', async () => {
      const tag = await tagManager.createTag({ name: 'DeleteMe' });
      await tagManager.deleteTag(tag.id);

      const found = await tagManager.getTagById(tag.id);
      expect(found).toBeUndefined();
    });

    test('should throw for non-existent tag', async () => {
      await expect(tagManager.deleteTag(9999))
        .rejects.toThrow('Tag with id 9999 not found');
    });
  });

  describe('addTagsToIdea / removeTagFromIdea', () => {
    test('should add tags to an idea', async () => {
      const ideaId = await db.addIdea({ title: 'Test', content: '' });
      const tag1 = await tagManager.createTag({ name: 'Tag1' });
      const tag2 = await tagManager.createTag({ name: 'Tag2' });

      const updated = await tagManager.addTagsToIdea(ideaId, [tag1.id, tag2.id]);

      expect(updated.tagIds).toEqual([tag1.id, tag2.id]);

      const t1 = await tagManager.getTagById(tag1.id);
      const t2 = await tagManager.getTagById(tag2.id);
      expect(t1.count).toBe(1);
      expect(t2.count).toBe(1);
    });

    test('should not duplicate tag ids', async () => {
      const ideaId = await db.addIdea({ title: 'Test', content: '' });
      const tag = await tagManager.createTag({ name: 'Once' });

      await tagManager.addTagsToIdea(ideaId, [tag.id]);
      await tagManager.addTagsToIdea(ideaId, [tag.id]);

      const idea = await db.getIdea(ideaId);
      expect(idea.tagIds).toEqual([tag.id]);

      const t = await tagManager.getTagById(tag.id);
      expect(t.count).toBe(1);
    });

    test('should remove a tag from an idea', async () => {
      const ideaId = await db.addIdea({ title: 'Test', content: '' });
      const tag = await tagManager.createTag({ name: 'Remove' });

      await tagManager.addTagsToIdea(ideaId, [tag.id]);
      const updated = await tagManager.removeTagFromIdea(ideaId, tag.id);

      expect(updated.tagIds).toEqual([]);

      const t = await tagManager.getTagById(tag.id);
      expect(t.count).toBe(0);
    });

    test('should throw for non-existent idea', async () => {
      const tag = await tagManager.createTag({ name: 'Orphan' });
      await expect(tagManager.addTagsToIdea(9999, [tag.id]))
        .rejects.toThrow('Idea with id 9999 not found');
    });

    test('should throw for non-existent tag', async () => {
      const ideaId = await db.addIdea({ title: 'Test', content: '' });
      await expect(tagManager.addTagsToIdea(ideaId, [9999]))
        .rejects.toThrow('Tag with id 9999 not found');
    });
  });

  describe('getPopularTags', () => {
    test('should return tags sorted by count', async () => {
      const t1 = await tagManager.createTag({ name: 'Low' });
      const t2 = await tagManager.createTag({ name: 'High' });
      const t3 = await tagManager.createTag({ name: 'Medium' });

      const ideaId = await db.addIdea({ title: 'Test', content: '' });
      await tagManager.addTagsToIdea(ideaId, [t2.id]);
      await tagManager.addTagsToIdea(ideaId, [t3.id]);

      const ideaId2 = await db.addIdea({ title: 'Test2', content: '' });
      await tagManager.addTagsToIdea(ideaId2, [t2.id]);

      const popular = await tagManager.getPopularTags(10);

      expect(popular[0].name).toBe('High');
      expect(popular[0].count).toBe(2);
    });

    test('should respect limit parameter', async () => {
      for (let i = 0; i < 5; i++) {
        await tagManager.createTag({ name: `Tag${i}` });
      }

      const popular = await tagManager.getPopularTags(3);
      expect(popular.length).toBe(3);
    });
  });
});
