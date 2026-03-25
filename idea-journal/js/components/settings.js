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
    this.loadSettings();
  }

  render() {
    this.container.innerHTML = this.renderSettings();
  }

  renderSettings() {
    const settings = [
      {
        id: 'theme',
        title: '外观设置',
        icon: 'palette',
        options: [
          { id: 'theme-light', label: '浅色主题', value: 'light' },
          { id: 'theme-dark', label: '深色主题', value: 'dark' }
        ]
      },
      {
        id: 'font-size',
        title: '字体大小',
        icon: 'text_fields',
        options: [
          { id: 'font-small', label: '小', value: '14' },
          { id: 'font-medium', label: '中', value: '16' },
          { id: 'font-large', label: '大', value: '18' },
          { id: 'font-xlarge', label: '特大', value: '24' }
        ]
      },
      {
        id: 'auto-save',
        title: '自动保存',
        icon: 'save',
        type: 'toggle',
        checked: true
      },
      {
        id: 'storage',
        title: '数据管理',
        icon: 'database',
        options: [
          { id: 'storage-info', label: '查看', value: 'view' },
          { id: 'storage-cleanup', label: '清理', value: 'cleanup' },
          { id: 'storage-export-json', label: '导出JSON', value: 'export-json' },
          { id: 'storage-export-md', label: '导出Markdown', value: 'export-md' },
          { id: 'storage-backup', label: '创建备份', value: 'backup' },
          { id: 'storage-restore', label: '恢复备份', value: 'restore' }
        ]
      },
      {
        id: 'about',
        title: '关于',
        icon: 'info',
        options: [
          { id: 'about-version', label: '版本信息', value: 'version' },
          { id: 'about-help', label: '使用帮助', value: 'help' },
          { id: 'about-feedback', label: '反馈', value: 'feedback' }
        ]
      }
    ];

    let html = `
      <div class="settings-header">
        <h2 class="settings-title">设置</h2>
      </div>
    `;

    settings.forEach(section => {
      html += this.renderSection(section);
    });

    return html;
  }

  renderSection(section) {
    let optionsHtml = '';

    if (section.type === 'toggle') {
      optionsHtml = `
        <div class="setting-item">
          <div class="setting-info">
            <label for="auto-save-toggle">自动保存</label>
            <p>自动保存想法的更改</p>
          </div>
          <div class="setting-control">
            <input type="checkbox" id="auto-save-toggle" class="toggle-switch">
          </div>
        </div>
      `;
    } else {
      optionsHtml = this.renderOptions(section.id, section.options);
    }

    return `
      <div class="settings-section">
        <h3>${section.title}</h3>
        ${optionsHtml}
      </div>
    `;
  }

  renderOptions(sectionId, options) {
    let html = '';

    options.forEach(option => {
      html += `
        <div class="setting-item">
          <div class="setting-info">
            <label for="${option.id}">${option.label}</label>
          </div>
          <div class="setting-control">
            ${this.renderOptionControl(option)}
          </div>
        </div>
      `;
    });

    return html;
  }

  renderOptionControl(option) {
    if (option.type === 'toggle') {
      return `<input type="checkbox" id="${option.id}" ${option.checked ? 'checked' : ''} class="toggle-switch">`;
    } else if (option.type === 'slider') {
      return `<input type="range" id="${option.id}" min="${option.min}" max="${option.max}" value="${option.value}" step="${option.step || 1}">`;
    } else {
      return `<button id="${option.id}" class="setting-btn">${option.label}</button>`;
    }
  }

  renderButton(action) {
    const btn = `<button class="setting-btn ${action.primary ? 'primary' : ''}">${action.label}</button>`;
    return btn;
  }

  renderTextControl(valueId, currentValue) {
    const element = document.getElementById(valueId);
    if (element) {
      element.textContent = currentValue;
    }
  }

  bindEvents() {
    const autoSaveToggle = document.getElementById('auto-save-toggle');
    if (autoSaveToggle) {
      autoSaveToggle.addEventListener('change', () => {
        localStorage.setItem('app-auto-save', autoSaveToggle.checked);
      });
    }

    this.bindButtonEvents();
  }

  bindButtonEvents() {
    const buttons = document.querySelectorAll('.setting-btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const option = this.findOptionById(btn.id);
        if (option) {
          await this.handleSettingAction(btn.id, option);
        }
      });
    });

    const autoSaveToggle = document.getElementById('auto-save-toggle');
    if (autoSaveToggle) {
      autoSaveToggle.addEventListener('change', () => {
        localStorage.setItem('app-auto-save', autoSaveToggle.checked);
      });
    }
  }

  findOptionById(id) {
    if (id === 'storage-info') {
      return { sectionId: 'storage', value: 'view' };
    } else if (id === 'storage-cleanup') {
      return { sectionId: 'storage', value: 'cleanup' };
    } else if (id === 'storage-export-json') {
      return { sectionId: 'storage', value: 'export-json' };
    } else if (id === 'storage-export-md') {
      return { sectionId: 'storage', value: 'export-md' };
    } else if (id === 'storage-backup') {
      return { sectionId: 'storage', value: 'backup' };
    } else if (id === 'storage-restore') {
      return { sectionId: 'storage', value: 'restore' };
    } else if (id === 'about-version') {
      return { sectionId: 'about', value: 'version' };
    } else if (id === 'about-help') {
      return { sectionId: 'about', value: 'help' };
    } else if (id === 'about-feedback') {
      return { sectionId: 'about', value: 'feedback' };
    }
    return null;
  }

  async handleSettingAction(settingId, option) {
    switch (option.sectionId) {
      case 'theme':
        if (option.value === 'dark') {
          this.themeManager.setTheme('dark');
        } else {
          this.themeManager.setTheme('light');
        }
        break;
      case 'font-size':
        const size = parseInt(option.value);
        document.documentElement.style.fontSize = `${size}px`;
        localStorage.setItem('app-font-size', size);
        break;
      case 'auto-save':
        const enabled = document.getElementById('auto-save-toggle');
        enabled.checked = !enabled.checked;
        localStorage.setItem('app-auto-save', enabled.checked);
        break;
      case 'storage':
        if (option.value === 'view') {
          await this.showStorageInfo();
        } else if (option.value === 'cleanup') {
          await this.cleanupOldData();
        } else if (option.value === 'export-json') {
          await this.exportData('json');
        } else if (option.value === 'export-md') {
          await this.exportData('markdown');
        } else if (option.value === 'backup') {
          await this.createBackup();
        } else if (option.value === 'restore') {
          await this.restoreBackup();
        }
        break;
      case 'about':
        if (option.value === 'version') {
          alert('版本信息：v1.0.0');
        } else if (option.value === 'help') {
          this.showHelp();
        } else if (option.value === 'feedback') {
          this.showFeedback();
        }
        break;
    }
  }

  async showStorageInfo() {
    const info = await this.dataManager.getStorageInfo();

    alert(`存储信息：
想法数量: ${info.ideasCount}
标签数量: ${info.tagsCount}
分类数量: ${info.categoriesCount}
总大小: ${info.formattedSize}`);
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
    alert('使用帮助：\n1. 点击右下角的"+"按钮创建新想法\n2. 使用Markdown语法编写内容\n3. 添加标签和分类组织想法\n4. 使用搜索功能查找想法\n5. 在统计页面查看热力图\n6. 在设置页面管理数据\n7. 在回顾页面查看周报\n8. 使用导出功能备份数据');
  }

  showFeedback() {
    alert('感谢您的反馈！\n\n您可以通过以下方式联系我们：\n- 提交GitHub Issue\n- 发送邮件至 support@ideajournal.com\n\n我们会认真对待每一条反馈。');
  }

  async loadSettings() {
    const theme = localStorage.getItem('app-theme') || 'light';
    const fontSize = localStorage.getItem('app-font-size') || '16';
    const autoSave = localStorage.getItem('app-auto-save') !== 'false';

    const autoSaveToggle = document.getElementById('auto-save-toggle');
    if (autoSaveToggle) {
      autoSaveToggle.checked = autoSave;
    }

    this.themeManager.setTheme(theme);
    document.documentElement.style.fontSize = `${fontSize}px`;
  }
}
