import { IdeaDatabase } from './storage/database.js';
import { IdeaList } from './components/idea-list.js';
import { MarkdownEditor } from './features/markdown-editor.js';
import { TagManager } from './features/tag-manager.js';
import { ImageCompressor } from './features/image-compressor.js';
import { WeeklySummary } from './features/weekly-summary.js';
import { DataExporter } from './storage/export.js';
import { DataImporter } from './storage/import.js';
import { HeatmapChart } from './components/heatmap.js';
import { WeeklyReport } from './components/weekly-report.js';
import { ThemeManager } from './features/theme-manager.js';
import { DataManager } from './features/data-manager.js';
import { SettingsComponent } from './components/settings.js';

class IdeaJournalApp {
  constructor() {
    this.database = null;
    this.ideaList = null;
    this.editor = null;
    this.tagManager = null;
    this.compressor = null;
    this.summary = null;
    this.exporter = null;
    this.importer = null;
    this.heatmap = null;
    this.themeManager = null;
    this.dataManager = null;
    this.settings = null;
    this.themeChart = null;
    this.draftTimer = null;
    this.allIdeas = [];
  }

  async init() {
    try {
      this.database = new IdeaDatabase();
      await this.database.init();

      this.ideaList = new IdeaList('ideas-container');

      this.editor = new MarkdownEditor('quick-entry', {
        autofocus: false,
        placeholder: '捕捉此刻的想法...'
      });

      const draft = this.editor.loadDraft();
      if (draft) {
        this.editor.setContent(draft);
      }

      this.editor.setOnContentChange((content) => {
        clearTimeout(this.draftTimer);
        this.draftTimer = setTimeout(() => {
          this.editor.autoSaveDraft();
        }, 2000);
      });

      this.tagManager = new TagManager(this.database);

      this.compressor = new ImageCompressor();

      this.summary = new WeeklySummary();

      this.exporter = new DataExporter();
      this.importer = new DataImporter(this.database);

      this.heatmap = new HeatmapChart('heatmap-canvas', {
        colorScheme: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
      });

      this.themeManager = new ThemeManager();
      this.themeManager.applyTheme();
      this.themeManager.watchSystemTheme();

      this.dataManager = new DataManager(this.database);
      this.settings = new SettingsComponent('settings-container', this.themeManager, this.dataManager);

      this.bindEvents();
      this.registerServiceWorker();

      await this.loadData();

      this.handleRouting();

      this.initThemeChart();
    } catch (error) {
      console.error('应用初始化失败:', error);
    }
  }

  bindEvents() {
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => this.publishIdea());
    }

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.showSearch());
    }

    const addBtn = document.getElementById('add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showEditor());
    }

    const imageBtn = document.getElementById('image-btn');
    const imageInput = document.getElementById('image-input');
    if (imageBtn && imageInput) {
      imageBtn.addEventListener('click', () => imageInput.click());
      imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    const markdownBtn = document.getElementById('markdown-btn');
    if (markdownBtn) {
      markdownBtn.addEventListener('click', () => {
        this.editor.insertMarkdown('\n## ');
      });
    }

    const searchClose = document.getElementById('search-close');
    if (searchClose) {
      searchClose.addEventListener('click', () => this.hideSearch());
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.performSearch(e.target.value));
    }

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.target.closest('.nav-item').getAttribute('href').slice(1);
        this.switchView(view);
      });
    });

    window.addEventListener('hashchange', () => this.handleRouting());
  }

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const base64 = await this.compressor.compressToBase64(file);
      this.editor.insertImage(base64);
    } catch (error) {
      console.error('图片压缩失败:', error);
      const reader = new FileReader();
      reader.onload = (e) => this.editor.insertImage(e.target.result);
      reader.readAsDataURL(file);
    }

    event.target.value = '';
  }

  async loadData() {
    this.allIdeas = await this.database.getAllIdeas();
    await this.ideaList.loadIdeas(this.database);
    await this.tagManager.loadPopularTags();
    this.bindTagChipEvents();
    this.toggleEmptyState();
    await this.loadHeatmapData();
    this.updateStatsValues();
  }

  toggleEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const container = document.getElementById('ideas-container');
    if (!emptyState || !container) return;
    emptyState.style.display = container.children.length === 0 ? 'block' : 'none';
  }

  bindTagChipEvents() {
    document.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const tag = chip.dataset.tag;
        this.filterByTag(tag);
      });
    });
  }

  async publishIdea() {
    const content = this.editor.getContent();

    if (!content.trim()) {
      return;
    }

    const idea = {
      title: this.extractTitle(content),
      content: content,
      tags: this.detectTags(content),
      created: new Date(),
      updated: new Date()
    };

    await this.database.addIdea(idea);

    this.editor.clear();
    this.editor.clearDraft();

    await this.loadData();
  }

  detectTags(content) {
    const tagKeywords = {
      '工作': ['项目', '任务', '会议', '客户', '产品', '功能', '优化'],
      '生活': ['家庭', '朋友', '旅行', '健康', '运动', '饮食'],
      '学习': ['读书', '课程', '技能', '知识', '研究'],
      '灵感': ['创意', '想法', '创新', '设计']
    };

    const tags = [];
    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some(kw => content.includes(kw))) {
        tags.push(tag);
      }
    }
    return tags;
  }

  extractTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        return trimmed.replace(/^#+\s*/, '');
      }
    }
    return content.substring(0, 20).replace(/\n/g, ' ');
  }

  filterByTag(tag) {
    if (tag === 'all') {
      this.ideaList.loadIdeas(this.database);
    } else {
      this.ideaList.filterByTag(tag);
    }

    document.querySelectorAll('.tag-chip').forEach(chip => {
      chip.classList.remove('active');
      if (chip.dataset.tag === tag) {
        chip.classList.add('active');
      }
    });
  }

  switchView(view) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    const activeNav = document.querySelector(`.nav-item[href="#${view}"]`);
    if (activeNav) {
      activeNav.classList.add('active');
    }

    window.location.hash = view;
  }

  handleRouting() {
    const hash = window.location.hash.slice(1) || 'record';

    document.querySelectorAll('.view-section').forEach(section => {
      section.style.display = 'none';
    });

    const targetSection = document.querySelector(`#${hash}-section`);
    if (targetSection) {
      targetSection.style.display = 'block';
    }

    if (hash === 'review') {
      this.loadWeeklyReport();
    } else if (hash === 'stats') {
      this.loadStatistics();
    } else if (hash === 'settings') {
      if (this.settings) {
        this.settings.loadSettings();
      }
    }
  }

  showSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    if (overlay) {
      overlay.style.display = 'block';
      if (input) input.focus();
    }
  }

  hideSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if (overlay) overlay.style.display = 'none';
    if (input) input.value = '';
    if (results) results.innerHTML = '';
  }

  performSearch(query) {
    const results = document.getElementById('search-results');
    if (!results) return;

    if (!query.trim()) {
      results.innerHTML = '';
      return;
    }

    const q = query.toLowerCase();
    const matched = this.allIdeas.filter(idea => {
      const title = (idea.title || '').toLowerCase();
      const content = (idea.content || '').toLowerCase();
      return title.includes(q) || content.includes(q);
    });

    if (matched.length === 0) {
      results.innerHTML = '<div class="search-result-item"><p>没有找到匹配的想法</p></div>';
      return;
    }

    results.innerHTML = matched.slice(0, 20).map(idea => `
      <div class="search-result-item" data-id="${idea.id}">
        <h4>${idea.title || '无标题'}</h4>
        <p>${(idea.content || '').substring(0, 80)}</p>
      </div>
    `).join('');

    results.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        this.hideSearch();
        this.switchView('record');
      });
    });
  }

  async loadWeeklyReport() {
    const container = document.getElementById('weekly-report-container');
    if (!container) return;

    const ideas = await this.database.getAllIdeas();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(now);

    const report = await this.summary.generateWeeklyReport(ideas, weekStart, weekEnd);

    container.innerHTML = '';
    const weeklyReport = new WeeklyReport(weekStart, weekEnd, report);
    weeklyReport.render('weekly-report-container');
  }

  updateStatsValues() {
    const ideas = this.allIdeas;
    const totalEl = document.getElementById('total-ideas');
    const weeklyEl = document.getElementById('weekly-ideas');
    const streakEl = document.getElementById('streak-days');

    if (totalEl) totalEl.textContent = ideas.length;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const weeklyCount = ideas.filter(i => new Date(i.created) >= weekStart).length;
    if (weeklyEl) weeklyEl.textContent = weeklyCount;

    const streak = this.calculateStreak(ideas);
    if (streakEl) streakEl.textContent = streak;
  }

  calculateStreak(ideas) {
    if (ideas.length === 0) return 0;

    const dateSet = new Set();
    ideas.forEach(idea => {
      const d = new Date(idea.created);
      dateSet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (dateSet.has(key)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  async loadStatistics() {
    const ideas = await this.database.getAllIdeas();
    this.allIdeas = ideas;

    this.updateStatsValues();

    const data = this.heatmap.generateWeeklyData(ideas);
    const labels = Object.keys(data);
    const values = Object.values(data);
    this.heatmap.updateData({ labels, values });
    this.heatmap.updateColors(values);

    this.updateThemeChart(ideas);
  }

  async loadHeatmapData() {
    const ideas = this.allIdeas;
    const data = this.heatmap.generateWeeklyData(ideas);
    const labels = Object.keys(data);
    const values = Object.values(data);
    this.heatmap.updateData({ labels, values });
    this.heatmap.updateColors(values);
  }

  initThemeChart() {
    const canvas = document.getElementById('theme-chart-canvas');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    this.themeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['工作', '生活', '学习', '灵感', '其他'],
        datasets: [{
          data: [0, 0, 0, 0, 0],
          backgroundColor: ['#006e1c', '#0061a4', '#f59e0b', '#ea533c', '#999'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              font: { size: 12 }
            }
          }
        }
      }
    });
  }

  updateThemeChart(ideas) {
    if (!this.themeChart) return;

    const categories = { '工作': 0, '生活': 0, '学习': 0, '灵感': 0, '其他': 0 };
    const keywords = {
      '工作': ['项目', '任务', '会议', '客户', '产品', '功能'],
      '生活': ['家庭', '朋友', '旅行', '健康', '运动'],
      '学习': ['读书', '课程', '技能', '知识', '研究'],
      '灵感': ['创意', '想法', '创新', '设计']
    };

    ideas.forEach(idea => {
      const text = `${idea.title} ${idea.content}`.toLowerCase();
      let matched = false;
      for (const [cat, kws] of Object.entries(keywords)) {
        if (kws.some(kw => text.includes(kw))) {
          categories[cat]++;
          matched = true;
          break;
        }
      }
      if (!matched) categories['其他']++;
    });

    this.themeChart.data.datasets[0].data = Object.values(categories);
    this.themeChart.update();
  }

  showEditor() {
    if (this.editor && this.editor.instance) {
      this.editor.instance.codemirror.focus();
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(registration => {
            console.log('Service Worker 注册成功:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker 注册失败:', error);
          });
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new IdeaJournalApp();
  app.init();
});
