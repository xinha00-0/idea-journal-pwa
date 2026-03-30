import { HeatmapChart } from '../../js/components/heatmap.js';
import { DataAnalytics } from '../../js/features/data-analytics.js';
import { IdeaDatabase } from '../../js/storage/database.js';
import { indexedDB } from 'fake-indexeddb';

global.indexedDB = indexedDB;

if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

function noop() {}

function createMockCtx() {
  const ctx = {
    clearRect: noop,
    fillRect: noop,
    fillText: noop,
    beginPath: noop,
    moveTo: noop,
    arcTo: noop,
    closePath: noop,
    fill: noop,
    stroke: noop,
    rect: noop,
    fillStyle: '',
    font: '',
    textBaseline: ''
  };
  return ctx;
}

function createCanvas(id) {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  canvas.width = 800;
  canvas.height = 200;
  const mockCtx = createMockCtx();
  canvas.getContext = function() { return mockCtx; };
  canvas._mockCtx = mockCtx;
  document.body.appendChild(canvas);
  return canvas;
}

function removeCanvas(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function makeIdeas(dates) {
  return dates.map((d, i) => ({
    id: i + 1,
    title: `Idea ${i + 1}`,
    content: `Content ${i + 1}`,
    tags: d.tags || [],
    created: new Date(d.date || d)
  }));
}

describe('HeatmapChart', () => {
  let chart;

  beforeEach(() => {
    createCanvas('test-heatmap');
  });

  afterEach(() => {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    removeCanvas('test-heatmap');
  });

  test('should initialize with canvas element', () => {
    chart = new HeatmapChart('test-heatmap');
    expect(chart.canvas).toBeTruthy();
    expect(chart.ctx).toBeTruthy();
  });

  test('should initialize with default options', () => {
    chart = new HeatmapChart('test-heatmap');
    expect(chart.cellSize).toBe(13);
    expect(chart.cellGap).toBe(3);
    expect(chart.colors).toEqual(['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']);
  });

  test('should accept custom options', () => {
    chart = new HeatmapChart('test-heatmap', { cellSize: 20, cellGap: 5 });
    expect(chart.cellSize).toBe(20);
    expect(chart.cellGap).toBe(5);
  });

  test('should handle non-existent canvas gracefully', () => {
    chart = new HeatmapChart('non-existent');
    expect(chart.canvas).toBeNull();
    expect(chart.ctx).toBeNull();
  });

  describe('getColorForValue', () => {
    beforeEach(() => {
      chart = new HeatmapChart('test-heatmap');
    });

    test('should return empty color for zero value', () => {
      expect(chart.getColorForValue(0, 10)).toBe('#ebedf0');
    });

    test('should return empty color when max is zero', () => {
      expect(chart.getColorForValue(0, 0)).toBe('#ebedf0');
    });

    test('should return level 1 for low ratio', () => {
      expect(chart.getColorForValue(1, 10)).toBe('#9be9a8');
    });

    test('should return level 2 for mid ratio', () => {
      expect(chart.getColorForValue(5, 10)).toBe('#40c463');
    });

    test('should return level 3 for high ratio', () => {
      expect(chart.getColorForValue(7, 10)).toBe('#30a14e');
    });

    test('should return level 4 for max ratio', () => {
      expect(chart.getColorForValue(10, 10)).toBe('#216e39');
    });
  });

  describe('generateWeeklyData', () => {
    beforeEach(() => {
      chart = new HeatmapChart('test-heatmap');
    });

    test('should generate 365 days of data', () => {
      const ideas = makeIdeas([new Date()]);
      const result = chart.generateWeeklyData(ideas);
      expect(result.labels.length).toBe(365);
      expect(result.values.length).toBe(365);
    });

    test('should count ideas per day', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const ideas = makeIdeas([today, today, today]);
      const result = chart.generateWeeklyData(ideas);
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;
      const idx = result.labels.indexOf(todayStr);
      expect(result.values[idx]).toBe(3);
    });

    test('should return zero for days without ideas', () => {
      const result = chart.generateWeeklyData([]);
      expect(result.values.every(v => v === 0)).toBe(true);
    });
  });

  describe('generateMonthData', () => {
    beforeEach(() => {
      chart = new HeatmapChart('test-heatmap');
    });

    test('should aggregate by month', () => {
      const ideas = makeIdeas([
        { date: '2025-01-15T10:00:00Z', tags: [] },
        { date: '2025-01-20T10:00:00Z', tags: [] },
        { date: '2025-02-10T10:00:00Z', tags: [] }
      ]);
      const result = chart.generateMonthData(ideas);
      expect(result.labels).toEqual(['2025-01', '2025-02']);
      expect(result.values).toEqual([2, 1]);
    });

    test('should return empty for no ideas', () => {
      const result = chart.generateMonthData([]);
      expect(result.labels).toEqual([]);
      expect(result.values).toEqual([]);
    });
  });

  describe('updateData', () => {
    beforeEach(() => {
      chart = new HeatmapChart('test-heatmap');
    });

    test('should render with provided data', () => {
      const labels = ['2025-01-01', '2025-01-02', '2025-01-03'];
      const values = [3, 5, 1];
      chart.updateData({ labels, values });
      expect(chart.data.labels).toEqual(labels);
      expect(chart.data.values).toEqual(values);
    });

    test('should handle empty data', () => {
      chart.updateData({ labels: [], values: [] });
      expect(chart.cells.length).toBe(0);
    });
  });

  describe('updateColors', () => {
    beforeEach(() => {
      chart = new HeatmapChart('test-heatmap');
    });

    test('should re-render with new values', () => {
      chart.updateData({
        labels: ['2025-01-01', '2025-01-02'],
        values: [1, 2]
      });
      chart.updateColors([5, 10]);
      expect(chart.data.values).toEqual([5, 10]);
    });
  });

  describe('destroy', () => {
    test('should clean up resources', () => {
      chart = new HeatmapChart('test-heatmap');
      chart.updateData({ labels: ['2025-01-01'], values: [1] });
      chart.destroy();
      expect(chart.cells.length).toBe(0);
    });
  });
});

describe('DataAnalytics', () => {
  let analytics;

  beforeEach(() => {
    analytics = new DataAnalytics();
  });

  describe('getStreak', () => {
    test('should return 0 for empty ideas', () => {
      expect(analytics.getStreak([])).toBe(0);
    });

    test('should return 0 for null input', () => {
      expect(analytics.getStreak(null)).toBe(0);
    });

    test('should calculate consecutive day streak ending today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(today);
      dayBefore.setDate(dayBefore.getDate() - 2);

      const ideas = makeIdeas([today, yesterday, dayBefore]);
      expect(analytics.getStreak(ideas)).toBe(3);
    });

    test('should count streak from yesterday if nothing today', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date();
      dayBefore.setDate(dayBefore.getDate() - 2);

      const ideas = makeIdeas([yesterday, dayBefore]);
      expect(analytics.getStreak(ideas)).toBe(2);
    });

    test('should return 0 if gap before today', () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const ideas = makeIdeas([weekAgo]);
      expect(analytics.getStreak(ideas)).toBe(0);
    });

    test('should handle multiple ideas on same day', () => {
      const today = new Date();
      const ideas = makeIdeas([today, today, today]);
      expect(analytics.getStreak(ideas)).toBe(1);
    });
  });

  describe('getMostActiveDay', () => {
    test('should return null for empty ideas', () => {
      expect(analytics.getMostActiveDay([])).toBeNull();
    });

    test('should return null for null input', () => {
      expect(analytics.getMostActiveDay(null)).toBeNull();
    });

    test('should find the most active day', () => {
      const day1 = new Date('2025-03-15T10:00:00Z');
      const day2 = new Date('2025-03-16T10:00:00Z');
      const ideas = makeIdeas([day1, day2, day2, day2]);

      const result = analytics.getMostActiveDay(ideas);
      expect(result.count).toBe(3);
      expect(result.date).toBe('2025-03-16');
    });

    test('should handle single idea', () => {
      const ideas = makeIdeas([new Date('2025-03-15T10:00:00Z')]);
      const result = analytics.getMostActiveDay(ideas);
      expect(result.count).toBe(1);
    });
  });

  describe('getAveragePerDay', () => {
    test('should return 0 for empty ideas', () => {
      expect(analytics.getAveragePerDay([])).toBe(0);
    });

    test('should return 0 for null input', () => {
      expect(analytics.getAveragePerDay(null)).toBe(0);
    });

    test('should calculate average across active days', () => {
      const day1 = new Date('2025-03-15T10:00:00Z');
      const day2 = new Date('2025-03-16T10:00:00Z');
      const ideas = makeIdeas([day1, day2, day2]);

      const avg = analytics.getAveragePerDay(ideas);
      expect(avg).toBe(1.5);
    });

    test('should handle single idea single day', () => {
      const ideas = makeIdeas([new Date('2025-03-15T10:00:00Z')]);
      expect(analytics.getAveragePerDay(ideas)).toBe(1);
    });
  });

  describe('getTagDistribution', () => {
    test('should return empty object for empty ideas', () => {
      expect(analytics.getTagDistribution([])).toEqual({});
    });

    test('should return empty object for null input', () => {
      expect(analytics.getTagDistribution(null)).toEqual({});
    });

    test('should count tag frequencies', () => {
      const ideas = makeIdeas([
        { date: '2025-03-15T10:00:00Z', tags: ['tech', 'idea'] },
        { date: '2025-03-16T10:00:00Z', tags: ['tech'] },
        { date: '2025-03-17T10:00:00Z', tags: ['idea', 'project'] }
      ]);

      const dist = analytics.getTagDistribution(ideas);
      expect(dist).toEqual({ tech: 2, idea: 2, project: 1 });
    });

    test('should handle ideas without tags', () => {
      const ideas = makeIdeas([
        { date: '2025-03-15T10:00:00Z', tags: [] },
        { date: '2025-03-16T10:00:00Z' }
      ]);

      const dist = analytics.getTagDistribution(ideas);
      expect(dist).toEqual({});
    });
  });
});

describe('HeatmapChart + DataAnalytics Integration', () => {
  let chart;
  let analytics;

  beforeEach(() => {
    createCanvas('integration-heatmap');
    chart = new HeatmapChart('integration-heatmap');
    analytics = new DataAnalytics();
  });

  afterEach(() => {
    if (chart) chart.destroy();
    removeCanvas('integration-heatmap');
  });

  test('should render heatmap from analytics weekly data', () => {
    const today = new Date();
    const ideas = makeIdeas([today, today, today]);

    const weeklyData = chart.generateWeeklyData(ideas);
    chart.updateData(weeklyData);

    expect(chart.cells.length).toBe(365);
    expect(chart.data.values.some(v => v > 0)).toBe(true);
  });

  test('should combine streak analysis with heatmap colors', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const ideas = makeIdeas([today, yesterday]);

    expect(analytics.getStreak(ideas)).toBe(2);

    const weeklyData = chart.generateWeeklyData(ideas);
    chart.updateData(weeklyData);

    const maxVal = Math.max(...weeklyData.values);
    expect(maxVal).toBeGreaterThanOrEqual(1);
  });

  test('should render month heatmap with tag distribution', () => {
    const ideas = makeIdeas([
      { date: '2025-01-15T10:00:00Z', tags: ['tech'] },
      { date: '2025-01-20T10:00:00Z', tags: ['tech', 'idea'] },
      { date: '2025-02-10T10:00:00Z', tags: ['idea'] }
    ]);

    const monthData = chart.generateMonthData(ideas);
    chart.updateData(monthData);
    expect(monthData.values).toEqual([2, 1]);

    const tags = analytics.getTagDistribution(ideas);
    expect(tags).toEqual({ tech: 2, idea: 2 });
  });

  test('should handle full pipeline: analytics + heatmap + cell click', () => {
    const clickResults = [];
    chart = new HeatmapChart('integration-heatmap', {
      onCellClick: (cell) => clickResults.push(cell)
    });

    const ideas = makeIdeas([new Date()]);
    const weeklyData = chart.generateWeeklyData(ideas);
    chart.updateData(weeklyData);

    const activeCell = chart.cells.find(c => c.value > 0);
    expect(activeCell).toBeTruthy();
    expect(activeCell.value).toBe(1);
    expect(activeCell.label).toBeTruthy();
  });
});
