import { WeeklySummary } from '../../js/features/weekly-summary.js';

function makeIdea(title, content, tags, dateStr) {
  return {
    id: Math.random().toString(36).slice(2),
    title,
    content,
    tags: tags || [],
    created: new Date(dateStr + 'T12:00:00')
  };
}

describe('WeeklySummary', () => {
  let ws;
  const weekStart = '2025-01-06';
  const weekEnd = '2025-01-12';

  beforeEach(() => {
    ws = new WeeklySummary();
  });

  describe('generateWeeklyReport', () => {
    test('应返回空周报当没有想法', () => {
      const report = ws.generateWeeklyReport([], weekStart, weekEnd);
      expect(report.totalIdeas).toBe(0);
      expect(report.totalWords).toBe(0);
      expect(report.tags).toEqual([]);
      expect(report.keywords).toEqual([]);
      expect(report.summary).toBe('');
      expect(report.weekStart).toBe(weekStart);
      expect(report.weekEnd).toBe(weekEnd);
    });

    test('应正确统计想法数和字数', () => {
      const ideas = [
        makeIdea('标题1', '内容一二三', ['工作'], '2025-01-06'),
        makeIdea('标题2', '内容四五六七八九', ['学习'], '2025-01-08')
      ];
      const report = ws.generateWeeklyReport(ideas, weekStart, weekEnd);
      expect(report.totalIdeas).toBe(2);
      expect(report.totalWords).toBe(5 + 8);
    });

    test('应只包含日期范围内的想法', () => {
      const ideas = [
        makeIdea('范围内', '内容', [], '2025-01-07'),
        makeIdea('范围外', '内容', [], '2025-01-13')
      ];
      const report = ws.generateWeeklyReport(ideas, weekStart, weekEnd);
      expect(report.totalIdeas).toBe(1);
    });

    test('应包含洞察建议', () => {
      const ideas = [
        makeIdea('标题', '内容', ['工作'], '2025-01-06')
      ];
      const report = ws.generateWeeklyReport(ideas, weekStart, weekEnd);
      expect(report.insights.length).toBeGreaterThan(0);
    });
  });

  describe('getTopTags', () => {
    test('应返回空数组当没有想法', () => {
      expect(ws.getTopTags([])).toEqual([]);
    });

    test('应按频率排序返回标签', () => {
      const ideas = [
        { tags: ['工作', '重要'] },
        { tags: ['工作'] },
        { tags: ['学习', '重要'] },
        { tags: ['工作', '学习', '重要'] }
      ];
      const top = ws.getTopTags(ideas, 3);
      expect(top[0].name).toBe('工作');
      expect(top[0].count).toBe(3);
      expect(top[1].name).toBe('重要');
      expect(top[1].count).toBe(3);
      expect(top.length).toBe(3);
    });

    test('应受limit参数限制', () => {
      const ideas = [
        { tags: ['a'] }, { tags: ['b'] }, { tags: ['c'] }
      ];
      expect(ws.getTopTags(ideas, 2).length).toBe(2);
    });
  });

  describe('extractKeywords', () => {
    test('应返回空数组当内容为空', () => {
      expect(ws.extractKeywords('')).toEqual([]);
      expect(ws.extractKeywords(null)).toEqual([]);
    });

    test('应提取关键词并排序', () => {
      const content = '项目进度 项目规划 项目进度 项目规划 团队协作';
      const keywords = ws.extractKeywords(content);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords[0].word).toBe('项目进度');
    });

    test('应过滤停用词', () => {
      const keywords = ws.extractKeywords('这是一个很简单的测试');
      const words = keywords.map(k => k.word);
      expect(words).not.toContain('这是');
      expect(words).not.toContain('一个');
    });

    test('应忽略单字', () => {
      const keywords = ws.extractKeywords('a 测试 b');
      const words = keywords.map(k => k.word);
      expect(words).not.toContain('a');
      expect(words).not.toContain('b');
    });
  });

  describe('generateSummaryText', () => {
    test('应返回空字符串当没有想法', () => {
      expect(ws.generateSummaryText([])).toBe('');
    });

    test('应生成包含想法数的摘要', () => {
      const ideas = [makeIdea('想法A', '内容', [], '2025-01-06')];
      const summary = ws.generateSummaryText(ideas);
      expect(summary).toContain('1 条想法');
    });

    test('应包含标签和标题', () => {
      const ideas = [
        makeIdea('想法A', '内容', ['工作'], '2025-01-06'),
        makeIdea('想法B', '内容', ['工作'], '2025-01-07')
      ];
      const summary = ws.generateSummaryText(ideas);
      expect(summary).toContain('工作');
      expect(summary).toContain('想法A');
    });
  });

  describe('getDailyDistribution', () => {
    test('应填充日期范围内每天', () => {
      const dist = ws.getDailyDistribution([], weekStart, weekEnd);
      const days = Object.keys(dist);
      expect(days.length).toBe(7);
      expect(days[0]).toBe('2025-01-06');
      expect(days[6]).toBe('2025-01-12');
    });

    test('应正确统计每日想法数', () => {
      const ideas = [
        makeIdea('a', '', [], '2025-01-06'),
        makeIdea('b', '', [], '2025-01-06'),
        makeIdea('c', '', [], '2025-01-08')
      ];
      const dist = ws.getDailyDistribution(ideas, weekStart, weekEnd);
      expect(dist['2025-01-06']).toBe(2);
      expect(dist['2025-01-07']).toBe(0);
      expect(dist['2025-01-08']).toBe(1);
    });
  });

  describe('getInsights', () => {
    test('应提示无记录当想法数为0', () => {
      const report = { totalIdeas: 0, totalWords: 0, tags: [], keywords: [], dailyDistribution: {} };
      const insights = ws.getInsights(report);
      expect(insights).toContain('本周暂无记录，试着每天记录一个想法吧');
    });

    test('应给出积极反馈当记录>=7条', () => {
      const report = {
        totalIdeas: 7,
        totalWords: 50,
        tags: [],
        keywords: [],
        dailyDistribution: { '2025-01-06': 1, '2025-01-07': 1, '2025-01-08': 1, '2025-01-09': 1, '2025-01-10': 1, '2025-01-11': 1, '2025-01-12': 1 }
      };
      const insights = ws.getInsights(report);
      expect(insights).toContain('坚持每天记录想法，保持了良好的记录习惯');
    });

    test('应提示最活跃标签', () => {
      const report = {
        totalIdeas: 3,
        totalWords: 50,
        tags: [{ name: '工作', count: 5 }],
        keywords: [],
        dailyDistribution: { '2025-01-06': 1, '2025-01-07': 0, '2025-01-08': 1, '2025-01-09': 0, '2025-01-10': 1, '2025-01-11': 0, '2025-01-12': 0 }
      };
      const insights = ws.getInsights(report);
      expect(insights.some(i => i.includes('工作'))).toBe(true);
    });

    test('应提示丰富内容当字数>1000', () => {
      const report = {
        totalIdeas: 3,
        totalWords: 1500,
        tags: [],
        keywords: [],
        dailyDistribution: { '2025-01-06': 1, '2025-01-07': 1, '2025-01-08': 1, '2025-01-09': 0, '2025-01-10': 0, '2025-01-11': 0, '2025-01-12': 0 }
      };
      const insights = ws.getInsights(report);
      expect(insights).toContain('记录内容丰富，思考深入');
    });
  });
});
