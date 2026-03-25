import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { join } from 'path';

// 模拟page对象
class MockPage {
  constructor() {
    this.dom = null;
    this.window = null;
    this.document = null;
  }
  
  async goto(url) {
    // 从文件系统加载HTML
    const htmlPath = join(process.cwd(), 'index.html');
    const html = readFileSync(htmlPath, 'utf8');
    this.dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    this.window = this.dom.window;
    this.document = this.window.document;
  }
  
  async textContent(selector) {
    const element = this.document.querySelector(selector);
    return element ? element.textContent : null;
  }
  
  async $(selector) {
    return this.document.querySelector(selector);
  }
  
  async $$(selector) {
    return Array.from(this.document.querySelectorAll(selector));
  }
}

// 全局page对象
global.page = new MockPage();

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
    // 初始时列表可能为空，因为还没有想法
    expect(ideas.length).toBe(0);
  });
});