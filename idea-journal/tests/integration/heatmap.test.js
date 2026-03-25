import { HeatmapChart } from '../../js/components/heatmap.js';
import { IdeaDatabase } from '../../js/storage/database.js';

describe('HeatmapChart', () => {
  let heatmap;
  let db;
  let canvas;

  beforeEach(async () => {
    document.body.innerHTML = '<canvas id="heatmap"></canvas>';
    canvas = document.getElementById('heatmap');
    heatmap = new HeatmapChart('heatmap');
    db = new IdeaDatabase();
    await db.init();
  });

  test('应该只返回最近7天的数据', async () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    // 创建跨越20天的想法
    const ideas = [];
    for (let i = 20; i >= 1; i--) {
      const created = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      ideas.push({
        created: created,
        title: `想法${i}`,
        content: `内容${i}`,
        tags: [],
        id: i
      });
    }
    
    const weeklyData = heatmap.generateWeeklyData(ideas);
    
    // 验证：只有最近7天的数据（>= sevenDaysAgo）
    const dates = Object.keys(weeklyData);
    dates.forEach(date => {
      const dateObj = new Date(date);
      expect(dateObj.getTime()).toBeGreaterThanOrEqual(sevenDaysAgo.getTime() - 24 * 60 * 60 * 1000);
    });
    
    // 验证数据量不超过7天
    expect(dates.length).toBeLessThanOrEqual(7);
  });

  test('应该按日期聚合想法数量', async () => {
    const now = new Date();
    
    // 创建3天的想法，同一天有多个想法
    const ideas = [
      { created: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), title: '想法1' },
      { created: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), title: '想法2' },
      { created: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), title: '想法3' },
      { created: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), title: '想法4' }
    ];
    
    const weeklyData = heatmap.generateWeeklyData(ideas);
    
    const values = Object.values(weeklyData);
    expect(values).toContain(2); // 第一天有2个想法
    expect(values).toContain(1); // 其他天各有1个想法
  });

  test('日期应该按升序排列', () => {
    const now = new Date();
    const ideas = [
      { created: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), title: '想法1' },
      { created: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), title: '想法2' },
      { created: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), title: '想法3' }
    ];
    
    const weeklyData = heatmap.generateWeeklyData(ideas);
    const dates = Object.keys(weeklyData);
    
    // 验证日期是升序的
    for (let i = 1; i < dates.length; i++) {
      expect(new Date(dates[i]).getTime()).toBeGreaterThan(new Date(dates[i-1]).getTime());
    }
  });

  test('空想法数组应返回空对象', () => {
    const weeklyData = heatmap.generateWeeklyData([]);
    expect(weeklyData).toEqual({});
  });

  test('应该忽略7天前的数据', () => {
    const now = new Date();
    const ideas = [
      { created: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), title: '最近想法' },
      { created: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), title: '旧想法' }
    ];
    
    const weeklyData = heatmap.generateWeeklyData(ideas);
    
    // 只有1个日期（最近的想法）
    expect(Object.keys(weeklyData).length).toBe(1);
  });
});
