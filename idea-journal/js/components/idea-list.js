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