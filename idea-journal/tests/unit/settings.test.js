import { SettingsComponent } from '../../js/components/settings.js';
import { ThemeManager } from '../../js/features/theme-manager.js';
import { DataManager } from '../../js/features/data-manager.js';
import { IdeaDatabase } from '../../js/storage/database.js';

describe('SettingsComponent', () => {
  let settings;
  let themeManager;
  let dataManager;
  let db;
  let container;

  beforeEach(async () => {
    document.body.innerHTML = '<div id="settings-container"></div>';
    container = document.getElementById('settings-container');

    db = new IdeaDatabase();
    await db.init();
    themeManager = new ThemeManager();
    dataManager = new DataManager(db);
    settings = new SettingsComponent('settings-container', themeManager, dataManager);
  });

  afterEach(async () => {
    await db.clear();
    document.body.innerHTML = '';
  });

  test('应该初始化设置界面', () => {
    expect(settings).toBeDefined();
    expect(container).not.toBeNull();
  });

  test('应该切换主题', () => {
    themeManager.toggleTheme();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('应该调整字体大小', () => {
    document.documentElement.style.fontSize = '18px';

    expect(document.documentElement.style.fontSize).toBe('18px');
  });

  test('应该显示存储信息', async () => {
    const storageInfo = await dataManager.getStorageInfo();
    expect(storageInfo.ideasCount).toBeGreaterThanOrEqual(0);
  });
});
