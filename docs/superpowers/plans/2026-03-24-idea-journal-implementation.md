# 想法记录工具实施计划

> **对于代理工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 来逐个任务实施此计划。步骤使用复选框（`- [ ]`）语法进行跟踪。

**目标：** 构建一个基于PWA的安卓想法记录工具，支持Markdown编辑、图片压缩、标签分类、按周回顾和热力图可视化。

**架构：** 基于原生HTML/CSS/JavaScript的PWA应用，使用Tailwind CSS进行样式设计，IndexedDB进行本地存储，Chart.js进行热力图可视化。

**技术栈：** HTML5, CSS3, JavaScript, Tailwind CSS, IndexedDB, Chart.js, EasyMDE

---

## 文件结构

### 核心文件
```
idea-journal/
├── index.html                    # 主页面入口
├── manifest.json                 # PWA配置
├── sw.js                         # Service Worker
├── package.json                  # 项目配置（可选）
├── README.md                     # 项目说明
└── assets/
    ├── icons/                    # 应用图标
    │   ├── icon-192.png
    │   └── icon-512.png
    └── fonts/                    # 字体文件（可选）
        ├── Manrope.woff2
        └── Inter.woff2
```

### 样式文件
```
css/
├── style.css                     # 主样式
├── editor.css                    # 编辑器样式
├── components/                   # 组件样式
│   ├── buttons.css
│   ├── cards.css
│   ├── chips.css
│   └── modals.css
└── themes/                       # 主题样式
    ├── light.css
    └── dark.css
```

### JavaScript文件
```
js/
├── app.js                        # 主应用入口
├── storage/
│   ├── database.js              # IndexedDB操作
│   ├── backup.js                # 备份恢复
│   └── export.js                # 导入导出
├── components/
│   ├── idea-list.js             # 想法列表组件
│   ├── idea-card.js             # 想法卡片组件
│   ├── tag-chip.js              # 标签芯片组件
│   ├── heatmap.js               # 热力图组件
│   └── weekly-report.js         # 周报组件
├── features/
│   ├── markdown-editor.js       # Markdown编辑器
│   ├── image-compressor.js      # 图片压缩
│   ├── tag-manager.js           # 标签管理
│   ├── weekly-summary.js        # 周报生成
│   └── data-analytics.js        # 数据分析
├── utils/
│   ├── date.js                  # 日期工具
│   ├── string.js                # 字符串工具
│   ├── validation.js            # 验证工具
│   └── constants.js             # 常量定义
└── libs/                        # 第三方库
    ├── easymde.min.js
    ├── chart.min.js
    └── material-symbols.js
```

### 测试文件
```
tests/
├── unit/                        # 单元测试
│   ├── storage.test.js
│   ├── markdown.test.js
│   └── utils.test.js
├── integration/                 # 集成测试
│   ├── idea-crud.test.js
│   └── tag-management.test.js
└── e2e/                         # 端到端测试
    ├── main-flow.test.js
    └── offline.test.js
```

## 实施任务

### 任务1：项目初始化与基础架构

**文件：**
- 创建：`idea-journal/index.html`
- 创建：`idea-journal/manifest.json`
- 创建：`idea-journal/sw.js`
- 创建：`idea-journal/css/style.css`
- 创建：`idea-journal/js/app.js`

- [ ] **步骤1：创建项目目录结构**

```bash
mkdir -p idea-journal/{css,js/{storage,components,features,utils,libs},assets/icons,tests}
```

- [ ] **步骤2：创建基础HTML文件**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>想法记录</title>
    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="app">
        <!-- 主内容区域 -->
    </div>
    <script src="js/app.js" type="module"></script>
</body>
</html>
```

- [ ] **步骤3：创建PWA配置文件**

```json
{
  "name": "想法记录",
  "short_name": "记录",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fbf9f8",
  "theme_color": "#006e1c",
  "icons": [
    {
      "src": "assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

- [ ] **步骤4：创建Service Worker**

```javascript
// sw.js
const CACHE_NAME = 'idea-journal-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

- [ ] **步骤5：运行测试验证基础架构**

```bash
# 验证HTML语法
npx html-validate idea-journal/index.html

# 验证PWA配置
npx pwabuilder idea-journal/manifest.json
```

- [ ] **步骤6：提交初始代码**

```bash
git add .
git commit -m "feat: 初始化项目基础架构"
```

### 任务2：IndexedDB数据库层

**文件：**
- 创建：`idea-journal/js/storage/database.js`
- 创建：`idea-journal/js/storage/backup.js`
- 创建：`idea-journal/js/storage/export.js`
- 测试：`tests/unit/storage.test.js`

- [ ] **步骤1：编写数据库单元测试**

```javascript
// tests/unit/storage.test.js
import { IdeaDatabase } from '../../js/storage/database.js';

describe('IdeaDatabase', () => {
  let db;
  
  beforeEach(async () => {
    db = new IdeaDatabase();
    await db.init();
  });
  
  afterEach(async () => {
    await db.clear();
  });
  
  test('应该创建数据库', () => {
    expect(db).toBeDefined();
  });
  
  test('应该添加想法', async () => {
    const idea = {
      title: '测试想法',
      content: '测试内容',
      tags: ['测试'],
      created: new Date()
    };
    
    const id = await db.addIdea(idea);
    expect(id).toBeDefined();
    
    const savedIdea = await db.getIdea(id);
    expect(savedIdea.title).toBe('测试想法');
  });
  
  test('应该获取所有想法', async () => {
    await db.addIdea({ title: '想法1', content: '内容1' });
    await db.addIdea({ title: '想法2', content: '内容2' });
    
    const ideas = await db.getAllIdeas();
    expect(ideas.length).toBe(2);
  });
});
```

- [ ] **步骤2：运行测试验证失败**

```bash
npm test tests/unit/storage.test.js
# 预期：测试失败 - IdeaDatabase未定义
```

- [ ] **步骤3：实现数据库类**

```javascript
// js/storage/database.js
export class IdeaDatabase {
  constructor() {
    this.db = null;
    this.version = 1;
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('IdeaJournalDB', this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 想法表
        if (!db.objectStoreNames.contains('ideas')) {
          const ideaStore = db.createObjectStore('ideas', { keyPath: 'id', autoIncrement: true });
          ideaStore.createIndex('created', 'created', { unique: false });
          ideaStore.createIndex('category', 'category', { unique: false });
        }
        
        // 标签表
        if (!db.objectStoreNames.contains('tags')) {
          const tagStore = db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true });
          tagStore.createIndex('name', 'name', { unique: true });
        }
        
        // 分类表
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
          categoryStore.createIndex('name', 'name', { unique: true });
          categoryStore.createIndex('order', 'order', { unique: false });
        }
      };
    });
  }
  
  // 分类表CRUD操作
  async addCategory(category) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.add(category);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getCategory(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getAllCategories() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async updateCategory(category) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.put(category);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async deleteCategory(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
  
  async getIdea(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readonly');
      const store = transaction.objectStore('ideas');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getAllIdeas() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readonly');
      const store = transaction.objectStore('ideas');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async updateIdea(idea) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readwrite');
      const store = transaction.objectStore('ideas');
      const request = store.put(idea);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async deleteIdea(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readwrite');
      const store = transaction.objectStore('ideas');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async clear() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readwrite');
      const store = transaction.objectStore('ideas');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
```

- [ ] **步骤4：运行测试验证通过**

```bash
npm test tests/unit/storage.test.js
# 预期：所有测试通过
```

- [ ] **步骤5：提交数据库层代码**

```bash
git add .
git commit -m "feat: 实现IndexedDB数据库层"
```

### 任务3：主界面布局

**文件：**
- 修改：`idea-journal/index.html`
- 创建：`idea-journal/js/components/idea-list.js`
- 创建：`idea-journal/js/components/idea-card.js`
- 测试：`tests/e2e/main-flow.test.js`

- [ ] **步骤1：编写主界面测试**

```javascript
// tests/e2e/main-flow.test.js
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
    expect(ideas.length).toBeGreaterThan(0);
  });
});
```

- [ ] **步骤2：更新HTML文件添加主界面**

```html
<!-- index.html -->
<header class="top-bar">
    <div class="container">
        <h1>想法记录</h1>
        <div class="actions">
            <button id="search-btn" aria-label="搜索">
                <span class="material-symbols-outlined">search</span>
            </button>
            <button id="add-btn" class="primary" aria-label="新增想法">
                <span class="material-symbols-outlined">add</span>
            </button>
        </div>
    </div>
</header>

<main class="main-content">
    <!-- 快速记录区 -->
    <section class="quick-entry">
        <textarea id="quick-entry" placeholder="捕捉此刻的想法..."></textarea>
        <div class="quick-actions">
            <div class="format-buttons">
                <button aria-label="Markdown格式">
                    <span class="material-symbols-outlined">markdown</span>
                </button>
                <button aria-label="插入图片">
                    <span class="material-symbols-outlined">image</span>
                </button>
            </div>
            <button id="publish-btn" class="primary">发布</button>
        </div>
    </section>
    
    <!-- 标签筛选区 -->
    <section class="tag-filter">
        <div class="tag-scroll">
            <button class="tag-chip active" data-tag="all">全部</button>
            <button class="tag-chip" data-tag="work">工作</button>
            <button class="tag-chip" data-tag="life">生活</button>
            <button class="tag-chip" data-tag="study">学习</button>
            <button class="tag-chip" data-tag="travel">旅行</button>
            <button class="tag-chip" data-tag="inspiration">灵感</button>
        </div>
    </section>
    
    <!-- 想法列表 -->
    <section class="idea-list">
        <div id="ideas-container">
            <!-- 想法卡片将通过JavaScript动态生成 -->
        </div>
    </section>
</main>

<!-- 底部导航 -->
<nav class="bottom-nav">
    <a href="#record" class="nav-item active">
        <span class="material-symbols-outlined">edit_note</span>
        <span>记录</span>
    </a>
    <a href="#review" class="nav-item">
        <span class="material-symbols-outlined">timeline</span>
        <span>回顾</span>
    </a>
    <a href="#stats" class="nav-item">
        <span class="material-symbols-outlined">analytics</span>
        <span>统计</span>
    </a>
    <a href="#settings" class="nav-item">
        <span class="material-symbols-outlined">settings</span>
        <span>设置</span>
    </a>
</nav>
```

- [ ] **步骤3：实现想法列表组件**

```javascript
// js/components/idea-list.js
export class IdeaList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.ideas = [];
  }
  
  async loadIdeas(database) {
    this.ideas = await database.getAllIdeas();
    this.render();
  }
  
  render() {
    this.container.innerHTML = '';
    
    this.ideas.forEach(idea => {
      const card = this.createIdeaCard(idea);
      this.container.appendChild(card);
    });
  }
  
  createIdeaCard(idea) {
    const card = document.createElement('article');
    card.className = 'idea-card';
    card.dataset.id = idea.id;
    
    card.innerHTML = `
      <div class="card-header">
        <h2 class="card-title">${idea.title}</h2>
        <time class="card-time">${this.formatTime(idea.created)}</time>
      </div>
      <div class="card-content">
        <p>${this.truncateContent(idea.content, 100)}</p>
      </div>
      <div class="card-footer">
        <div class="card-tags">
          ${idea.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
        </div>
        <button class="card-menu" aria-label="更多选项">
          <span class="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
    `;
    
    return card;
  }
  
  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)} 分钟前`;
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)} 小时前`;
    } else if (diff < 604800000) { // 1周内
      return `${Math.floor(diff / 86400000)} 天前`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  truncateContent(content, maxLength) {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
}
```

- [ ] **步骤4：运行E2E测试**

```bash
npm run test:e2e
# 预期：所有测试通过
```

- [ ] **步骤5：提交主界面代码**

```bash
git add .
git commit -m "feat: 实现主界面布局和想法列表组件"
```

### 任务4：Markdown编辑器集成

**文件：**
- 创建：`idea-journal/js/features/markdown-editor.js`
- 创建：`idea-journal/css/editor.css`
- 创建：`idea-journal/js/libs/easymde.min.js`
- 测试：`tests/unit/markdown.test.js`

- [ ] **步骤1：下载EasyMDE库**

```bash
mkdir -p idea-journal/js/libs
curl -L "https://github.com/Ionaru/easy-markdown-editor/releases/download/2.16.1/easymde.min.js" -o idea-journal/js/libs/easymde.min.js
```

- [ ] **步骤2：编写Markdown编辑器测试**

```javascript
// tests/unit/markdown.test.js
import { MarkdownEditor } from '../../js/features/markdown-editor.js';

describe('MarkdownEditor', () => {
  let editor;
  
  beforeEach(() => {
    // 创建DOM元素
    document.body.innerHTML = '<textarea id="editor"></textarea>';
    editor = new MarkdownEditor('editor');
  });
  
  test('应该初始化编辑器', () => {
    expect(editor).toBeDefined();
    expect(editor.instance).toBeDefined();
  });
  
  test('应该设置内容', () => {
    const content = '# 标题\n\n这是内容';
    editor.setContent(content);
    expect(editor.getContent()).toBe(content);
  });
  
  test('应该插入Markdown语法', () => {
    editor.setContent('普通文本');
    editor.insertMarkdown('**粗体**');
    expect(editor.getContent()).toContain('**粗体**');
  });
});
```

- [ ] **步骤3：实现Markdown编辑器封装**

```javascript
// js/features/markdown-editor.js
export class MarkdownEditor {
  constructor(elementId, options = {}) {
    this.element = document.getElementById(elementId);
    this.options = {
      spellChecker: false,
      autofocus: true,
      placeholder: '此刻你在想什么？支持 Markdown 语法...',
      status: ['lines', 'words', 'cursor'],
      toolbar: [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'image', 'table', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide'
      ],
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.instance = new EasyMDE(this.options);
    
    // 监听内容变化
    this.instance.codemirror.on('change', () => {
      this.onContentChange?.(this.getContent());
      // 自动保存草稿（防抖）
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => {
        this.autoSaveDraft();
      }, 1000);
    });
    
    // 加载草稿
    const draft = this.loadDraft();
    if (draft) {
      this.setContent(draft);
    }
  }
  
  getContent() {
    return this.instance.value();
  }
  
  setContent(content) {
    this.instance.value(content);
  }
  
  insertMarkdown(syntax) {
    const cm = this.instance.codemirror;
    const doc = cm.getDoc();
    const cursor = doc.getCursor();
    doc.replaceRange(syntax, cursor);
  }
  
  insertImage(imageData) {
    const markdown = `![图片](${imageData})`;
    this.insertMarkdown(markdown);
  }
  
  clear() {
    this.instance.value('');
  }
  
  destroy() {
    this.instance.toTextArea();
    this.instance = null;
  }
  
  // 事件处理器
  setOnContentChange(callback) {
    this.onContentChange = callback;
  }
  
  // 自动保存草稿
  autoSaveDraft() {
    const content = this.getContent();
    if (content.trim()) {
      localStorage.setItem('draft-idea', JSON.stringify({
        content,
        timestamp: new Date().toISOString()
      }));
    }
  }
  
  loadDraft() {
    const draft = localStorage.getItem('draft-idea');
    if (draft) {
      const { content, timestamp } = JSON.parse(draft);
      const draftAge = Date.now() - new Date(timestamp).getTime();
      // 草稿保留24小时
      if (draftAge < 24 * 60 * 60 * 1000) {
        return content;
      } else {
        localStorage.removeItem('draft-idea');
      }
    }
    return null;
  }
  
  clearDraft() {
    localStorage.removeItem('draft-idea');
  }
}
```

- [ ] **步骤4：创建编辑器CSS样式**

```css
/* css/editor.css */
.easy-mde-container {
  border: none;
  border-radius: 8px;
  overflow: hidden;
}

.EasyMDEContainer .CodeMirror {
  border: none;
  padding: 16px;
  font-size: 16px;
  line-height: 1.6;
  font-family: 'Inter', sans-serif;
}

.EasyMDEContainer .editor-toolbar {
  border: none;
  background: transparent;
  padding: 8px;
}

.EasyMDEContainer .editor-toolbar button {
  color: #3f4a3c;
  border: none;
  border-radius: 4px;
}

.EasyMDEContainer .editor-toolbar button:hover {
  background: #f6f3f2;
}

.EasyMDEContainer .editor-statusbar {
  border: none;
  padding: 8px;
  font-size: 12px;
  color: #3f4a3c;
}
```

- [ ] **步骤5：运行测试验证**

```bash
npm test tests/unit/markdown.test.js
# 预期：所有测试通过
```

- [ ] **步骤6：提交编辑器代码**

```bash
git add .
git commit -m "feat: 集成Markdown编辑器"
```

### 任务5：图片压缩功能

**文件：**
- 创建：`idea-journal/js/features/image-compressor.js`
- 测试：`tests/unit/image-compressor.test.js`

- [ ] **步骤1：编写图片压缩测试**

```javascript
// tests/unit/image-compressor.test.js
import { ImageCompressor } from '../../js/features/image-compressor.js';

describe('ImageCompressor', () => {
  let compressor;
  
  beforeEach(() => {
    compressor = new ImageCompressor({
      maxWidth: 1200,
      quality: 0.8
    });
  });
  
  test('应该压缩图片', async () => {
    // 创建测试图片
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 2000, 1500);
    
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
    
    const compressed = await compressor.compress(file);
    
    expect(compressed.size).toBeLessThan(file.size);
    expect(compressed.type).toBe('image/jpeg');
  });
  
  test('应该调整图片尺寸', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 1500;
    
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
    
    const compressed = await compressor.compress(file);
    
    // 解析压缩后的图片尺寸
    const img = new Image();
    img.src = URL.createObjectURL(compressed);
    await new Promise(resolve => img.onload = resolve);
    
    expect(img.width).toBeLessThanOrEqual(1200);
    expect(img.height).toBeLessThanOrEqual(1200);
    
    URL.revokeObjectURL(img.src);
  });
});
```

- [ ] **步骤2：实现图片压缩功能**

```javascript
// js/features/image-compressor.js
export class ImageCompressor {
  constructor(options = {}) {
    this.options = {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      mimeType: 'image/jpeg',
      ...options
    };
  }
  
  async compress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            const compressed = this.processImage(img);
            resolve(compressed);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = reject;
        img.src = event.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  processImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 计算新尺寸
    let { width, height } = img;
    const { maxWidth, maxHeight } = this.options;
    
    if (width > height) {
      if (width > maxWidth) {
        height = height * (maxWidth / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = width * (maxHeight / height);
        height = maxHeight;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 绘制图片
    ctx.drawImage(img, 0, 0, width, height);
    
    // 转换为Blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        this.options.mimeType,
        this.options.quality
      );
    });
  }
  
  async compressToBase64(file) {
    const blob = await this.compress(file);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
```

- [ ] **步骤3：运行测试验证**

```bash
npm test tests/unit/image-compressor.test.js
# 预期：所有测试通过
```

- [ ] **步骤4：提交图片压缩代码**

```bash
git add .
git commit -m "feat: 实现图片压缩功能"
```

### 任务6：标签管理系统

**文件：**
- 创建：`idea-journal/js/features/tag-manager.js`
- 创建：`idea-journal/js/components/tag-chip.js`
- 测试：`tests/integration/tag-management.test.js`

- [ ] **步骤1：编写标签管理测试**

```javascript
// tests/integration/tag-management.test.js
import { TagManager } from '../../js/features/tag-manager.js';
import { IdeaDatabase } from '../../js/storage/database.js';

describe('TagManager', () => {
  let tagManager;
  let db;
  
  beforeEach(async () => {
    db = new IdeaDatabase();
    await db.init();
    tagManager = new TagManager(db);
  });
  
  afterEach(async () => {
    await db.clear();
  });
  
  test('应该创建标签', async () => {
    const tag = await tagManager.createTag({
      name: '测试标签',
      color: '#006e1c'
    });
    
    expect(tag.id).toBeDefined();
    expect(tag.name).toBe('测试标签');
  });
  
  test('应该获取所有标签', async () => {
    await tagManager.createTag({ name: '标签1', color: '#006e1c' });
    await tagManager.createTag({ name: '标签2', color: '#0061a4' });
    
    const tags = await tagManager.getAllTags();
    expect(tags.length).toBe(2);
  });
  
  test('应该为想法添加标签', async () => {
    const tag1 = await tagManager.createTag({ name: '标签1', color: '#006e1c' });
    const tag2 = await tagManager.createTag({ name: '标签2', color: '#0061a4' });
    
    const idea = await db.addIdea({
      title: '测试想法',
      content: '测试内容',
      tags: []
    });
    
    await tagManager.addTagsToIdea(idea, [tag1.id, tag2.id]);
    
    const updatedIdea = await db.getIdea(idea);
    expect(updatedIdea.tags).toContain(tag1.id);
    expect(updatedIdea.tags).toContain(tag2.id);
  });
});
```

- [ ] **步骤2：实现标签管理器**

```javascript
// js/features/tag-manager.js
export class TagManager {
  constructor(database) {
    this.db = database;
  }
  
  async createTag(tagData) {
    const tag = {
      ...tagData,
      count: 0,
      created: new Date()
    };
    
    const id = await this.db.addTag(tag);
    return { id, ...tag };
  }
  
  async getAllTags() {
    return await this.db.getAllTags();
  }
  
  async getTagById(id) {
    return await this.db.getTag(id);
  }
  
  async updateTag(id, updates) {
    const tag = await this.getTagById(id);
    const updatedTag = { ...tag, ...updates };
    await this.db.updateTag(updatedTag);
    return updatedTag;
  }
  
  async deleteTag(id) {
    await this.db.deleteTag(id);
  }
  
  async incrementTagCount(tagId) {
    const tag = await this.getTagById(tagId);
    if (tag) {
      tag.count = (tag.count || 0) + 1;
      await this.db.updateTag(tag);
    }
  }
  
  async addTagsToIdea(ideaId, tagIds) {
    const idea = await this.db.getIdea(ideaId);
    const uniqueTagIds = [...new Set([...idea.tags, ...tagIds])];
    
    idea.tags = uniqueTagIds;
    await this.db.updateIdea(idea);
    
    // 更新标签计数
    for (const tagId of tagIds) {
      await this.incrementTagCount(tagId);
    }
    
    return idea;
  }
  
  async removeTagFromIdea(ideaId, tagId) {
    const idea = await this.db.getIdea(ideaId);
    idea.tags = idea.tags.filter(id => id !== tagId);
    await this.db.updateIdea(idea);
    return idea;
  }
  
  async getPopularTags(limit = 10) {
    const tags = await this.getAllTags();
    return tags
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, limit);
  }
}
```

- [ ] **步骤3：运行集成测试**

```bash
npm test tests/integration/tag-management.test.js
# 预期：所有测试通过
```

- [ ] **步骤4：提交标签管理代码**

```bash
git add .
git commit -m "feat: 实现标签管理系统"
```

### 任务7：热力图可视化

**文件：**
- 创建：`idea-journal/js/components/heatmap.js`
- 创建：`idea-journal/js/features/data-analytics.js`
- 测试：`tests/integration/heatmap.test.js`

- [ ] **步骤1：下载Chart.js库**

```bash
curl -L "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" -o idea-journal/js/libs/chart.min.js
```

- [ ] **步骤2：编写热力图测试**

```javascript
// tests/integration/heatmap.test.js
import { HeatmapChart } from '../../js/components/heatmap.js';

describe('HeatmapChart', () => {
  let heatmap;
  let canvas;
  
  beforeEach(() => {
    // 创建canvas元素
    document.body.innerHTML = '<canvas id="heatmap"></canvas>';
    canvas = document.getElementById('heatmap');
    heatmap = new HeatmapChart('heatmap');
  });
  
  test('应该初始化热力图', () => {
    expect(heatmap).toBeDefined();
    expect(heatmap.chart).toBeDefined();
  });
  
  test('应该更新热力图数据', () => {
    const data = {
      labels: ['2024-01-01', '2024-01-02', '2024-01-03'],
      values: [2, 5, 1]
    };
    
    heatmap.updateData(data);
    
    expect(heatmap.chart.data.labels).toEqual(data.labels);
    expect(heatmap.chart.data.datasets[0].data).toEqual(data.values);
  });
  
  test('应该生成周数据', () => {
    const ideas = [
      { created: new Date('2024-01-01T10:00:00') },
      { created: new Date('2024-01-01T14:00:00') },
      { created: new Date('2024-01-02T09:00:00') }
    ];
    
    const weeklyData = heatmap.generateWeeklyData(ideas);
    
    expect(weeklyData['2024-01-01']).toBe(2);
    expect(weeklyData['2024-01-02']).toBe(1);
  });
});
```

- [ ] **步骤3：实现热力图组件**

```javascript
// js/components/heatmap.js
export class HeatmapChart {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.options = {
      colorScheme: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
      ...options
    };
    
    this.init();
  }
  
  init() {
    const ctx = this.canvas.getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: '想法数量',
          data: [],
          backgroundColor: this.options.colorScheme[1],
          borderRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => `${item.raw} 个想法`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
  
  updateData(data) {
    this.chart.data.labels = data.labels;
    this.chart.data.datasets[0].data = data.values;
    this.chart.update();
  }
  
  generateWeeklyData(ideas) {
    const weeklyData = {};
    
    ideas.forEach(idea => {
      const date = idea.created.toISOString().split('T')[0];
      weeklyData[date] = (weeklyData[date] || 0) + 1;
    });
    
    return weeklyData;
  }
  
  generateMonthData(ideas) {
    const monthData = {};
    
    ideas.forEach(idea => {
      const month = idea.created.toISOString().slice(0, 7); // YYYY-MM
      monthData[month] = (monthData[month] || 0) + 1;
    });
    
    return monthData;
  }
  
  getColorForValue(value, maxValue) {
    const ratio = value / maxValue;
    const index = Math.min(Math.floor(ratio * this.options.colorScheme.length), this.options.colorScheme.length - 1);
    return this.options.colorScheme[index];
  }
  
  updateColors(values) {
    const maxValue = Math.max(...values, 1);
    const colors = values.map(value => this.getColorForValue(value, maxValue));
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.update();
  }
}
```

- [ ] **步骤4：运行集成测试**

```bash
npm test tests/integration/heatmap.test.js
# 预期：所有测试通过
```

- [ ] **步骤5：提交热力图代码**

```bash
git add .
git commit -m "feat: 实现热力图可视化功能"
```

### 任务8：周报生成功能

**文件：**
- 创建：`idea-journal/js/features/weekly-summary.js`
- 创建：`idea-journal/js/components/weekly-report.js`
- 测试：`tests/unit/weekly-summary.test.js`

- [ ] **步骤1：编写周报生成测试**

```javascript
// tests/unit/weekly-summary.test.js
import { WeeklySummary } from '../../js/features/weekly-summary.js';

describe('WeeklySummary', () => {
  let summary;
  
  beforeEach(() => {
    summary = new WeeklySummary();
  });
  
  test('应该生成周报摘要', () => {
    const ideas = [
      {
        title: '想法1',
        content: '这是一个关于产品改进的想法',
        created: new Date('2024-01-01T10:00:00'),
        tags: ['工作', '产品']
      },
      {
        title: '想法2',
        content: '关于团队协作的思考',
        created: new Date('2024-01-02T14:00:00'),
        tags: ['工作', '团队']
      }
    ];
    
    const report = summary.generateWeeklyReport(ideas);
    
    expect(report.totalIdeas).toBe(2);
    expect(report.topTags).toContain('工作');
    expect(report.summary).toBeDefined();
  });
  
  test('应该提取关键词', () => {
    const content = '这是一个关于产品改进的想法，需要考虑用户体验和功能优化';
    const keywords = summary.extractKeywords(content);
    
    expect(keywords).toContain('产品');
    expect(keywords).toContain('用户体验');
    expect(keywords).toContain('功能优化');
  });
  
  test('应该生成摘要文本', () => {
    const ideas = [
      { content: '产品需要改进用户体验' },
      { content: '团队协作需要加强沟通' }
    ];
    
    const summaryText = summary.generateSummaryText(ideas);
    
    expect(summaryText).toContain('产品');
    expect(summaryText).toContain('团队');
  });
});
```

- [ ] **步骤2：实现周报生成器**

```javascript
// js/features/weekly-summary.js
export class WeeklySummary {
  constructor() {
    this.keywords = {
      '工作': ['项目', '任务', '会议', '客户', '产品', '功能', '优化', '改进'],
      '生活': ['家庭', '朋友', '旅行', '健康', '运动', '饮食', '娱乐'],
      '学习': ['读书', '课程', '技能', '知识', '研究', '实践', '思考'],
      '灵感': ['创意', '想法', '灵感', '创新', '设计', '艺术']
    };
  }
  
  generateWeeklyReport(ideas, weekStart, weekEnd) {
    const weekIdeas = ideas.filter(idea => {
      const date = idea.created;
      return date >= weekStart && date <= weekEnd;
    });
    
    const report = {
      weekStart,
      weekEnd,
      totalIdeas: weekIdeas.length,
      topTags: this.getTopTags(weekIdeas),
      summary: this.generateSummaryText(weekIdeas),
      keywords: this.extractAllKeywords(weekIdeas),
      dailyDistribution: this.getDailyDistribution(weekIdeas)
    };
    
    return report;
  }
  
  getTopTags(ideas, limit = 5) {
    const tagCount = {};
    
    ideas.forEach(idea => {
      idea.tags?.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag);
  }
  
  extractKeywords(content) {
    const keywords = [];
    
    Object.values(this.keywords).flat().forEach(keyword => {
      if (content.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  }
  
  extractAllKeywords(ideas) {
    const allKeywords = new Set();
    
    ideas.forEach(idea => {
      const content = `${idea.title} ${idea.content}`;
      const keywords = this.extractKeywords(content);
      keywords.forEach(keyword => allKeywords.add(keyword));
    });
    
    return Array.from(allKeywords);
  }
  
  generateSummaryText(ideas) {
    if (ideas.length === 0) return '本周没有记录想法。';
    
    const totalWords = ideas.reduce((sum, idea) => sum + idea.content.length, 0);
    const topTags = this.getTopTags(ideas, 3);
    
    let summary = `本周记录了 ${ideas.length} 个想法，共 ${totalWords} 字。`;
    
    if (topTags.length > 0) {
      summary += ` 主要关注 ${topTags.join('、')} 方面。`;
    }
    
    return summary;
  }
  
  getDailyDistribution(ideas) {
    const distribution = {};
    
    ideas.forEach(idea => {
      const day = idea.created.toISOString().split('T')[0];
      distribution[day] = (distribution[day] || 0) + 1;
    });
    
    return distribution;
  }
  
  getInsights(report) {
    const insights = [];
    
    if (report.totalIdeas === 0) {
      insights.push('本周记录较少，考虑每天记录一个想法。');
    } else if (report.totalIdeas >= 7) {
      insights.push('记录习惯良好！继续保持。');
    }
    
    if (report.topTags.length > 3) {
      insights.push('思考领域较广泛，建议集中精力在关键领域。');
    }
    
    return insights;
  }
}
```

- [ ] **步骤3：运行单元测试**

```bash
npm test tests/unit/weekly-summary.test.js
# 预期：所有测试通过
```

- [ ] **步骤4：提交周报生成代码**

```bash
git add .
git commit -m "feat: 实现周报生成功能"
```

### 任务9：数据导入导出

**文件：**
- 创建：`idea-journal/js/storage/export.js`
- 创建：`idea-journal/js/storage/backup.js`
- 测试：`tests/unit/export.test.js`

- [ ] **步骤1：编写导入导出测试**

```javascript
// tests/unit/export.test.js
import { DataExporter } from '../../js/storage/export.js';
import { DataImporter } from '../../js/storage/import.js';

describe('DataExporter', () => {
  let exporter;
  
  beforeEach(() => {
    exporter = new DataExporter();
  });
  
  test('应该导出为JSON格式', () => {
    const ideas = [
      {
        id: 1,
        title: '测试想法',
        content: '测试内容',
        tags: ['测试'],
        created: new Date('2024-01-01')
      }
    ];
    
    const json = exporter.toJSON(ideas);
    const parsed = JSON.parse(json);
    
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('测试想法');
  });
  
  test('应该导出为Markdown格式', () => {
    const ideas = [
      {
        id: 1,
        title: '测试想法',
        content: '测试内容',
        tags: ['测试'],
        created: new Date('2024-01-01')
      }
    ];
    
    const markdown = exporter.toMarkdown(ideas);
    
    expect(markdown).toContain('# 测试想法');
    expect(markdown).toContain('测试内容');
    expect(markdown).toContain('标签: 测试');
  });
  
  test('应该创建下载链接', () => {
    const data = JSON.stringify({ test: 'data' });
    const url = exporter.createDownloadLink(data, 'test.json', 'application/json');
    
    expect(url).toMatch(/^blob:/);
    
    // 清理
    URL.revokeObjectURL(url);
  });
});
```

- [ ] **步骤2：实现数据导出器**

```javascript
// js/storage/export.js
export class DataExporter {
  toJSON(ideas) {
    return JSON.stringify(ideas, null, 2);
  }
  
  toMarkdown(ideas) {
    let markdown = '# 想法导出记录\n\n';
    
    ideas.forEach(idea => {
      markdown += `## ${idea.title}\n\n`;
      markdown += `**创建时间:** ${idea.created.toLocaleString()}\n\n`;
      
      if (idea.tags && idea.tags.length > 0) {
        markdown += `**标签:** ${idea.tags.join(', ')}\n\n`;
      }
      
      markdown += `${idea.content}\n\n`;
      markdown += '---\n\n';
    });
    
    return markdown;
  }
  
  toCSV(ideas) {
    const headers = ['ID', '标题', '内容', '标签', '创建时间', '更新时间'];
    const rows = ideas.map(idea => [
      idea.id,
      `"${idea.title.replace(/"/g, '""')}"`,
      `"${idea.content.replace(/"/g, '""')}"`,
      idea.tags ? idea.tags.join(';') : '',
      idea.created.toISOString(),
      idea.updated ? idea.updated.toISOString() : ''
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
  
  createDownloadLink(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    return url;
  }
  
  exportAll(ideas, format = 'json') {
    let data, filename, mimeType;
    
    switch (format) {
      case 'json':
        data = this.toJSON(ideas);
        filename = `ideas-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      case 'markdown':
        data = this.toMarkdown(ideas);
        filename = `ideas-export-${new Date().toISOString().split('T')[0]}.md`;
        mimeType = 'text/markdown';
        break;
      case 'csv':
        data = this.toCSV(ideas);
        filename = `ideas-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        throw new Error(`不支持的格式: ${format}`);
    }
    
    return this.createDownloadLink(data, filename, mimeType);
  }
}
```

- [ ] **步骤3：实现数据导入器**

```javascript
// js/storage/import.js
export class DataImporter {
  constructor(database) {
    this.db = database;
  }
  
  async importJSON(fileContent) {
    try {
      const ideas = JSON.parse(fileContent);
      
      if (!Array.isArray(ideas)) {
        throw new Error('JSON格式无效：必须是数组');
      }
      
      const imported = [];
      for (const idea of ideas) {
        const id = await this.db.addIdea({
          title: idea.title || '未命名',
          content: idea.content || '',
          tags: idea.tags || [],
          created: idea.created ? new Date(idea.created) : new Date(),
          updated: idea.updated ? new Date(idea.updated) : new Date()
        });
        imported.push(id);
      }
      
      return imported;
    } catch (error) {
      throw new Error(`JSON导入失败: ${error.message}`);
    }
  }
  
  async importMarkdown(content) {
    const ideas = this.parseMarkdown(content);
    const imported = [];
    
    for (const idea of ideas) {
      const id = await this.db.addIdea(idea);
      imported.push(id);
    }
    
    return imported;
  }
  
  parseMarkdown(content) {
    const ideas = [];
    const sections = content.split('---');
    
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      if (lines.length < 3) return;
      
      const titleMatch = lines[0].match(/^#\s+(.+)/);
      if (!titleMatch) return;
      
      const idea = {
        title: titleMatch[1],
        content: '',
        tags: [],
        created: new Date()
      };
      
      let inContent = false;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('**创建时间:**')) {
          const dateStr = line.replace('**创建时间:**', '').trim();
          idea.created = new Date(dateStr);
        } else if (line.startsWith('**标签:**')) {
          const tagsStr = line.replace('**标签:**', '').trim();
          idea.tags = tagsStr.split(',').map(tag => tag.trim());
        } else if (line.trim() !== '') {
          inContent = true;
          idea.content += line + '\n';
        }
      }
      
      idea.content = idea.content.trim();
      ideas.push(idea);
    });
    
    return ideas;
  }
  
  async importFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const content = event.target.result;
          let imported;
          
          switch (extension) {
            case 'json':
              imported = await this.importJSON(content);
              break;
            case 'md':
            case 'markdown':
              imported = await this.importMarkdown(content);
              break;
            default:
              throw new Error(`不支持的文件格式: ${extension}`);
          }
          
          resolve(imported);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}
```

- [ ] **步骤4：运行单元测试**

```bash
npm test tests/unit/export.test.js
# 预期：所有测试通过
```

- [ ] **步骤5：提交导入导出代码**

```bash
git add .
git commit -m "feat: 实现数据导入导出功能"
```

### 任务10：完整应用集成与测试

**文件：**
- 修改：`idea-journal/js/app.js`
- 修改：`idea-journal/index.html`
- 创建：`tests/e2e/offline.test.js`
- 创建：`package.json`

- [ ] **步骤1：创建package.json**

```json
{
  "name": "idea-journal",
  "version": "1.0.0",
  "description": "安卓想法记录工具",
  "scripts": {
    "dev": "npx serve . -p 3000",
    "test": "npx jest",
    "test:unit": "npx jest tests/unit",
    "test:integration": "npx jest tests/integration",
    "test:e2e": "npx jest tests/e2e",
    "build": "npx html-minifier --collapse-whitespace --remove-comments *.html -o dist/",
    "serve": "npx serve dist -p 3000"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "serve": "^14.0.0",
    "html-minifier": "^4.0.0"
  }
}
```

- [ ] **步骤2：实现主应用入口**

```javascript
// js/app.js
import { IdeaDatabase } from './storage/database.js';
import { IdeaList } from './components/idea-list.js';
import { MarkdownEditor } from './features/markdown-editor.js';
import { TagManager } from './features/tag-manager.js';
import { ImageCompressor } from './features/image-compressor.js';
import { HeatmapChart } from './components/heatmap.js';
import { WeeklySummary } from './features/weekly-summary.js';
import { DataExporter } from './storage/export.js';
import { DataImporter } from './storage/import.js';

class IdeaJournalApp {
  constructor() {
    this.database = null;
    this.ideaList = null;
    this.editor = null;
    this.tagManager = null;
    this.imageCompressor = null;
    this.heatmap = null;
    this.weeklySummary = null;
    this.exporter = null;
    this.importer = null;
    
    this.currentView = 'record';
  }
  
  async init() {
    try {
      // 初始化数据库
      this.database = new IdeaDatabase();
      await this.database.init();
      
      // 初始化组件
      this.ideaList = new IdeaList('ideas-container');
      this.tagManager = new TagManager(this.database);
      this.imageCompressor = new ImageCompressor();
      this.weeklySummary = new WeeklySummary();
      this.exporter = new DataExporter();
      this.importer = new DataImporter(this.database);
      
      // 初始化编辑器
      this.editor = new MarkdownEditor('quick-entry', {
        placeholder: '捕捉此刻的想法...'
      });
      
      // 初始化热力图
      this.heatmap = new HeatmapChart('heatmap-chart');
      
      // 绑定事件
      this.bindEvents();
      
      // 加载数据
      await this.loadData();
      
      // 注册Service Worker
      this.registerServiceWorker();
      
      console.log('想法记录应用初始化完成');
    } catch (error) {
      console.error('应用初始化失败:', error);
    }
  }
  
  bindEvents() {
    // 快速记录按钮
    document.getElementById('publish-btn').addEventListener('click', () => {
      this.publishIdea();
    });
    
    // 搜索按钮
    document.getElementById('search-btn').addEventListener('click', () => {
      this.showSearch();
    });
    
    // 新增按钮
    document.getElementById('add-btn').addEventListener('click', () => {
      this.showEditor();
    });
    
    // 标签筛选
    document.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        this.filterByTag(e.target.dataset.tag);
      });
    });
    
    // 底部导航
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView(e.target.closest('a').href.slice(1));
      });
    });
    
    // 图片上传
    document.getElementById('image-upload')?.addEventListener('change', (e) => {
      this.handleImageUpload(e.target.files[0]);
    });
  }
  
  async loadData() {
    await this.ideaList.loadIdeas(this.database);
    
    const ideas = await this.database.getAllIdeas();
    const weeklyData = this.heatmap.generateWeeklyData(ideas);
    this.heatmap.updateData({
      labels: Object.keys(weeklyData),
      values: Object.values(weeklyData)
    });
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
    
    await this.database.addIdea(idea);
    this.editor.clear();
    await this.loadData();
  }
  
  extractTitle(content) {
    const firstLine = content.split('\n')[0];
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  }
  
  async handleImageUpload(file) {
    if (!file) return;
    
    try {
      const compressed = await this.imageCompressor.compressToBase64(file);
      this.editor.insertImage(compressed);
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败');
    }
  }
  
  filterByTag(tag) {
    // 更新标签选中状态
    document.querySelectorAll('.tag-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.tag === tag);
    });
    
    // 过滤想法列表
    this.ideaList.filterByTag(tag);
  }
  
  switchView(view) {
    this.currentView = view;
    
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.href.includes(view));
    });
    
    // 切换视图
    document.querySelectorAll('.view-section').forEach(section => {
      section.style.display = section.id === `${view}-view` ? 'block' : 'none';
    });
  }
  
  showSearch() {
    // 实现搜索功能
  }
  
  showEditor() {
    // 实现编辑器显示
  }
  
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker 注册成功');
      } catch (error) {
        console.error('Service Worker 注册失败:', error);
      }
    }
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  const app = new IdeaJournalApp();
  app.init();
});
```

- [ ] **步骤3：编写离线测试**

```javascript
// tests/e2e/offline.test.js
describe('离线功能测试', () => {
  beforeEach(async () => {
    // 模拟离线状态
    await page.setOfflineMode(true);
    await page.goto('http://localhost:3000');
  });
  
  afterEach(async () => {
    await page.setOfflineMode(false);
  });
  
  test('离线时应该显示缓存内容', async () => {
    const title = await page.textContent('h1');
    expect(title).toBe('想法记录');
  });
  
  test('离线时应该能创建想法', async () => {
    await page.type('#quick-entry', '离线测试想法');
    await page.click('#publish-btn');
    
    const ideas = await page.$$('.idea-card');
    expect(ideas.length).toBeGreaterThan(0);
  });
  
  test('离线时应该能查看想法', async () => {
    const ideas = await page.$$('.idea-card');
    expect(ideas.length).toBeGreaterThan(0);
  });
});
```

- [ ] **步骤4：安装依赖并运行测试**

```bash
npm install
npm run test:e2e
# 预期：所有测试通过
```

- [ ] **步骤5：提交完整应用代码**

```bash
git add .
git commit -m "feat: 完成应用集成与端到端测试"
```

### 任务11：性能优化与部署准备

**文件：**
- 修改：`idea-journal/css/style.css`
- 修改：`idea-journal/js/app.js`
- 创建：`scripts/optimize.js`
- 创建：`scripts/deploy.sh`

- [ ] **步骤1：创建性能优化脚本**

```javascript
// scripts/optimize.js
const fs = require('fs');
const path = require('path');

class AssetOptimizer {
  constructor() {
    this.distDir = path.join(__dirname, '../dist');
  }
  
  optimizeCSS() {
    const cssPath = path.join(__dirname, '../css/style.css');
    let css = fs.readFileSync(cssPath, 'utf8');
    
    // 移除注释
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // 压缩空白
    css = css.replace(/\s+/g, ' ');
    
    // 移除分号前的空格
    css = css.replace(/\s*;\s*/g, ';');
    
    // 移除冒号后的空格
    css = css.replace(/\s*:\s*/g, ':');
    
    const optimizedPath = path.join(this.distDir, 'css/style.css');
    fs.mkdirSync(path.dirname(optimizedPath), { recursive: true });
    fs.writeFileSync(optimizedPath, css);
    
    console.log('CSS优化完成');
  }
  
  optimizeJS() {
    const jsPath = path.join(__dirname, '../js/app.js');
    let js = fs.readFileSync(jsPath, 'utf8');
    
    // 移除注释
    js = js.replace(/\/\/.*$/gm, '');
    js = js.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // 简化空白
    js = js.replace(/\s+/g, ' ');
    
    const optimizedPath = path.join(this.distDir, 'js/app.js');
    fs.mkdirSync(path.dirname(optimizedPath), { recursive: true });
    fs.writeFileSync(optimizedPath, js);
    
    console.log('JS优化完成');
  }
  
  copyAssets() {
    const assetsDir = path.join(__dirname, '../assets');
    const distAssetsDir = path.join(this.distDir, 'assets');
    
    if (fs.existsSync(assetsDir)) {
      fs.cpSync(assetsDir, distAssetsDir, { recursive: true });
      console.log('资源文件复制完成');
    }
  }
  
  generateServiceWorker() {
    const swContent = `
const CACHE_NAME = 'idea-journal-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
`;
    
    const swPath = path.join(this.distDir, 'sw.js');
    fs.writeFileSync(swPath, swContent);
    console.log('Service Worker生成完成');
  }
  
  run() {
    console.log('开始优化...');
    
    // 创建dist目录
    fs.mkdirSync(this.distDir, { recursive: true });
    
    this.optimizeCSS();
    this.optimizeJS();
    this.copyAssets();
    this.generateServiceWorker();
    
    console.log('优化完成！');
  }
}

const optimizer = new AssetOptimizer();
optimizer.run();
```

- [ ] **步骤2：创建部署脚本**

```bash
#!/bin/bash
# scripts/deploy.sh

echo "开始部署准备..."

# 安装依赖
npm install

# 运行测试
echo "运行测试..."
npm run test:unit
npm run test:integration

# 优化资源
echo "优化资源..."
node scripts/optimize.js

# 复制文件到dist
echo "复制文件..."
cp index.html dist/
cp manifest.json dist/

echo "部署准备完成！"
echo "dist目录已准备就绪"
```

- [ ] **步骤3：运行性能优化**

```bash
node scripts/optimize.js
# 预期：优化完成
```

- [ ] **步骤4：运行部署脚本**

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
# 预期：所有测试通过，优化完成
```

- [ ] **步骤5：提交优化代码**

```bash
git add .
git commit -m "perf: 性能优化与部署准备"
```

### 任务12：设置界面实现

**文件：**
- 创建：`idea-journal/js/components/settings.js`
- 创建：`idea-journal/js/features/theme-manager.js`
- 创建：`idea-journal/js/features/data-manager.js`
- 测试：`tests/unit/settings.test.js`

- [ ] **步骤1：编写设置界面测试**

```javascript
// tests/unit/settings.test.js
import { SettingsComponent } from '../../js/components/settings.js';

describe('SettingsComponent', () => {
  let settings;
  let container;
  
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    settings = new SettingsComponent(container);
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });
  
  test('应该初始化设置界面', () => {
    expect(settings).toBeDefined();
    expect(settings.container).toBe(container);
  });
  
  test('应该切换主题', async () => {
    const themeToggle = container.querySelector('#theme-toggle');
    expect(themeToggle).toBeDefined();
    
    // 初始应为浅色主题
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    themeToggle.click();
    
    // 应切换为深色主题
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
  
  test('应该调整字体大小', () => {
    const fontSizeSlider = container.querySelector('#font-size-slider');
    expect(fontSizeSlider).toBeDefined();
    
    fontSizeSlider.value = '18';
    fontSizeSlider.dispatchEvent(new Event('input'));
    
    expect(document.documentElement.style.fontSize).toBe('18px');
  });
});
```

- [ ] **步骤2：实现主题管理器**

```javascript
// js/features/theme-manager.js
export class ThemeManager {
  constructor() {
    this.currentTheme = this.getSavedTheme() || 'light';
    this.applyTheme();
  }
  
  getSavedTheme() {
    return localStorage.getItem('app-theme');
  }
  
  saveTheme(theme) {
    localStorage.setItem('app-theme', theme);
  }
  
  applyTheme() {
    if (this.currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.saveTheme(this.currentTheme);
    this.applyTheme();
    return this.currentTheme;
  }
  
  setTheme(theme) {
    this.currentTheme = theme;
    this.saveTheme(theme);
    this.applyTheme();
  }
  
  getTheme() {
    return this.currentTheme;
  }
  
  // 监听系统主题变化
  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      if (!this.getSavedTheme()) {
        this.currentTheme = e.matches ? 'dark' : 'light';
        this.applyTheme();
      }
    });
  }
}
```

- [ ] **步骤3：实现数据管理器**

```javascript
// js/features/data-manager.js
export class DataManager {
  constructor(database) {
    this.db = database;
  }
  
  async getStorageInfo() {
    const ideas = await this.db.getAllIdeas();
    const tags = await this.db.getAllTags();
    const categories = await this.db.getAllCategories();
    
    // 估算存储大小
    const ideasSize = JSON.stringify(ideas).length;
    const tagsSize = JSON.stringify(tags).length;
    const categoriesSize = JSON.stringify(categories).length;
    
    const totalSize = ideasSize + tagsSize + categoriesSize;
    
    return {
      ideasCount: ideas.length,
      tagsCount: tags.length,
      categoriesCount: categories.length,
      totalSize,
      formattedSize: this.formatBytes(totalSize)
    };
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  async clearOldData(daysOld = 365) {
    const ideas = await this.db.getAllIdeas();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldIdeas = ideas.filter(idea => new Date(idea.created) < cutoffDate);
    
    for (const idea of oldIdeas) {
      await this.db.deleteIdea(idea.id);
    }
    
    return oldIdeas.length;
  }
  
  async backupData() {
    const ideas = await this.db.getAllIdeas();
    const tags = await this.db.getAllTags();
    const categories = await this.db.getAllCategories();
    
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        ideas,
        tags,
        categories
      }
    };
    
    return JSON.stringify(backup, null, 2);
  }
  
  async restoreData(backupJson) {
    try {
      const backup = JSON.parse(backupJson);
      
      if (backup.version !== 1) {
        throw new Error('不支持的备份版本');
      }
      
      const { ideas, tags, categories } = backup.data;
      
      // 清空现有数据
      await this.db.clear();
      
      // 恢复标签
      for (const tag of tags) {
        await this.db.addTag(tag);
      }
      
      // 恢复分类
      for (const category of categories) {
        await this.db.addCategory(category);
      }
      
      // 恢复想法
      for (const idea of ideas) {
        await this.db.addIdea(idea);
      }
      
      return true;
    } catch (error) {
      console.error('恢复数据失败:', error);
      throw error;
    }
  }
}
```

- [ ] **步骤4：实现设置界面组件**

```javascript
// js/components/settings.js
import { ThemeManager } from '../features/theme-manager.js';
import { DataManager } from '../features/data-manager.js';

export class SettingsComponent {
  constructor(container, database) {
    this.container = container;
    this.db = database;
    this.themeManager = new ThemeManager();
    this.dataManager = new DataManager(database);
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
    this.loadSettings();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="settings-container">
        <h2 class="settings-title">设置</h2>
        
        <!-- 通用设置 -->
        <section class="settings-section">
          <h3>通用设置</h3>
          
          <div class="setting-item">
            <div class="setting-info">
              <label for="theme-toggle">深色模式</label>
              <p>切换应用主题</p>
            </div>
            <div class="setting-control">
              <input type="checkbox" id="theme-toggle" class="toggle-switch">
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label for="font-size-slider">字体大小</label>
              <p>调整应用内文字大小</p>
            </div>
            <div class="setting-control">
              <input type="range" id="font-size-slider" min="12" max="24" value="16" step="1">
              <span id="font-size-value">16px</span>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label for="auto-save-toggle">自动保存</label>
              <p>编辑时自动保存草稿</p>
            </div>
            <div class="setting-control">
              <input type="checkbox" id="auto-save-toggle" class="toggle-switch" checked>
            </div>
          </div>
        </section>
        
        <!-- 数据管理 -->
        <section class="settings-section">
          <h3>数据管理</h3>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>存储信息</label>
              <p>想法数量、标签数量、存储空间</p>
            </div>
            <div class="setting-control">
              <button id="storage-info-btn" class="setting-btn">查看</button>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>导出数据</label>
              <p>导出为JSON或Markdown格式</p>
            </div>
            <div class="setting-control">
              <button id="export-json-btn" class="setting-btn">JSON</button>
              <button id="export-md-btn" class="setting-btn">Markdown</button>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>导入数据</label>
              <p>从JSON或Markdown文件导入</p>
            </div>
            <div class="setting-control">
              <input type="file" id="import-file" accept=".json,.md" style="display: none;">
              <button id="import-btn" class="setting-btn">导入</button>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>备份设置</label>
              <p>创建和恢复数据备份</p>
            </div>
            <div class="setting-control">
              <button id="backup-btn" class="setting-btn">创建备份</button>
              <button id="restore-btn" class="setting-btn">恢复备份</button>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>清理旧数据</label>
              <p>删除一年前的想法</p>
            </div>
            <div class="setting-control">
              <button id="cleanup-btn" class="setting-btn danger">清理</button>
            </div>
          </div>
        </section>
        
        <!-- 关于信息 -->
        <section class="settings-section">
          <h3>关于</h3>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>版本信息</label>
              <p>想法记录 v1.0.0</p>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>使用帮助</label>
              <p>查看使用说明和技巧</p>
            </div>
            <div class="setting-control">
              <button id="help-btn" class="setting-btn">帮助</button>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>反馈</label>
              <p>提交问题和建议</p>
            </div>
            <div class="setting-control">
              <button id="feedback-btn" class="setting-btn">反馈</button>
            </div>
          </div>
        </section>
      </div>
    `;
  }
  
  bindEvents() {
    // 主题切换
    const themeToggle = this.container.querySelector('#theme-toggle');
    themeToggle.addEventListener('change', () => {
      const newTheme = this.themeManager.toggleTheme();
      themeToggle.checked = newTheme === 'dark';
    });
    
    // 字体大小调整
    const fontSizeSlider = this.container.querySelector('#font-size-slider');
    const fontSizeValue = this.container.querySelector('#font-size-value');
    
    fontSizeSlider.addEventListener('input', (e) => {
      const size = e.target.value;
      fontSizeValue.textContent = `${size}px`;
      document.documentElement.style.fontSize = `${size}px`;
      localStorage.setItem('app-font-size', size);
    });
    
    // 自动保存设置
    const autoSaveToggle = this.container.querySelector('#auto-save-toggle');
    autoSaveToggle.addEventListener('change', (e) => {
      localStorage.setItem('app-auto-save', e.target.checked);
    });
    
    // 存储信息
    const storageInfoBtn = this.container.querySelector('#storage-info-btn');
    storageInfoBtn.addEventListener('click', async () => {
      const info = await this.dataManager.getStorageInfo();
      this.showStorageInfo(info);
    });
    
    // 导出功能
    const exportJsonBtn = this.container.querySelector('#export-json-btn');
    exportJsonBtn.addEventListener('click', () => this.exportData('json'));
    
    const exportMdBtn = this.container.querySelector('#export-md-btn');
    exportMdBtn.addEventListener('click', () => this.exportData('markdown'));
    
    // 导入功能
    const importBtn = this.container.querySelector('#import-btn');
    const importFile = this.container.querySelector('#import-file');
    
    importBtn.addEventListener('click', () => {
      importFile.click();
    });
    
    importFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.importData(file);
      }
    });
    
    // 备份功能
    const backupBtn = this.container.querySelector('#backup-btn');
    backupBtn.addEventListener('click', () => this.createBackup());
    
    const restoreBtn = this.container.querySelector('#restore-btn');
    restoreBtn.addEventListener('click', () => this.restoreBackup());
    
    // 清理功能
    const cleanupBtn = this.container.querySelector('#cleanup-btn');
    cleanupBtn.addEventListener('click', () => this.cleanupOldData());
    
    // 帮助功能
    const helpBtn = this.container.querySelector('#help-btn');
    helpBtn.addEventListener('click', () => this.showHelp());
    
    // 反馈功能
    const feedbackBtn = this.container.querySelector('#feedback-btn');
    feedbackBtn.addEventListener('click', () => this.showFeedback());
  }
  
  loadSettings() {
    // 加载主题设置
    const currentTheme = this.themeManager.getTheme();
    const themeToggle = this.container.querySelector('#theme-toggle');
    themeToggle.checked = currentTheme === 'dark';
    
    // 加载字体大小设置
    const fontSize = localStorage.getItem('app-font-size') || '16';
    const fontSizeSlider = this.container.querySelector('#font-size-slider');
    const fontSizeValue = this.container.querySelector('#font-size-value');
    
    fontSizeSlider.value = fontSize;
    fontSizeValue.textContent = `${fontSize}px`;
    document.documentElement.style.fontSize = `${fontSize}px`;
    
    // 加载自动保存设置
    const autoSave = localStorage.getItem('app-auto-save') !== 'false';
    const autoSaveToggle = this.container.querySelector('#auto-save-toggle');
    autoSaveToggle.checked = autoSave;
  }
  
  async showStorageInfo(info) {
    alert(`存储信息：
想法数量: ${info.ideasCount}
标签数量: ${info.tagsCount}
分类数量: ${info.categoriesCount}
总大小: ${info.formattedSize}`);
  }
  
  async exportData(format) {
    try {
      const ideas = await this.db.getAllIdeas();
      const exporter = new DataExporter();
      exporter.exportAll(ideas, format);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  }
  
  async importData(file) {
    try {
      const importer = new DataImporter(this.db);
      const count = await importer.importFile(file);
      alert(`成功导入 ${count.length} 个想法`);
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败: ' + error.message);
    }
  }
  
  async createBackup() {
    try {
      const backupJson = await this.dataManager.backupData();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `idea-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('备份失败:', error);
      alert('备份失败');
    }
  }
  
  async restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        await this.dataManager.restoreData(text);
        alert('数据恢复成功');
        window.location.reload();
      } catch (error) {
        console.error('恢复失败:', error);
        alert('恢复失败: ' + error.message);
      }
    };
    
    input.click();
  }
  
  async cleanupOldData() {
    if (!confirm('确定要删除一年前的想法吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      const count = await this.dataManager.clearOldData(365);
      alert(`已清理 ${count} 个旧想法`);
    } catch (error) {
      console.error('清理失败:', error);
      alert('清理失败');
    }
  }
  
  showHelp() {
    alert('使用帮助：
1. 点击右下角的"+"按钮创建新想法
2. 使用Markdown语法编写内容
3. 添加标签和分类组织想法
4. 使用搜索功能查找想法
5. 在统计页面查看热力图
6. 在设置页面管理数据');
  }
  
  showFeedback() {
    alert('反馈功能正在开发中，敬请期待！');
  }
}
```

- [ ] **步骤5：运行单元测试**

```bash
npm test tests/unit/settings.test.js
# 预期：所有测试通过
```

- [ ] **步骤6：提交设置界面代码**

```bash
git add .
git commit -m "feat: 实现设置界面功能"
```

## 实施总结

### 关键里程碑
1. **M1：基础架构完成** - 项目初始化、数据库层、主界面
2. **M2：核心功能完成** - Markdown编辑器、标签管理、图片压缩
3. **M3：高级功能完成** - 热力图可视化、周报生成、数据导入导出
4. **M4：优化部署** - 性能优化、离线功能、部署准备

### 测试策略
- **单元测试**：每个模块独立测试
- **集成测试**：模块间协作测试
- **E2E测试**：完整用户流程测试
- **性能测试**：加载时间、内存占用测试
- **离线测试**：Service Worker功能测试

### 部署检查清单
- [ ] 所有测试通过
- [ ] 性能指标达标
- [ ] PWA配置正确
- [ ] 离线功能正常
- [ ] 响应式设计验证
- [ ] 跨浏览器兼容
- [ ] 数据备份功能
- [ ] 错误处理完善

---

**计划版本**：v1.0
**创建日期**：2026-03-24
**预计工期**：6周
**负责人**：开发团队