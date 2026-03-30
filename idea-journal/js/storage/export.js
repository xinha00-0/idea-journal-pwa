export class DataExporter {
  toJSON(ideas) {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ideas: ideas
    };
    return JSON.stringify(exportData, null, 2);
  }

  toMarkdown(ideas) {
    const lines = [];
    lines.push('# 想法记录导出');
    lines.push('');
    lines.push(`导出时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push(`共 ${ideas.length} 条想法`);
    lines.push('');
    lines.push('---');
    lines.push('');

    for (const idea of ideas) {
      lines.push(`## ${idea.title || '无标题'}`);
      lines.push('');

      const created = idea.created instanceof Date
        ? idea.created.toLocaleString('zh-CN')
        : new Date(idea.created).toLocaleString('zh-CN');
      lines.push(`> 创建时间: ${created}`);
      lines.push('');

      if (idea.category) {
        lines.push(`**分类:** ${idea.category}`);
        lines.push('');
      }

      if (idea.tags && idea.tags.length > 0) {
        lines.push(`**标签:** ${idea.tags.join(', ')}`);
        lines.push('');
      }

      if (idea.content) {
        lines.push(idea.content);
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  createDownloadLink(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);

    link.addEventListener('click', () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        link.remove();
      }, 100);
    });

    return link;
  }

  exportAll(ideas, format = 'json') {
    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === 'markdown' || format === 'md') {
      const data = this.toMarkdown(ideas);
      const filename = `ideas-export-${timestamp}.md`;
      const link = this.createDownloadLink(data, filename, 'text/markdown;charset=utf-8');
      link.click();
      return { data, filename };
    }

    const data = this.toJSON(ideas);
    const filename = `ideas-export-${timestamp}.json`;
    const link = this.createDownloadLink(data, filename, 'application/json');
    link.click();
    return { data, filename };
  }
}
