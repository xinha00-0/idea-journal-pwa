import { PageHelper } from './page-helper';

describe('完整应用集成', () => {
  let pageHelper;

  beforeEach(async () => {
    pageHelper = new PageHelper();
    await pageHelper.setup();
  });

  test('主界面应该可以访问', async () => {
    await pageHelper.goto('http://localhost:3000/#record');

    const title = await pageHelper.getTitle();
    expect(title).toContain('想法记录');
  });

  test('应该显示快速记录输入框', async () => {
    const input = await pageHelper.$('#quick-entry');
    expect(input).toBeDefined();
  });

  test('应该显示发布按钮', async () => {
    const btn = await pageHelper.$('#publish-btn');
    expect(btn).toBeDefined();
  });

  test('应该显示标签筛选栏', async () => {
    const chips = await pageHelper.$$('.tag-chip');
    expect(chips.length).toBeGreaterThan(0);
  });

  test('应该显示底部导航', async () => {
    const navItems = await pageHelper.$$('.nav-item');
    expect(navItems.length).toBeGreaterThan(0);
  });

  test('应该有全部标签', async () => {
    const allChip = await pageHelper.$('.tag-chip[data-tag="all"]');
    expect(allChip).toBeDefined();
  });

  test('应该能切换到回顾视图', async () => {
    await pageHelper.goto('http://localhost:3000/#review');

    const reviewSection = await pageHelper.$('#review-section');
    expect(reviewSection).toBeDefined();
  });

  test('应该能切换到统计视图', async () => {
    await pageHelper.goto('http://localhost:3000/#stats');

    const statsSection = await pageHelper.$('#stats-section');
    expect(statsSection).toBeDefined();
  });

  test('应该能切换到设置视图', async () => {
    await pageHelper.goto('http://localhost:3000/#settings');

    const settingsSection = await pageHelper.$('#settings-section');
    expect(settingsSection).toBeDefined();
  });

  test('统计视图应该包含图表容器', async () => {
    await pageHelper.goto('http://localhost:3000/#stats');

    const canvas = await pageHelper.$('#heatmap-canvas');
    expect(canvas).toBeDefined();
  });
});
