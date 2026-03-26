export class IdeaCard {
  constructor(idea, options = {}) {
    this.idea = idea;
    this.options = {
      maxLength: 100,
      showTags: true,
      showMenu: true,
      ...options
    };
    this.element = null;
    this.onEdit = null;
    this.onDelete = null;
  }

  render() {
    this.element = document.createElement('article');
    this.element.className = 'idea-card';
    this.element.dataset.id = this.idea.id;
    this.element.setAttribute('role', 'article');

    this.element.innerHTML = `
      <div class="card-header">
        <h2 class="card-title">${this.escapeHtml(this.idea.title || '无标题')}</h2>
        <time class="card-time">${this.formatTime(this.idea.created)}</time>
      </div>
      <div class="card-content">
        <p>${this.escapeHtml(this.truncateContent(this.idea.content))}</p>
      </div>
      <div class="card-footer">
        <div class="card-tags">
          ${this.renderTags()}
        </div>
        ${this.options.showMenu ? `
        <button class="card-menu" aria-label="更多选项" aria-haspopup="true">
          <span class="material-symbols-outlined">more_horiz</span>
        </button>
        ` : ''}
      </div>
    `;

    this.bindEvents();
    return this.element;
  }

  renderTags() {
    if (!this.idea.tags || this.idea.tags.length === 0) {
      return '';
    }

    return this.idea.tags
      .map(tag => `<span class="tag-chip">${this.escapeHtml(tag)}</span>`)
      .join('');
  }

  bindEvents() {
    if (this.options.showMenu) {
      const menuBtn = this.element.querySelector('.card-menu');
      if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showMenu(e);
        });
      }
    }

    this.element.addEventListener('click', () => {
      if (this.onEdit) {
        this.onEdit(this.idea);
      }
    });
  }

  showMenu(event) {
    const existingMenu = document.querySelector('.card-menu-dropdown');
    if (existingMenu) {
      existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.className = 'card-menu-dropdown';
    menu.innerHTML = `
      <button class="menu-item edit" data-action="edit">
        <span class="material-symbols-outlined">edit</span>
        <span>编辑</span>
      </button>
      <button class="menu-item delete" data-action="delete">
        <span class="material-symbols-outlined">delete</span>
        <span>删除</span>
      </button>
    `;

    const rect = event.target.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;

    document.body.appendChild(menu);

    menu.querySelector('[data-action="edit"]').addEventListener('click', () => {
      menu.remove();
      if (this.onEdit) {
        this.onEdit(this.idea);
      }
    });

    menu.querySelector('[data-action="delete"]').addEventListener('click', () => {
      menu.remove();
      if (this.onDelete) {
        this.onDelete(this.idea);
      }
    });

    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
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

  truncateContent(content) {
    if (!content) return '';
    if (content.length <= this.options.maxLength) return content;
    return content.substring(0, this.options.maxLength) + '...';
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  update(newIdea) {
    this.idea = newIdea;
    if (this.element) {
      const oldElement = this.element;
      const newElement = this.render();
      oldElement.replaceWith(newElement);
    }
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
