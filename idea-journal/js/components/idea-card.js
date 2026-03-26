export class IdeaCard {
  static create(idea) {
    const card = document.createElement('article');
    card.className = 'idea-card';
    card.dataset.id = idea.id;
    
    card.innerHTML = `
      <div class="card-header">
        <h2 class="card-title">${idea.title}</h2>
        <time class="card-time">${IdeaCard.formatTime(idea.created)}</time>
      </div>
      <div class="card-content">
        <p>${IdeaCard.truncateContent(idea.content, 100)}</p>
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
  
  static formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)} 天前`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  static truncateContent(content, maxLength) {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
}