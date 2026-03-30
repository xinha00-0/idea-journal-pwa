export class SettingsComponent {
  constructor(containerId, themeManager, dataManager) {
    this.container = document.getElementById(containerId);
    this.themeManager = themeManager;
    this.dataManager = dataManager;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = this.renderSettings();
  }

  renderSettings() {
    return `
      <div class="settings-header">
        <h2 class="settings-title">设置</h2>
      </div>

      <div class="settings-section">
        <h3>外观设置</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label>主题模式</label>
          </div>
          <div class="setting-control">
            <select id="theme-select" class="setting-select">
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>字体大小</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label>字号</label>
          </div>
          <div class="setting-control">
            <select id="font-size-select" class="setting-select">
              <option value="14">小</option>
              <option value="16" selected>中</option>
              <option value="18">大</option>
              <option value="20">特大</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>编辑器</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label for="auto-save-toggle">自动保存草稿</label>
            <p>每2秒自动保存编辑内容</p>
          </div>
          <div class="setting-control">
            <input type="checkbox" id="auto-save-toggle" class="toggle-switch" checked>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>数据管理</h3>
        <button id="storage-info" class="setting-btn">查看存储信息</button>
        <button id="storage-export-json" class="setting-btn">导出 JSON</button>
        <button id="storage-export-md" class="setting-btn">导出 Markdown</button>
        <button id="storage-backup" class="setting-btn">创建备份</button>
        <button id="storage-restore" class="setting-btn">恢复备份</button>
        <button id="storage-cleanup" class="setting-btn" style="color:#c62828;">清理旧数据</button>
      </div>

      <div class="settings-section">
        <h3>关于</h3>
        <button id="about-version" class="setting-btn">版本信息</button>
        <button id="about-help" class="setting-btn">使用帮助</button>
      </div>
    `;
  }

  bindEvents() {
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', () => {
        this.themeManager.setTheme(themeSelect.value);
      });
    }

    const fontSizeSelect = document.getElementById('font-size-select');
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', () => {
        const size = parseInt(fontSizeSelect.value);
        document.documentElement.style.fontSize = `${size}px`;
        localStorage.setItem('app-font-size', size);
      });
    }

    const autoSaveToggle = document.getElementById('auto-save-toggle');
    if (autoSaveToggle) {
      autoSaveToggle.addEventListener('change', () => {
        localStorage.setItem('app-auto-save', autoSaveToggle.checked);
      });
    }

    const actions = {
      'storage-info': () => this.showStorageInfo(),
      'storage-export-json': () => this.exportData('json'),
      'storage-export-md': () => this.exportData('markdown'),
      'storage-backup': () => this.createBackup(),
      'storage-restore': () => this.restoreBackup(),
      'storage-cleanup': () => this.cleanupOldData(),
      'about-version': () => alert('想法记录 v1.0.0\n\n一个简洁的想法记录工具'),
      'about-help': () => this.showHelp()
    };

    Object.entries(actions).forEach(([id, handler]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', handler);
      }
    });
  }

  async loadSettings() {
    const theme = localStorage.getItem('app-theme') || 'light';
    const fontSize = localStorage.getItem('app-font-size') || '16';
    const autoSave = localStorage.getItem('app-auto-save') !== 'false';

    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.value = theme;

    const fontSizeSelect = document.getElementById('font-size-select');
    if (fontSizeSelect) fontSizeSelect.value = fontSize;

    const autoSaveToggle = document.getElementById('auto-save-toggle');
    if (autoSaveToggle) autoSaveToggle.checked = autoSave;

    this.themeManager.setTheme(theme);
    document.documentElement.style.fontSize = `${fontSize}px`;
  }

  async showStorageInfo() {
    const info = await this.dataManager.getStorageInfo();
    alert(`存储信息\n\n想法数量: ${info.ideasCount}\n标签数量: ${info.tagsCount}\n分类数量: ${info.categoriesCount}\n总大小: ${info.formattedSize}`);
  }

  async createBackup() {
    const backup = await this.dataManager.backupData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idea-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const success = await this.dataManager.restoreData(event.target.result);
          if (success) {
            alert('备份恢复成功！');
          }
        } catch (error) {
          alert(error.message);
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  async cleanupOldData() {
    if (!confirm('确定要删除一年前的想法吗？此操作不可撤销。')) {
      return;
    }

    const count = await this.dataManager.clearOldData(365);
    alert(`已清理 ${count} 个旧想法`);
  }

  async exportData(format) {
    const ideas = await this.dataManager.getAllIdeas();

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(ideas, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ideas-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'markdown') {
      let markdown = '# 想法导出\n\n';
      ideas.forEach((idea, index) => {
        markdown += `## ${index + 1}. ${idea.title || '无标题'}\n`;
        markdown += `> 创建时间: ${new Date(idea.created).toLocaleString()}\n\n`;
        markdown += `${idea.content}\n\n`;
        if (idea.tags && idea.tags.length > 0) {
          markdown += `标签: ${idea.tags.join(', ')}\n`;
        }
        markdown += '---\n\n';
      });

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ideas-export-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  showHelp() {
    alert('使用帮助\n\n1. 点击右上角"+"按钮创建新想法\n2. 支持Markdown语法编写\n3. 点击相机图标插入图片\n4. 使用标签组织想法\n5. 点击搜索图标搜索内容\n6. 在回顾页面查看周报\n7. 在统计页面查看数据\n8. 在设置页面管理数据备份');
  }
}
