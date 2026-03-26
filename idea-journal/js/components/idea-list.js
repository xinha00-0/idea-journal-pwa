import { IdeaCard } from './idea-card.js';

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
    return IdeaCard.create(idea);
  }
  

}