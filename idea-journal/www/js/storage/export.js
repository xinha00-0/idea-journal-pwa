export class DataExporter {
  toJSON(ideas) {
    return JSON.stringify(ideas, null, 2);
  }
  
  toMarkdown(ideas) {
    let markdown = '# 想法导出\n\n';
    
    const sortedIdeas = [...ideas].sort((a, b) => new Date(a.created) - new Date(b.created));
    
    sortedIdeas.forEach((idea) => {
      markdown += `## ${idea.title}\n\n`;
      markdown += `**创建时间:** ${new Date(idea.created).toLocaleString()}\n\n`;
      
      if (idea.content) {
        markdown += idea.content + '\n\n';
      }
      
      if (idea.tags && idea.tags.length > 0) {
        markdown += `### 标签\n\n`;
        idea.tags.forEach(tag => {
          markdown += `- ${tag}\n`;
        });
        markdown += '\n';
      }
    });
    
    return markdown;
  }
  
  createDownloadLink(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    return url;
  }
}
