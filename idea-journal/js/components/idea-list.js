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

    const header = document.createElement('div');
    header.className = 'card-header';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = idea.title;
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

    idea.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag-chip';
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });

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

  filterByTag(tag) {
    const allIdeas = [...this.ideas];
    if (tag === 'all') {
      this.ideas = allIdeas;
    } else {
      this.ideas = allIdeas.filter(idea =>
        idea.tags && idea.tags.includes(tag)
      );
    }
    this.render();
  }
}