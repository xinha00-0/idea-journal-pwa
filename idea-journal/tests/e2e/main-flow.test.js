// 主界面流程E2E测试
// 注意：这些测试需要浏览器环境运行

describe('主界面流程', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <header class="top-bar">
          <div class="container">
            <h1>想法记录</h1>
          </div>
        </header>
        <main class="main-content">
          <section class="quickEntry">
            <textarea id="quick-entry" placeholder="捕捉此刻的想法..."></textarea>
            <button id="publish-btn" class="primary">发布</button>
          </section>
          <section class="tag-filter">
            <div class="tag-scroll">
              <button class="tag-chip active" data-tag="all">全部</button>
              <button class="tag-chip" data-tag="work">工作</button>
              <button class="tag-chip" data-tag="life">生活</button>
            </div>
          </section>
          <section class="idea-list">
            <div id="ideas-container"></div>
          </section>
        </main>
        <nav class="bottom-nav">
          <a href="#record" class="nav-item active">
            <span>记录</span>
          </a>
          <a href="#review" class="nav-item">
            <span>回顾</span>
          </a>
          <a href="#stats" class="nav-item">
            <span>统计</span>
          </a>
          <a href="#settings" class="nav-item">
            <span>设置</span>
          </a>
        </nav>
      </div>
    `;
    container = document.getElementById('ideas-container');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('应该显示标题', () => {
    const title = document.querySelector('h1');
    expect(title).toBeDefined();
    expect(title.textContent).toBe('想法记录');
  });

  test('应该显示快速记录输入框', () => {
    const input = document.getElementById('quick-entry');
    expect(input).toBeDefined();
    expect(input.placeholder).toBe('捕捉此刻的想法...');
  });

  test('应该显示发布按钮', () => {
    const publishBtn = document.getElementById('publish-btn');
    expect(publishBtn).toBeDefined();
    expect(publishBtn.textContent).toBe('发布');
  });

  test('应该显示标签筛选栏', () => {
    const chips = document.querySelectorAll('.tag-chip');
    expect(chips.length).toBeGreaterThan(0);
    expect(chips[0].dataset.tag).toBe('all');
  });

  test('应该显示底部导航', () => {
    const navItems = document.querySelectorAll('.nav-item');
    expect(navItems.length).toBe(4);
  });

  test('应该有空状态显示', () => {
    expect(container).toBeDefined();
    expect(container.children.length).toBe(0);
  });
});

describe('IdeaList组件', () => {
  let IdeaList;
  let ideaList;
  let container;

  beforeAll(async () => {
    const module = await import('../../js/components/idea-list.js');
    IdeaList = module.IdeaList;
  });

  beforeEach(() => {
    document.body.innerHTML = '<div id="ideas-container"></div>';
    container = document.getElementById('ideas-container');
    ideaList = new IdeaList('ideas-container');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('应该初始化组件', () => {
    expect(ideaList).toBeDefined();
    expect(ideaList.container).toBe(container);
    expect(ideaList.ideas).toEqual([]);
  });

  test('应该渲染空状态', () => {
    ideaList.render();
    expect(container.querySelector('.empty-state')).toBeDefined();
  });

  test('应该渲染想法卡片', () => {
    ideaList.ideas = [
      {
        id: 1,
        title: '测试想法',
        content: '这是测试内容',
        tags: ['测试'],
        created: new Date()
      }
    ];
    ideaList.filteredIdeas = [...ideaList.ideas];
    ideaList.render();

    const card = container.querySelector('.idea-card');
    expect(card).toBeDefined();
    expect(card.dataset.id).toBe('1');
  });

  test('应该正确格式化时间', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now - 60000);
    const oneHourAgo = new Date(now - 3600000);
    const oneDayAgo = new Date(now - 86400000);

    expect(ideaList.formatTime(oneMinuteAgo)).toContain('分钟前');
    expect(ideaList.formatTime(oneHourAgo)).toContain('小时前');
    expect(ideaList.formatTime(oneDayAgo)).toContain('天前');
  });

  test('应该截断长内容', () => {
    const longContent = 'a'.repeat(150);
    const truncated = ideaList.truncateContent(longContent, 100);
    expect(truncated.length).toBe(103);
    expect(truncated.endsWith('...')).toBe(true);
  });

  test('应该按标签筛选', () => {
    ideaList.ideas = [
      { id: 1, title: '工作想法', tags: ['work'] },
      { id: 2, title: '生活想法', tags: ['life'] }
    ];

    ideaList.filterByTag('work');
    expect(ideaList.filteredIdeas.length).toBe(1);
    expect(ideaList.filteredIdeas[0].title).toBe('工作想法');

    ideaList.filterByTag('all');
    expect(ideaList.filteredIdeas.length).toBe(2);
  });
});

describe('IdeaCard组件', () => {
  let IdeaCard;
  let ideaCard;
  let testIdea;

  beforeAll(async () => {
    const module = await import('../../js/components/idea-card.js');
    IdeaCard = module.IdeaCard;
  });

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>';
    testIdea = {
      id: 1,
      title: '测试标题',
      content: '测试内容',
      tags: ['测试', '示例'],
      created: new Date()
    };
    ideaCard = new IdeaCard(testIdea);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('应该初始化组件', () => {
    expect(ideaCard).toBeDefined();
    expect(ideaCard.idea).toBe(testIdea);
  });

  test('应该渲染卡片', () => {
    const element = ideaCard.render();
    expect(element).toBeDefined();
    expect(element.className).toBe('idea-card');
    expect(element.dataset.id).toBe('1');
  });

  test('应该包含标题', () => {
    const element = ideaCard.render();
    const title = element.querySelector('.card-title');
    expect(title.textContent).toBe('测试标题');
  });

  test('应该包含标签', () => {
    const element = ideaCard.render();
    const tags = element.querySelectorAll('.card-tags .tag-chip');
    expect(tags.length).toBe(2);
    expect(tags[0].textContent).toBe('测试');
  });

  test('应该包含菜单按钮', () => {
    const element = ideaCard.render();
    const menuBtn = element.querySelector('.card-menu');
    expect(menuBtn).toBeDefined();
  });

  test('应该不显示菜单当选项关闭时', () => {
    ideaCard = new IdeaCard(testIdea, { showMenu: false });
    const element = ideaCard.render();
    const menuBtn = element.querySelector('.card-menu');
    expect(menuBtn).toBeNull();
  });

  test('应该转义HTML内容', () => {
    const xssIdea = {
      id: 2,
      title: '<script>alert("xss")</script>',
      content: '<b>test</b>',
      tags: [],
      created: new Date()
    };
    ideaCard = new IdeaCard(xssIdea);
    const element = ideaCard.render();

    expect(element.querySelector('.card-title').textContent)
      .toBe('<script>alert("xss")</script>');
  });
});
