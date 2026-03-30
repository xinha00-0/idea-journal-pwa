import { ThemeManager } from '../../www/js/features/theme-manager.js';
import { DataManager } from '../../www/js/features/data-manager.js';
import { IdeaDatabase } from '../../www/js/storage/database.js';
import { SettingsComponent } from '../../www/js/components/settings.js';
import { indexedDB } from 'fake-indexeddb';

global.indexedDB = indexedDB;
if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

describe('ThemeManager', () => {
  let themeManager;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    themeManager = new ThemeManager();
  });

  test('默认主题为 light', () => {
    expect(themeManager.getTheme()).toBe('light');
  });

  test('setTheme 设置主题并持久化', () => {
    themeManager.setTheme('dark');
    expect(themeManager.getTheme()).toBe('dark');
    expect(localStorage.getItem('app-theme')).toBe('dark');
  });

  test('toggleTheme 切换主题', () => {
    expect(themeManager.getTheme()).toBe('light');
    const result = themeManager.toggleTheme();
    expect(result).toBe('dark');
    expect(themeManager.getTheme()).toBe('dark');
  });

  test('toggleTheme 来回切换', () => {
    themeManager.toggleTheme();
    expect(themeManager.getTheme()).toBe('dark');
    themeManager.toggleTheme();
    expect(themeManager.getTheme()).toBe('light');
  });

  test('applyTheme 添加 dark class', () => {
    themeManager.setTheme('dark');
    themeManager.applyTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('applyTheme 移除 dark class', () => {
    document.documentElement.classList.add('dark');
    themeManager.setTheme('light');
    themeManager.applyTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('getSavedTheme 返回 localStorage 值', () => {
    localStorage.setItem('app-theme', 'dark');
    expect(themeManager.getSavedTheme()).toBe('dark');
  });

  test('getSavedTheme 无值返回 null', () => {
    expect(themeManager.getSavedTheme()).toBeNull();
  });

  test('watchSystemTheme 监听系统主题变化', () => {
    let capturedCallback = null;
    const mockMatchMedia = {
      addEventListener(event, cb) { capturedCallback = cb; }
    };
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = () => mockMatchMedia;

    themeManager.watchSystemTheme();
    expect(capturedCallback).toBeDefined();

    window.matchMedia = originalMatchMedia;
  });

  test('从 localStorage 恢复主题', () => {
    localStorage.setItem('app-theme', 'dark');
    const tm = new ThemeManager();
    expect(tm.getTheme()).toBe('dark');
  });
});

describe('DataManager', () => {
  let db;
  let dataManager;

  beforeEach(async () => {
    db = new IdeaDatabase();
    await db.init();
    dataManager = new DataManager(db);
  });

  afterEach(async () => {
    await db.clear();
    await db.clearTags();
    await db.clearCategories();
  });

  test('getStorageInfo 返回正确的统计信息', async () => {
    await db.addIdea({ title: '想法1', content: '内容1', created: new Date() });
    await db.addIdea({ title: '想法2', content: '内容2', created: new Date() });
    await db.addTag({ name: '标签1' });
    await db.addCategory({ name: '分类1' });

    const info = await dataManager.getStorageInfo();
    expect(info.ideasCount).toBe(2);
    expect(info.tagsCount).toBe(1);
    expect(info.categoriesCount).toBe(1);
    expect(info.formattedSize).toBeDefined();
    expect(typeof info.totalSize).toBe('number');
  });

  test('getStorageInfo 空数据库', async () => {
    const info = await dataManager.getStorageInfo();
    expect(info.ideasCount).toBe(0);
    expect(info.tagsCount).toBe(0);
    expect(info.categoriesCount).toBe(0);
    expect(info.formattedSize).toBeDefined();
  });

  test('formatBytes 格式化正确', () => {
    expect(dataManager.formatBytes(0)).toBe('0 Bytes');
    expect(dataManager.formatBytes(500)).toBe('500.00 Bytes');
    expect(dataManager.formatBytes(1024)).toBe('1.00 KB');
    expect(dataManager.formatBytes(1048576)).toBe('1.00 MB');
  });

  test('clearOldData 清理指定天数前的数据', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 400);
    const recentDate = new Date();

    await db.addIdea({ title: '旧想法', content: '旧', created: oldDate });
    await db.addIdea({ title: '新想法', content: '新', created: recentDate });

    const count = await dataManager.clearOldData(365);
    expect(count).toBe(1);

    const remaining = await dataManager.getAllIdeas();
    expect(remaining.length).toBe(1);
    expect(remaining[0].title).toBe('新想法');
  });

  test('clearOldData 无旧数据', async () => {
    await db.addIdea({ title: '新想法', content: '新', created: new Date() });
    const count = await dataManager.clearOldData(365);
    expect(count).toBe(0);
  });

  test('backupData 创建完整备份', async () => {
    await db.addIdea({ title: '想法1', content: '内容', created: new Date() });
    await db.addTag({ name: '标签1' });
    await db.addCategory({ name: '分类1', order: 1 });

    const backup = await dataManager.backupData();
    expect(backup.version).toBe(1);
    expect(backup.timestamp).toBeDefined();
    expect(backup.data.ideas.length).toBe(1);
    expect(backup.data.tags.length).toBe(1);
    expect(backup.data.categories.length).toBe(1);
  });

  test('restoreData 恢复备份', async () => {
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        ideas: [{ title: '恢复的想法', content: '内容', created: new Date().toISOString() }],
        tags: [{ name: '恢复的标签' }],
        categories: [{ name: '恢复的分类', order: 1 }]
      }
    };

    const result = await dataManager.restoreData(JSON.stringify(backup));
    expect(result).toBe(true);

    const ideas = await db.getAllIdeas();
    expect(ideas.length).toBe(1);
    expect(ideas[0].title).toBe('恢复的想法');
  });

  test('restoreData 无效版本号抛出错误', async () => {
    const backup = {
      version: 999,
      data: { ideas: [], tags: [], categories: [] }
    };

    await expect(dataManager.restoreData(JSON.stringify(backup)))
      .rejects.toThrow('恢复失败');
  });

  test('restoreData 无效JSON抛出错误', async () => {
    await expect(dataManager.restoreData('not json'))
      .rejects.toThrow('恢复失败');
  });

  test('getAllIdeas 返回所有想法', async () => {
    await db.addIdea({ title: '想法1', content: '' });
    await db.addIdea({ title: '想法2', content: '' });

    const ideas = await dataManager.getAllIdeas();
    expect(ideas.length).toBe(2);
  });
});

describe('SettingsComponent', () => {
  let settings;
  let themeManager;
  let dataManager;
  let db;

  beforeEach(async () => {
    document.body.innerHTML = '<div id="settings-container"></div>';

    localStorage.clear();
    document.documentElement.classList.remove('dark');

    db = new IdeaDatabase();
    await db.init();

    themeManager = new ThemeManager();
    dataManager = new DataManager(db);
    settings = new SettingsComponent('settings-container', themeManager, dataManager);
  });

  afterEach(async () => {
    await db.clear();
    await db.clearTags();
    await db.clearCategories();
  });

  test('渲染设置界面', () => {
    const container = document.getElementById('settings-container');
    expect(container.innerHTML).toContain('设置');
    expect(container.innerHTML).toContain('主题模式');
    expect(container.innerHTML).toContain('数据管理');
    expect(container.innerHTML).toContain('关于');
  });

  test('包含主题选择器', () => {
    const select = document.getElementById('theme-select');
    expect(select).toBeDefined();
    expect(select.options.length).toBe(2);
  });

  test('包含字体大小选择器', () => {
    const select = document.getElementById('font-size-select');
    expect(select).toBeDefined();
    expect(select.options.length).toBe(4);
  });

  test('包含自动保存开关', () => {
    const toggle = document.getElementById('auto-save-toggle');
    expect(toggle).toBeDefined();
    expect(toggle.checked).toBe(true);
  });

  test('包含数据管理按钮', () => {
    expect(document.getElementById('storage-info')).toBeDefined();
    expect(document.getElementById('storage-export-json')).toBeDefined();
    expect(document.getElementById('storage-export-md')).toBeDefined();
    expect(document.getElementById('storage-backup')).toBeDefined();
    expect(document.getElementById('storage-restore')).toBeDefined();
    expect(document.getElementById('storage-cleanup')).toBeDefined();
  });

  test('包含关于按钮', () => {
    expect(document.getElementById('about-version')).toBeDefined();
    expect(document.getElementById('about-help')).toBeDefined();
  });

  test('切换主题选择器触发 themeManager', () => {
    const select = document.getElementById('theme-select');
    select.value = 'dark';
    select.dispatchEvent(new Event('change'));
    expect(themeManager.getTheme()).toBe('dark');
  });

  test('切换字体大小设置 style', () => {
    const select = document.getElementById('font-size-select');
    select.value = '18';
    select.dispatchEvent(new Event('change'));
    expect(document.documentElement.style.fontSize).toBe('18px');
    expect(localStorage.getItem('app-font-size')).toBe('18');
  });

  test('loadSettings 恢复保存的设置', async () => {
    localStorage.setItem('app-theme', 'dark');
    localStorage.setItem('app-font-size', '20');
    localStorage.setItem('app-auto-save', 'false');

    await settings.loadSettings();

    expect(document.getElementById('theme-select').value).toBe('dark');
    expect(document.getElementById('font-size-select').value).toBe('20');
    expect(document.getElementById('auto-save-toggle').checked).toBe(false);
  });
});
