import { indexedDB } from 'fake-indexeddb';

global.indexedDB = indexedDB;

if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

describe('Offline functionality', () => {
  let IdeaDatabase;
  let DataExporter;
  let DataImporter;

  beforeAll(async () => {
    const dbModule = await import('../../js/storage/database.js');
    IdeaDatabase = dbModule.IdeaDatabase;
    const exportModule = await import('../../js/storage/export.js');
    DataExporter = exportModule.DataExporter;
    const importModule = await import('../../js/storage/import.js');
    DataImporter = importModule.DataImporter;
  });

  describe('Database offline operations', () => {
    let db;

    beforeEach(async () => {
      db = new IdeaDatabase();
      await db.init();
      await db.clear();
      await db.clearTags();
    });

    test('should add and retrieve idea without network', async () => {
      const idea = {
        title: 'Offline idea',
        content: 'This was recorded offline',
        tags: ['offline'],
        created: new Date()
      };

      const id = await db.addIdea(idea);
      expect(id).toBeDefined();

      const retrieved = await db.getIdea(id);
      expect(retrieved).toBeDefined();
      expect(retrieved.title).toBe('Offline idea');
      expect(retrieved.content).toBe('This was recorded offline');
    });

    test('should update idea offline', async () => {
      const idea = {
        title: 'Original',
        content: 'Original content',
        tags: [],
        created: new Date()
      };
      const id = await db.addIdea(idea);

      idea.id = id;
      idea.title = 'Updated title';
      await db.updateIdea(idea);

      const updated = await db.getIdea(id);
      expect(updated.title).toBe('Updated title');
    });

    test('should delete idea offline', async () => {
      const idea = {
        title: 'To delete',
        content: 'content',
        tags: [],
        created: new Date()
      };
      const id = await db.addIdea(idea);
      await db.deleteIdea(id);

      const deleted = await db.getIdea(id);
      expect(deleted).toBeUndefined();
    });

    test('should get all ideas offline', async () => {
      for (let i = 0; i < 5; i++) {
        await db.addIdea({
          title: `Idea ${i}`,
          content: `Content ${i}`,
          tags: [],
          created: new Date()
        });
      }

      const all = await db.getAllIdeas();
      expect(all.length).toBe(5);
    });

    test('should persist tags offline', async () => {
      const tag = { name: 'offline-tag', color: '#ff0000', count: 0, created: new Date() };
      const id = await db.addTag(tag);

      const retrieved = await db.getTag(id);
      expect(retrieved.name).toBe('offline-tag');
      expect(retrieved.color).toBe('#ff0000');

      const allTags = await db.getAllTags();
      expect(allTags.length).toBe(1);
    });
  });

  describe('Export/Import offline', () => {
    test('should export to JSON without network', () => {
      const exporter = new DataExporter();
      const ideas = [
        { title: 'Test', content: 'Content', tags: ['a'], created: new Date() }
      ];

      const json = exporter.toJSON(ideas);
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe('1.0');
      expect(parsed.ideas.length).toBe(1);
      expect(parsed.ideas[0].title).toBe('Test');
    });

    test('should export to Markdown without network', () => {
      const exporter = new DataExporter();
      const ideas = [
        { title: 'Markdown Test', content: 'Some content', tags: ['test'], created: new Date() }
      ];

      const md = exporter.toMarkdown(ideas);
      expect(md).toContain('# 想法记录导出');
      expect(md).toContain('## Markdown Test');
      expect(md).toContain('Some content');
    });

    test('should import from JSON without network', () => {
      const importer = new DataImporter();
      const json = JSON.stringify({
        version: '1.0',
        ideas: [
          { title: 'Imported', content: 'Imported content', tags: ['imported'], created: new Date().toISOString() }
        ]
      });

      const ideas = importer.importJSON(json);
      expect(ideas.length).toBe(1);
      expect(ideas[0].title).toBe('Imported');
    });

    test('should import from Markdown without network', () => {
      const importer = new DataImporter();
      const md = `## Test Idea

> 创建时间: 2024/01/01 12:00:00

**标签:** test, offline

This is the content.`;

      const ideas = importer.importMarkdown(md);
      expect(ideas.length).toBeGreaterThanOrEqual(1);
    });

    test('should round-trip export and import', () => {
      const exporter = new DataExporter();
      const importer = new DataImporter();

      const original = [
        { title: 'Round Trip', content: 'Test round trip', tags: ['rt'], created: new Date().toISOString() }
      ];

      const json = exporter.toJSON(original);
      const imported = importer.importJSON(json);
      expect(imported.length).toBe(1);
      expect(imported[0].title).toBe('Round Trip');
      expect(imported[0].content).toBe('Test round trip');
    });
  });

  describe('Service Worker registration', () => {
    test('should handle missing service worker gracefully', () => {
      const originalSW = navigator.serviceWorker;
      delete navigator.serviceWorker;

      expect(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js');
        }
      }).not.toThrow();

      Object.defineProperty(navigator, 'serviceWorker', { value: originalSW, configurable: true });
    });
  });

  describe('LocalStorage drafts offline', () => {
    test('should save and load draft from localStorage', () => {
      const key = 'idea-journal-draft-test';
      const data = { content: 'Offline draft content', timestamp: Date.now() };

      localStorage.setItem(key, JSON.stringify(data));
      const loaded = JSON.parse(localStorage.getItem(key));

      expect(loaded.content).toBe('Offline draft content');
      expect(typeof loaded.timestamp).toBe('number');

      localStorage.removeItem(key);
    });

    test('should handle expired drafts', () => {
      const key = 'idea-journal-draft-test-expired';
      const expiredData = { content: 'Old content', timestamp: Date.now() - 25 * 60 * 60 * 1000 };

      localStorage.setItem(key, JSON.stringify(expiredData));
      const loaded = JSON.parse(localStorage.getItem(key));

      const age = Date.now() - loaded.timestamp;
      expect(age > 24 * 60 * 60 * 1000).toBe(true);

      localStorage.removeItem(key);
    });
  });
});
