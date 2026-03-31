export class IdeaList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.ideas = [];
    this.allIdeas = [];
  }

  async loadIdeas(database) {
    this.database = database;
    this.allIdeas = await database.getAllIdeas();
    this.allIdeas.sort((a, b) => new Date(b.created) - new Date(a.created));
    this.ideas = [...this.allIdeas];
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    this.ideas.forEach(idea => {
      const card = this.createIdeaCard(idea);
      this.container.appendChild(card);
    });

    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.style.display = this.ideas.length === 0 ? 'block' : 'none';
    }
  }

  createIdeaCard(idea) {
    const card = document.createElement('article');
    card.className = 'idea-card';
    card.dataset.id = idea.id;

    const header = document.createElement('div');
    header.className = 'card-header';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = idea.title || '无标题';
    header.appendChild(title);

    const time = document.createElement('time');
    time.className = 'card-time';
    time.textContent = this.formatTime(idea.created);
    header.appendChild(time);

    card.appendChild(header);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'card-content';

    const p = document.createElement('p');
    p.textContent = this.truncateContent(idea.content || '', 100);
    contentDiv.appendChild(p);

    card.appendChild(contentDiv);

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'card-tags';

    if (idea.tags && Array.isArray(idea.tags)) {
      idea.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag-chip';
        tagSpan.textContent = tag;
        tagsDiv.appendChild(tagSpan);
      });
    }

    footer.appendChild(tagsDiv);

    const menuBtn = document.createElement('button');
    menuBtn.className = 'card-menu';
    menuBtn.setAttribute('aria-label', '更多选项');

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'more_horiz';
    menuBtn.appendChild(icon);

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showCardMenu(idea.id, menuBtn);
    });

    footer.appendChild(menuBtn);
    card.appendChild(footer);

    return card;
  }

  showCardMenu(ideaId, btn) {
    document.querySelectorAll('.card-menu-dropdown').forEach(el => el.remove());

    const dropdown = document.createElement('div');
    dropdown.className = 'card-menu-dropdown';
    dropdown.style.cssText = 'position:absolute;right:0;top:100%;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:50;min-width:120px;overflow:hidden;';

    const actions = [
      { label: '删除', action: () => this.deleteIdea(ideaId) }
    ];

    actions.forEach(({ label, action }) => {
      const item = document.createElement('button');
      item.textContent = label;
      item.style.cssText = 'display:block;width:100%;padding:0.75rem 1rem;border:none;background:transparent;text-align:left;cursor:pointer;font-size:0.9rem;';
      item.addEventListener('click', () => {
        action();
        dropdown.remove();
      });
      dropdown.appendChild(item);
    });

    const parent = btn.closest('.card-footer');
    parent.style.position = 'relative';
    parent.appendChild(dropdown);

    setTimeout(() => {
      document.addEventListener('click', function handler() {
        dropdown.remove();
        document.removeEventListener('click', handler);
      });
    }, 0);
  }

  async deleteIdea(id) {
    if (!confirm('确定要删除这条想法吗？')) return;
    try {
      await this.database.deleteIdea(Number(id));
      await this.loadIdeas(this.database);
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败: ' + err.message);
    }
  }

  formatTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 0) return d.toLocaleDateString();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

  truncateContent(content, maxLength) {
    const text = content.replace(/[#*_`>\-\[\]()]/g, '').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  filterByTag(tag) {
    if (tag === 'all') {
      this.ideas = [...this.allIdeas];
    } else {
      this.ideas = this.allIdeas.filter(idea =>
        idea.tags && idea.tags.includes(tag)
      );
    }
    this.render();
  }
}
