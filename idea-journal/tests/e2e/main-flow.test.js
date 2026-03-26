describe('主界面流程', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:3000');
  });
  
  test('应该显示标题', async () => {
    const title = await page.textContent('h1');
    expect(title).toBe('想法记录');
  });
  
  test('应该显示快速记录输入框', async () => {
    const input = await page.$('#quick-entry');
    expect(input).toBeDefined();
  });
  
  test('应该显示标签筛选栏', async () => {
    const chips = await page.$$('.tag-chip');
    expect(chips.length).toBeGreaterThan(0);
  });
  
  test('应该显示想法列表', async () => {
    const ideas = await page.$$('.idea-card');
    expect(ideas.length).toBeGreaterThan(0);
  });
});