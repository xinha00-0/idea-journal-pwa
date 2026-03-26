import { IdeaDatabase } from './storage/database.js';
import { IdeaList } from './components/idea-list.js';

class IdeaJournalApp {
  constructor() {
    this.database = null;
    this.ideaList = null;
    this.currentTag = 'all';
  }

  async init() {
    try {
      this.database = new IdeaDatabase();
      await this.database.init();

      this.ideaList = new IdeaList('ideas-container');

      this.bindEvents();

      await this.loadIdeas();

      this.registerServiceWorker();

      console.log('想法记录应用初始化完成');
    } catch (error) {
      console.error('应用初始化失败:', error);
    }
  }

  bindEvents() {
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

    document.querySelectorAll('.tag-chip[data-tag]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        this.filterByTag(e.target.dataset.tag);
      });
    });

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.showSearch());
    }

    const addBtn = document.getElementById('add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showEditor());
    }

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView(item.getAttribute('href').slice(1));
      });
    });
  }

  async loadIdeas() {
    if (this.ideaList && this.database) {
      await this.ideaList.loadIdeas(this.database);
    }
  }

  async publishIdea() {
    const textarea = document.getElementById('quick-entry');
    const content = textarea.value.trim();

    if (!content) {
      return;
    }

    const lines = content.split('\n');
    const title = lines[0].substring(0, 50);
    const ideaContent = lines.length > 1 ? lines.slice(1).join('\n') : '';

    const idea = {
      title: title,
      content: ideaContent || content,
      tags: [],
      created: new Date()
    };

    try {
      const id = await this.database.addIdea(idea);
      idea.id = id;

      this.ideaList.addIdea(idea);

      textarea.value = '';

      console.log('想法已发布:', id);
    } catch (error) {
      console.error('发布失败:', error);
    }
  }

  filterByTag(tag) {
    document.querySelectorAll('.tag-chip[data-tag]').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.tag === tag);
    });

    this.ideaList.filterByTag(tag);
    this.currentTag = tag;
  }

  showSearch() {
    console.log('搜索功能待实现');
  }

  showEditor() {
    const textarea = document.getElementById('quick-entry');
    if (textarea) {
      textarea.focus();
    }
  }

  switchView(view) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === `#${view}`);
    });

    console.log('切换视图:', view);
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