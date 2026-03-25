import { DataExporter } from '../../js/storage/export.js';
import { DataImporter } from '../../js/storage/import.js';
import { IdeaDatabase } from '../../js/storage/database.js';
import { indexedDB } from 'fake-indexeddb';

global.indexedDB = indexedDB;

if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

describe('Data Exporter and Importer', () => {
  let exporter;
  let importer;
  let db;
  
  beforeEach(async () => {
    db = new IdeaDatabase();
    await db.init();
    exporter = new DataExporter();
    importer = new DataImporter(db);
  });
  
  afterEach(async () => {
    await db.clear();
  });
  
  test('应该导出为JSON格式', async () => {
    await db.addIdea({
      title: '测试想法',
      content: '测试内容',
      tags: ['测试'],
      created: new Date()
    });
    
    const ideas = await db.getAllIdeas();
    const json = exporter.toJSON(ideas);
    
    const parsed = JSON.parse(json);
    expect(parsed).toBeInstanceOf(Array);
    expect(parsed.length).toBe(1);
    expect(parsed[0].title).toBe('测试想法');
    expect(parsed[0].content).toBe('测试内容');
  });
  
  test('应该导出为Markdown格式', async () => {
    await db.addIdea({
      title: '测试想法',
      content: '测试内容',
      tags: ['测试'],
      created: new Date('2024-01-01')
    });
    
    const ideas = await db.getAllIdeas();
    const markdown = exporter.toMarkdown(ideas);
    
    expect(markdown).toContain('# 想法导出');
    expect(markdown).toContain('## 测试想法');
    expect(markdown).toContain('测试内容');
    expect(markdown).toContain('- 测试');
  });
  
  test('应该创建下载链接', async () => {
    await db.addIdea({
      title: '测试想法',
      content: '测试内容',
      tags: ['测试'],
      created: new Date()
    });
    
    const ideas = await db.getAllIdeas();
    const json = exporter.toJSON(ideas);
    
    const url = exporter.createDownloadLink(json, 'test.json', 'application/json');
    
    expect(url).toMatch(/^blob:/);
    URL.revokeObjectURL(url);
  });
  
  test('应该从JSON导入', async () => {
    const content = JSON.stringify({
      ideas: [{ title: '导入想法1', content: '内容1', tags: ['标签1'], created: new Date() }]
    });
    
    const jsonFile = new File([content], 'import.json', { type: 'application/json' });
    const count = await importer.importFile(jsonFile);
    
    expect(count).toBe(1);
    
    const savedIdeas = await db.getAllIdeas();
    expect(savedIdeas.length).toBe(1);
    expect(savedIdeas[0].title).toBe('导入想法1');
  });
  
  test('应该从Markdown导入', async () => {
    const content = `# 想法导出

## 导入想法1

测试内容1

### 标签

- 标签1
`;
    const mdFile = new File([content], 'import.md', { type: 'text/markdown' });
    const count = await importer.importFile(mdFile);
    
    expect(count).toBe(1);
    
    const savedIdeas = await db.getAllIdeas();
    expect(savedIdeas[0].title).toBe('导入想法1');
    expect(savedIdeas[0].content).toContain('测试内容1');
  });
});
