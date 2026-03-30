export class DataImporter {
  importJSON(fileContent) {
    let parsed;
    if (typeof fileContent === 'string') {
      parsed = JSON.parse(fileContent);
    } else {
      parsed = fileContent;
    }

    if (parsed.ideas && Array.isArray(parsed.ideas)) {
      return parsed.ideas.map(idea => this.normalizeIdea(idea));
    }

    if (Array.isArray(parsed)) {
      return parsed.map(idea => this.normalizeIdea(idea));
    }

    throw new Error('Invalid JSON format: expected array of ideas or object with ideas property');
  }

  importMarkdown(content) {
    return this.parseMarkdown(content);
  }

  parseMarkdown(content) {
    const ideas = [];
    const sections = content.split(/^---$/m).filter(s => s.trim());

    for (const section of sections) {
      const lines = section.trim().split('\n');
      const idea = {
        title: '',
        content: '',
        tags: [],
        created: new Date()
      };

      if (lines[0] && lines[0].startsWith('# ')) {
        continue;
      }

      const titleMatch = section.match(/^## (.+)$/m);
      if (titleMatch) {
        idea.title = titleMatch[1].trim();
      }

      const timeMatch = section.match(/^> 创建时间: (.+)$/m);
      if (timeMatch) {
        const parsed = new Date(timeMatch[1].trim());
        idea.created = isNaN(parsed.getTime()) ? new Date() : parsed;
      }

      const categoryMatch = section.match(/^\*\*分类:\*\* (.+)$/m);
      if (categoryMatch) {
        idea.category = categoryMatch[1].trim();
      }

      const tagsMatch = section.match(/^\*\*标签:\*\* (.+)$/m);
      if (tagsMatch) {
        idea.tags = tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean);
      }

      const contentLines = [];
      let inContent = false;
      for (const line of lines) {
        if (line.startsWith('## ') || line.startsWith('> ') || line.startsWith('**分类:**') || line.startsWith('**标签:**')) {
          continue;
        }
        if (line.trim() === '') {
          if (inContent) contentLines.push('');
          continue;
        }
        inContent = true;
        contentLines.push(line);
      }

      idea.content = contentLines.join('\n').trim();

      if (idea.title || idea.content) {
        ideas.push(idea);
      }
    }

    return ideas;
  }

  async importFile(file) {
    const text = await this.readFileAsText(file);
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'json') {
      return this.importJSON(text);
    }

    if (extension === 'md' || extension === 'markdown') {
      return this.importMarkdown(text);
    }

    throw new Error(`Unsupported file format: .${extension}`);
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  normalizeIdea(idea) {
    return {
      title: idea.title || '',
      content: idea.content || '',
      tags: Array.isArray(idea.tags) ? [...idea.tags] : [],
      category: idea.category || '',
      created: idea.created ? new Date(idea.created) : new Date()
    };
  }
}
