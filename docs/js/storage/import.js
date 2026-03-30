export class DataImporter {
  constructor(database) {
    this.db = database;
  }
  
  async importFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'json':
        return this.importJSON(file);
      case 'md':
      case 'markdown':
        return this.importMarkdown(file);
      default:
        throw new Error(`不支持的文件格式: ${extension}`);
    }
  }
  
  async importJSON(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!Array.isArray(data.ideas)) {
      throw new Error('JSON格式无效：ideas数组缺失');
    }
    
    const imported = [];
    
    for (const idea of data.ideas) {
      const id = await this.db.addIdea(idea);
      imported.push(id);
    }
    
    return imported.length;
  }
  
  async importMarkdown(file) {
    const text = await file.text();
    const ideas = this.parseMarkdown(text);
    
    for (const idea of ideas) {
      await this.db.addIdea(idea);
    }
    
    return ideas.length;
  }
  
  parseMarkdown(content) {
    const ideas = [];
    let currentIdea = null;
    let inTagsSection = false;
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        if (currentIdea && !inTagsSection) {
          currentIdea.content += '\n';
        }
        continue;
      }
      
      if (trimmedLine.startsWith('## ')) {
        if (currentIdea) {
          ideas.push(currentIdea);
        }
        
        currentIdea = {
          title: trimmedLine.substring(3).trim(),
          content: '',
          tags: [],
          created: new Date(),
          updated: new Date()
        };
        inTagsSection = false;
      } else if (trimmedLine.startsWith('### 标签')) {
        inTagsSection = true;
      } else if (inTagsSection && trimmedLine.startsWith('- ')) {
        const tag = trimmedLine.substring(2).trim();
        if (currentIdea) {
          currentIdea.tags.push(tag);
        }
      } else if (currentIdea && !inTagsSection) {
        if (currentIdea.content === '') {
          currentIdea.content = trimmedLine;
        } else {
          currentIdea.content += ' ' + trimmedLine;
        }
      }
    }
    
    if (currentIdea) {
      ideas.push(currentIdea);
    }
    
    return ideas;
  }
}
