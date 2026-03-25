import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { join } from 'path';

export class PageHelper {
  constructor() {
    this.dom = null;
    this.window = null;
    this.document = null;
  }

  async setup() {
    const htmlPath = join(process.cwd(), 'index.html');
    const html = readFileSync(htmlPath, 'utf8');
    this.dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost:3000'
    });
    this.window = this.dom.window;
    this.document = this.window.document;

    // 模拟浏览器API
    this.mockBrowserAPIs();
  }

  async goto(url) {
    if (!this.dom) {
      await this.setup();
    }
    this.window.location.href = url;
  }

  async getTitle() {
    return this.document.title;
  }

  async typeInQuickEntry(content) {
    const textarea = this.document.getElementById('quick-entry');
    if (textarea) {
      textarea.value = content;
      textarea.dispatchEvent(new this.window.Event('input'));
    }
  }

  async clickPublishBtn() {
    const btn = this.document.getElementById('publish-btn');
    if (btn) {
      btn.click();
      await this.delay(100);
    }
  }

  async getAllIdeas() {
    const ideas = [];
    const ideaCards = this.document.querySelectorAll('.idea-card');
    ideaCards.forEach(card => {
      const title = card.querySelector('.idea-title')?.textContent;
      const content = card.querySelector('.idea-content')?.textContent;
      ideas.push({ title, content });
    });
    return ideas;
  }

  async clickAddBtn() {
    const btn = this.document.getElementById('add-btn');
    if (btn) {
      btn.click();
      await this.delay(100);
    }
  }

  async waitForEditorReady() {
    await this.delay(200);
  }

  async typeInEditor(content) {
    const editor = this.document.getElementById('quick-entry');
    if (editor) {
      editor.value = content;
      editor.dispatchEvent(new this.window.Event('input'));
    }
  }

  async clickSaveBtn() {
    const btn = this.document.getElementById('publish-btn');
    if (btn) {
      btn.click();
      await this.delay(100);
    }
  }

  async waitForReportLoaded() {
    await this.delay(200);
  }

  async getReportContent() {
    const report = this.document.querySelector('.report-summary');
    return report ? report.textContent : '';
  }

  async waitForHeatmapLoaded() {
    await this.delay(200);
  }

  async heatmapElementExists() {
    const canvas = this.document.querySelector('canvas');
    return canvas !== null;
  }

  async $(selector) {
    return this.document.querySelector(selector);
  }

  async $$(selector) {
    return Array.from(this.document.querySelectorAll(selector));
  }

  async textContent(selector) {
    const element = this.document.querySelector(selector);
    return element ? element.textContent : null;
  }

  async waitForSelector(selector, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (this.document.querySelector(selector)) {
        return;
      }
      await this.delay(50);
    }
    throw new Error(`Selector ${selector} not found within ${timeout}ms`);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  mockBrowserAPIs() {
    // 模拟 localStorage
    const localStorage = new Map();
    this.window.localStorage = {
      getItem: (key) => localStorage.get(key) || null,
      setItem: (key, value) => localStorage.set(key, value),
      removeItem: (key) => localStorage.delete(key),
      clear: () => localStorage.clear()
    };

    // 模拟 IndexedDB
    this.window.indexedDB = {
      open: (name, version) => {
        const request = {
          result: null,
          error: null,
          onsuccess: null,
          onerror: null,
          onupgradeneeded: null
        };

        setTimeout(() => {
          if (request.onupgradeneeded) {
            request.onupgradeneeded({ target: request });
          }
          if (request.onsuccess) {
            request.onsuccess({ target: request });
          }
        }, 0);

        return request;
      }
    };

    // 模拟 navigator
    this.window.navigator = {
      serviceWorker: {
        register: () => Promise.resolve({ scope: '/' })
      }
    };

    // 模拟 EasyMDE
    this.window.EasyMDE = class MockEasyMDE {
      constructor(options) {
        this.value(options.element.value || '');
        if (options.autofocus) {
          options.element.focus();
        }
      }

      value(content) {
        if (content !== undefined) {
          this._value = content;
          if (this.element) {
            this.element.value = content;
          }
        }
        return this._value || '';
      }

      codemirror = {
        on: () => {},
        getDoc: () => ({
          getCursor: () => ({ line: 0, ch: 0 }),
          replaceRange: () => {}
        })
      };

      toTextArea() {}
    };

    // 模拟 Chart
    this.window.Chart = class MockChart {
      constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
      }

      data = config.data || {};
      options = config.options || {};

      update() {}
    };

    // 模拟 FileReader
    this.window.FileReader = class MockFileReader {
      constructor() {
        this.result = null;
        this.onload = null;
        this.onerror = null;
      }

      readAsDataURL(file) {
        this.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//';
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: this });
          }
        }, 0);
      }

      readAsText(file) {
        this.result = file.content || '';
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: this });
          }
        }, 0);
      }
    };
  }
}
