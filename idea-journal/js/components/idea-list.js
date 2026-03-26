export class IdeaList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.ideas = [];
    this.filteredIdeas = [];
    this.currentTag = 'all';
  }

  async loadIdeas(database) {
    this.ideas = await database.getAllIdeas();
    this.filteredIdeas = [...this.ideas];
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    if (this.filteredIdeas.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.filteredIdeas.forEach(idea => {
      const card = this.createIdeaCard(idea);
      this.container.appendChild(card);
    });
  }

  renderEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <span class="material-symbols-outlined">lightbulb</span>
      <p>还没有记录任何想法</p>
      <p class="hint">在上方输入框开始记录你的第一个想法吧</p>
    `;
    this.container.appendChild(emptyState);
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
    p.textContent = this.truncateContent(idea.content, 100);
    contentDiv.appendChild(p);

    card.appendChild(contentDiv);

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'card-tags';

    if (idea.tags && idea.tags.length > 0) {
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

    footer.appendChild(menuBtn);
    card.appendChild(footer);

    return card;
  }

  formatTime(date) {
    if (!date) return '';

    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)} 天前`;
    } else {
      return d.toLocaleDateString('zh-CN');
    }
  }

  truncateContent(content, maxLength) {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  filterByTag(tag) {
    this.currentTag = tag;

    if (tag === 'all') {
      this.filteredIdeas = [...this.ideas];
    } else {
      this.filteredIdeas = this.ideas.filter(idea =>
        idea.tags && idea.tags.includes(tag)
      );
    }

    this.render();
  }

  addIdea(idea) {
    this.ideas.unshift(idea);
    this.filterByTag(this.currentTag);
  }

  removeIdea(id) {
    this.ideas = this.ideas.filter(idea => idea.id !== id);
    this.filterByTag(this.currentTag);
  }

  updateIdea(updatedIdea) {
    const index = this.ideas.findIndex(idea => idea.id === updatedIdea.id);
    if (index !== -1) {
      this.ideas[index] = updatedIdea;
      this.filterByTag(this.currentTag);
    }
  }
}
