import { IdeaDatabase } from './storage/database.js';
import { IdeaList } from './components/idea-list.js';
import { MarkdownEditor } from './features/markdown-editor.js';
import { TagManager } from './features/tag-manager.js';
import { ImageCompressor } from './features/image-compressor.js';
import { HeatmapChart } from './components/heatmap.js';
import { WeeklySummary } from './features/weekly-summary.js';
import { WeeklyReport } from './components/weekly-report.js';
import { DataAnalytics } from './features/data-analytics.js';
import { DataExporter } from './storage/export.js';
import { DataImporter } from './storage/import.js';

class IdeaJournalApp {
  constructor() {
    this.database = null;
    this.ideaList = null;
    this.markdownEditor = null;
    this.tagManager = null;
    this.imageCompressor = null;
    this.heatmapChart = null;
    this.weeklySummary = null;
    this.weeklyReport = null;
    this.dataAnalytics = null;
    this.dataExporter = null;
    this.dataImporter = null;

    this.currentView = 'record';
    this.currentTag = 'all';
    this.editingIdeaId = null;
    this.allIdeas = [];
    this.allTags = [];

    this.reviewWeekOffset = 0;
  }

  async init() {
    try {
      this.database = new IdeaDatabase();
      await this.database.init();

      this.tagManager = new TagManager(this.database);
      this.imageCompressor = new ImageCompressor();
      this.weeklySummary = new WeeklySummary();
      this.dataAnalytics = new DataAnalytics();
      this.dataExporter = new DataExporter();
      this.dataImporter = new DataImporter();

      this.ideaList = new IdeaList('ideas-container');
      this.heatmapChart = new HeatmapChart('heatmap-canvas');

      await this.loadAllTags();
      await this.loadIdeas();

      this.bindEvents();

      this.registerServiceWorker();
      this.updateOfflineStatus();

      console.log('想法记录应用初始化完成');
    } catch (error) {
      console.error('应用初始化失败:', error);
    }
  }

  async loadAllTags() {
    this.allTags = await this.tagManager.getAllTags();
    this.renderTagScroll();
  }

  renderTagScroll() {
    const scroll = document.getElementById('tag-scroll');
    if (!scroll) return;

    let html = '<button class="tag-chip active" data-tag="all">全部</button>';
    this.allTags.forEach(tag => {
      html += `<button class="tag-chip" data-tag="${this.escapeAttr(tag.name)}" data-tag-id="${tag.id}">${this.escapeHtml(tag.name)}</button>`;
    });
    scroll.innerHTML = html;

    scroll.querySelectorAll('.tag-chip[data-tag]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const tag = e.currentTarget.dataset.tag;
        this.filterByTag(tag);
      });
    });
  }

  async loadIdeas() {
    if (this.ideaList && this.database) {
      await this.ideaList.loadIdeas(this.database);
      this.allIdeas = this.ideaList.ideas;
    }
  }

  bindEvents() {
    this.bindRecordEvents();
    this.bindEditorEvents();
    this.bindReviewEvents();
    this.bindStatsEvents();
    this.bindSettingsEvents();
    this.bindSearchEvents();
    this.bindNavigation();
  }

  bindRecordEvents() {
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => this.publishIdea());
    }

    const quickEntry = document.getElementById('quick-entry');
    if (quickEntry) {
      quickEntry.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          this.publishIdea();
        }
      });
    }

    const addBtn = document.getElementById('add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.openEditor());
    }

    const markdownBtn = document.getElementById('markdown-btn');
    if (markdownBtn) {
      markdownBtn.addEventListener('click', () => this.openEditor());
    }

    const imageBtn = document.getElementById('image-btn');
    const imageInput = document.getElementById('image-input');
    if (imageBtn && imageInput) {
      imageBtn.addEventListener('click', () => imageInput.click());
      imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
    }

    const ideasContainer = document.getElementById('ideas-container');
    if (ideasContainer) {
      ideasContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.idea-card');
        if (card) {
          const id = parseInt(card.dataset.id);
          if (!isNaN(id)) {
            this.openEditor(id);
            return;
          }
        }
        const menuBtn = e.target.closest('.card-menu');
        if (menuBtn) {
          return;
        }
      });
    }
  }

  bindEditorEvents() {
    const backBtn = document.getElementById('editor-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.closeEditor());
    }

    const saveBtn = document.getElementById('editor-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveFromEditor());
    }

    const addTagBtn = document.getElementById('editor-add-tag-btn');
    if (addTagBtn) {
      addTagBtn.addEventListener('click', () => this.showTagDialog());
    }
  }

  bindReviewEvents() {
    const prevBtn = document.getElementById('review-prev');
    const nextBtn = document.getElementById('review-next');
    if (prevBtn) prevBtn.addEventListener('click', () => { this.reviewWeekOffset--; this.renderReview(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { this.reviewWeekOffset++; this.renderReview(); });
  }

  bindStatsEvents() {
  }

  bindSettingsEvents() {
    const exportJsonBtn = document.getElementById('export-json-btn');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.exportData('json'));
    }

    const exportMdBtn = document.getElementById('export-md-btn');
    if (exportMdBtn) {
      exportMdBtn.addEventListener('click', () => this.exportData('markdown'));
    }

    const importBtn = document.getElementById('import-btn');
    const importInput = document.getElementById('import-input');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', (e) => this.importData(e));
    }

    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => this.showConfirm('确定要清空所有数据吗？此操作不可恢复。', () => this.clearAllData()));
    }
  }

  bindSearchEvents() {
    const searchBtn = document.getElementById('search-btn');
    const searchPanel = document.getElementById('search-panel');
    const searchCloseBtn = document.getElementById('search-close-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        if (searchPanel) {
          searchPanel.classList.remove('hidden');
          if (searchInput) searchInput.focus();
        }
      });
    }

    if (searchCloseBtn) {
      searchCloseBtn.addEventListener('click', () => {
        if (searchPanel) searchPanel.classList.add('hidden');
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.performSearch(searchInput.value.trim());
      });
    }
  }

  bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('href').slice(1);
        this.switchView(view);
      });
    });
  }

  switchView(view) {
    this.currentView = view;

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(`view-${view}`);
    if (targetView) targetView.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === `#${view}`);
    });

    const titleMap = {
      record: '想法记录',
      editor: this.editingIdeaId ? '编辑想法' : '新建想法',
      review: '周报回顾',
      stats: '数据统计',
      settings: '设置'
    };
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titleMap[view] || '想法记录';

    if (view === 'review') {
      this.renderReview();
    } else if (view === 'stats') {
      this.renderStats();
    } else if (view === 'record') {
      this.loadIdeas();
    }
  }

  async publishIdea() {
    const textarea = document.getElementById('quick-entry');
    const content = textarea.value.trim();
    if (!content) return;

    const lines = content.split('\n');
    const title = lines[0].substring(0, 50);
    const ideaContent = lines.length > 1 ? lines.slice(1).join('\n') : '';

    const idea = {
      title,
      content: ideaContent || content,
      tags: [],
      created: new Date()
    };

    try {
      const id = await this.database.addIdea(idea);
      idea.id = id;
      this.ideaList.addIdea(idea);
      textarea.value = '';
      this.allIdeas = this.ideaList.ideas;
      console.log('想法已发布:', id);
    } catch (error) {
      console.error('发布失败:', error);
    }
  }

  filterByTag(tag) {
    this.currentTag = tag;
    const scroll = document.getElementById('tag-scroll');
    if (scroll) {
      scroll.querySelectorAll('.tag-chip[data-tag]').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.tag === tag);
      });
    }
    this.ideaList.filterByTag(tag);
  }

  openEditor(ideaId) {
    this.editingIdeaId = ideaId || null;
    this.switchView('editor');

    const titleInput = document.getElementById('editor-title');
    if (this.markdownEditor) {
      this.markdownEditor.destroy();
      this.markdownEditor = null;
    }

    const textarea = document.getElementById('editor-content');
    if (textarea) {
      textarea.value = '';
    }

    this.markdownEditor = new MarkdownEditor('editor-content', {
      placeholder: '开始记录你的想法...',
      toolbar: [
        'bold', 'italic', 'heading', 'quote',
        'unordered-list', 'ordered-list', 'link',
        'image', 'table', 'preview'
      ]
    });

    if (ideaId) {
      this.database.getIdea(ideaId).then(idea => {
        if (idea) {
          if (titleInput) titleInput.value = idea.title || '';
          this.markdownEditor.setContent(idea.content || '');
          this.renderEditorTags(idea.tags || []);
        }
      });
    } else {
      if (titleInput) titleInput.value = '';
      this.markdownEditor.setContent('');
      this.renderEditorTags([]);

      const draft = this.markdownEditor.loadDraft();
      if (draft) {
        const indicator = document.getElementById('draft-indicator');
        if (indicator) indicator.classList.add('has-draft');
      }
    }
  }

  closeEditor() {
    if (this.markdownEditor) {
      this.markdownEditor.destroy();
      this.markdownEditor = null;
    }
    this.editingIdeaId = null;
    this.switchView('record');
  }

  async saveFromEditor() {
    const titleInput = document.getElementById('editor-title');
    const title = titleInput ? titleInput.value.trim() : '';
    const content = this.markdownEditor ? this.markdownEditor.getContent() : '';
    const tags = this.getEditorSelectedTags();

    if (!title && !content) return;

    try {
      if (this.editingIdeaId) {
        const idea = await this.database.getIdea(this.editingIdeaId);
        if (idea) {
          idea.title = title;
          idea.content = content;
          idea.tags = tags;
          await this.database.updateIdea(idea);
          this.ideaList.updateIdea(idea);
        }
      } else {
        const idea = {
          title,
          content,
          tags,
          created: new Date()
        };
        const id = await this.database.addIdea(idea);
        idea.id = id;
        this.ideaList.addIdea(idea);
      }

      this.allIdeas = this.ideaList.ideas;
      if (this.markdownEditor) this.markdownEditor.clearDraft();
      this.closeEditor();
    } catch (error) {
      console.error('保存失败:', error);
    }
  }

  renderEditorTags(selectedTags) {
    const container = document.getElementById('editor-tag-chips');
    if (!container) return;
    container.innerHTML = '';
    this._editorSelectedTags = [...selectedTags];
    this._editorSelectedTags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip active';
      chip.textContent = tag;
      container.appendChild(chip);
    });
  }

  getEditorSelectedTags() {
    return this._editorSelectedTags || [];
  }

  async showTagDialog() {
    const dialog = document.getElementById('tag-dialog');
    const list = document.getElementById('tag-dialog-list');
    if (!dialog || !list) return;

    list.innerHTML = '';
    const selectedTags = this.getEditorSelectedTags();

    this.allTags.forEach(tag => {
      const isSelected = selectedTags.includes(tag.name);
      const chip = document.createElement('button');
      chip.className = 'tag-chip' + (isSelected ? ' active' : '');
      chip.textContent = tag.name;
      chip.dataset.tagName = tag.name;
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
      });
      list.appendChild(chip);
    });

    dialog.classList.remove('hidden');

    const confirmBtn = document.getElementById('tag-dialog-confirm-btn');
    const cancelBtn = document.getElementById('tag-dialog-cancel-btn');
    const addBtn = document.getElementById('tag-dialog-add-btn');
    const input = document.getElementById('tag-dialog-input');

    const onClose = () => {
      dialog.classList.add('hidden');
      cleanup();
    };

    const onConfirm = () => {
      const selected = [];
      list.querySelectorAll('.tag-chip.active').forEach(chip => {
        selected.push(chip.dataset.tagName);
      });
      this.renderEditorTags(selected);
      onClose();
    };

    const onAdd = async () => {
      const name = input ? input.value.trim() : '';
      if (!name) return;
      try {
        await this.tagManager.createTag({ name });
        await this.loadAllTags();
        input.value = '';
        this.showTagDialog();
      } catch (e) {
        console.error(e);
      }
    };

    const cleanup = () => {
      if (confirmBtn) confirmBtn.removeEventListener('click', onConfirm);
      if (cancelBtn) cancelBtn.removeEventListener('click', onClose);
      if (addBtn) addBtn.removeEventListener('click', onAdd);
    };

    if (confirmBtn) confirmBtn.addEventListener('click', onConfirm);
    if (cancelBtn) cancelBtn.addEventListener('click', onClose);
    if (addBtn) addBtn.addEventListener('click', onAdd);
  }

  async handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressed = await this.imageCompressor.compress(file);
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read compressed image'));
        reader.readAsDataURL(compressed);
      });

      if (this.markdownEditor && this.currentView === 'editor') {
        this.markdownEditor.insertImage({ url: base64, alt: file.name });
      }
    } catch (error) {
      console.error('图片处理失败:', error);
    }

    e.target.value = '';
  }

  getWeekRange(offset) {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
  }

  async renderReview() {
    const { start, end } = this.getWeekRange(this.reviewWeekOffset);

    const startEl = document.getElementById('review-start');
    const endEl = document.getElementById('review-end');
    if (startEl) startEl.textContent = this.formatDate(start);
    if (endEl) endEl.textContent = this.formatDate(end);

    const ideas = await this.database.getAllIdeas();
    const report = this.weeklySummary.generateWeeklyReport(ideas, start, end);

    const container = document.getElementById('weekly-report-container');
    if (container) {
      if (this.weeklyReport) {
        this.weeklyReport.destroy();
      }
      this.weeklyReport = new WeeklyReport();
      container.innerHTML = '';
      container.appendChild(this.weeklyReport.render(report));
    }
  }

  async renderStats() {
    const ideas = await this.database.getAllIdeas();
    this.allIdeas = ideas;

    const totalEl = document.getElementById('stat-total');
    const streakEl = document.getElementById('stat-streak');
    const avgEl = document.getElementById('stat-avg');

    if (totalEl) totalEl.textContent = ideas.length;
    if (streakEl) streakEl.textContent = this.dataAnalytics.getStreak(ideas);
    if (avgEl) avgEl.textContent = this.dataAnalytics.getAveragePerDay(ideas);

    const heatmapData = this.heatmapChart.generateWeeklyData(ideas);
    this.heatmapChart.updateData(heatmapData);

    this.renderTagDistribution(ideas);
  }

  renderTagDistribution(ideas) {
    const container = document.getElementById('tag-dist-chart');
    if (!container) return;

    const dist = this.dataAnalytics.getTagDistribution(ideas);
    const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 10);

    if (entries.length === 0) {
      container.innerHTML = '<p class="empty-hint">暂无标签数据</p>';
      return;
    }

    const maxCount = Math.max(...entries.map(([, c]) => c), 1);
    container.innerHTML = entries.map(([tag, count]) => {
      const pct = Math.round((count / maxCount) * 100);
      return `<div class="tag-dist-item">
        <span class="tag-dist-name">${this.escapeHtml(tag)}</span>
        <div class="tag-dist-bar-bg"><div class="tag-dist-bar" style="width:${pct}%"></div></div>
        <span class="tag-dist-count">${count}</span>
      </div>`;
    }).join('');
  }

  async exportData(format) {
    try {
      const ideas = await this.database.getAllIdeas();
      this.dataExporter.exportAll(ideas, format);
    } catch (error) {
      console.error('导出失败:', error);
    }
  }

  async importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const ideas = await this.dataImporter.importFile(file);
      let imported = 0;
      for (const idea of ideas) {
        await this.database.addIdea(idea);
        imported++;
      }
      await this.loadIdeas();
      await this.loadAllTags();
      console.log(`导入了 ${imported} 条想法`);
    } catch (error) {
      console.error('导入失败:', error);
    }

    e.target.value = '';
  }

  showConfirm(message, onConfirm) {
    const dialog = document.getElementById('confirm-dialog');
    const msgEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok-btn');
    const cancelBtn = document.getElementById('confirm-cancel-btn');

    if (!dialog || !msgEl || !okBtn || !cancelBtn) return;

    msgEl.textContent = message;
    dialog.classList.remove('hidden');

    const cleanup = () => {
      dialog.classList.add('hidden');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
    };

    const onOk = () => {
      cleanup();
      onConfirm();
    };

    const onCancel = () => {
      cleanup();
    };

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  }

  async clearAllData() {
    try {
      await this.database.clear();
      await this.database.clearTags();
      await this.database.clearCategories();
      await this.loadIdeas();
      await this.loadAllTags();
      console.log('所有数据已清空');
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  }

  performSearch(query) {
    const container = document.getElementById('search-results');
    if (!container) return;

    if (!query) {
      container.innerHTML = '';
      return;
    }

    const lower = query.toLowerCase();
    const results = this.allIdeas.filter(idea => {
      const title = (idea.title || '').toLowerCase();
      const content = (idea.content || '').toLowerCase();
      const tags = (idea.tags || []).join(' ').toLowerCase();
      return title.includes(lower) || content.includes(lower) || tags.includes(lower);
    });

    if (results.length === 0) {
      container.innerHTML = '<p class="empty-hint">未找到匹配的想法</p>';
      return;
    }

    container.innerHTML = results.map(idea => `
      <div class="search-result-item" data-id="${idea.id}">
        <div class="search-result-title">${this.escapeHtml(idea.title || '无标题')}</div>
        <div class="search-result-content">${this.escapeHtml((idea.content || '').substring(0, 100))}</div>
      </div>
    `).join('');

    container.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        const panel = document.getElementById('search-panel');
        if (panel) panel.classList.add('hidden');
        this.openEditor(id);
      });
    });
  }

  updateOfflineStatus() {
    const el = document.getElementById('offline-status');
    if (!el) return;

    const update = () => {
      el.textContent = navigator.onLine ? '已连接' : '离线模式';
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
  }

  formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeAttr(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker 注册成功:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker 注册失败:', error);
        });
    }
  }
}

const app = new IdeaJournalApp();

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

export default app;
