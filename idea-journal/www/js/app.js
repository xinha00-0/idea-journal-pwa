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
  }

  async init() {
    try {
      console.log('想法记录应用正在初始化...');

      this.database = new IdeaDatabase();
      await this.database.init();

      this.ideaList = new IdeaList('ideas-container');
      await this.ideaList.loadIdeas(this.database);

      this.editor = new MarkdownEditor('quick-entry', {
        autofocus: false,
        placeholder: '捕捉此刻的想法...'
      });

      this.tagManager = new TagManager(this.database);
      await this.tagManager.loadPopularTags();

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
      this.handleRouting();

      await this.loadData();

      console.log('想法记录应用初始化完成');
    } catch (error) {
      console.error('应用初始化失败:', error);
    }
  }

  bindEvents() {
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => {
        this.publishIdea();
      });
    }

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.showSearch();
      });
    }

    const addBtn = document.getElementById('add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.showEditor();
      });
    }

    document.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const tag = chip.dataset.tag;
        this.filterByTag(tag);
      });
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.target.closest('.nav-item').getAttribute('href').slice(1);
        this.switchView(view);
      });
    });

    window.addEventListener('hashchange', () => {
      this.handleRouting();
    });
  }

  async loadData() {
    await this.ideaList.loadIdeas(this.database);
    await this.tagManager.loadPopularTags();
    await this.loadHeatmapData();
    console.log('数据加载完成');
  }

  async publishIdea() {
    const content = this.editor.getContent();

    if (!content.trim()) {
      alert('请输入想法内容');
      return;
    }

    const idea = {
      title: this.extractTitle(content),
      content: content,
      tags: [],
      created: new Date(),
      updated: new Date()
    };

    const id = await this.database.addIdea(idea);

    this.editor.clear();
    await this.ideaList.loadIdeas(this.database);
  }

  extractTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        return trimmed.replace(/^#+\s*/, '');
      }
    }
    return content.substring(0, 20);
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

    this.handleRouting();
  }

  handleRouting() {
    const hash = window.location.hash.slice(1) || 'record';

    const sections = document.querySelectorAll('.view-section');
    sections.forEach(section => {
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

  async loadWeeklyReport() {
    const ideas = await this.database.getAllIdeas();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weekEnd = new Date(now);

    const report = await this.summary.generateWeeklyReport(ideas, weekStart, weekEnd);

    const weeklyReport = new WeeklyReport(weekStart, weekEnd, report);
    weeklyReport.render('weekly-report-container');
  }

  async loadStatistics() {
    const ideas = await this.database.getAllIdeas();
    const data = this.heatmap.generateWeeklyData(ideas);

    const labels = Object.keys(data);
    const values = Object.values(data);

    this.heatmap.updateData({ labels, values });
  }

  async loadHeatmapData() {
    const ideas = await this.database.getAllIdeas();
    const data = this.heatmap.generateWeeklyData(ideas);
    const labels = Object.keys(data);
    const values = Object.values(data);
    this.heatmap.updateData({ labels, values });
  }

  showEditor() {
    this.editor.instance.codemirror.focus();
  }

  showSearch() {
    alert('搜索功能开发中');
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
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