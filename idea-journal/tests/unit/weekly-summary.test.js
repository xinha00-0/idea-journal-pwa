import { WeeklySummary } from '../../js/features/weekly-summary.js';
import { IdeaDatabase } from '../../js/storage/database.js';
import { indexedDB } from 'fake-indexeddb';

global.indexedDB = indexedDB;

if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

describe('WeeklySummary', () => {
  let summary;
  let db;
  
  beforeEach(async () => {
    db = new IdeaDatabase();
    await db.init();
    summary = new WeeklySummary();
  });
  
  afterEach(async () => {
    await db.clear();
  });
  
  test('应该生成周报摘要', async () => {
    const ideas = [
      { created: new Date('2024-01-01'), title: '想法1', content: '内容1', tags: ['标签1'], category: '工作' },
      { created: new Date('2024-01-02'), title: '想法2', content: '内容2', tags: ['标签2'], category: '工作' },
      { created: new Date('2024-01-03'), title: '想法3', content: '内容3', tags: ['标签1'], category: '生活' },
      { created: new Date('2024-01-04'), title: '想法4', content: '内容4', tags: ['标签3'], category: '旅行' }
    ];
    
    await db.addIdea(ideas[0]);
    await db.addIdea(ideas[1]);
    await db.addIdea(ideas[2]);
    await db.addIdea(ideas[3]);
    
    const weekStart = new Date('2024-01-01');
    const weekEnd = new Date('2024-01-07T23:59:59');
    
    const report = await summary.generateWeeklyReport(ideas, weekStart, weekEnd);
    
    expect(report.totalIdeas).toBe(4);
    expect(report.weekStart.toISOString()).toBe(weekStart.toISOString());
    expect(report.weekEnd.toISOString()).toBe(weekEnd.toISOString());
  });
  
  test('应该提取关键词', () => {
    const content = '这是一个关于产品改进的想法';
    const keywords = summary.extractKeywords(content);
    expect(keywords).toContain('产品');
    expect(keywords).toContain('改进');
    expect(keywords).toContain('想法');
  });
  
  test('应该生成摘要文本', () => {
    const ideas = [
      { content: '产品需要改进' },
      { content: '考虑引入Atomic Notes模式' },
      { content: '用户界面需要优化' }
    ];
    
    const summaryText = summary.generateSummaryText(ideas);
    
    expect(summaryText).toContain('产品需要改进');
    expect(summaryText).toContain('考虑引入Atomic Notes');
    expect(summaryText).toContain('用户界面需要优化');
  });
});
