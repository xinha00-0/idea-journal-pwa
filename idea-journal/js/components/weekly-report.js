export class WeeklyReport {
  constructor() {
    this.element = null;
  }

  render(report) {
    this.element = document.createElement('div');
    this.element.className = 'weekly-report';
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-label', '周报');

    this.element.innerHTML = `
      <div class="report-header">
        <h2 class="report-title">周报总结</h2>
        <div class="report-date-range">
          <time>${report.weekStart}</time>
          <span> — </span>
          <time>${report.weekEnd}</time>
        </div>
      </div>
      <div class="report-stats">
        <div class="stat-item">
          <span class="stat-value">${report.totalIdeas}</span>
          <span class="stat-label">想法数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${report.totalWords}</span>
          <span class="stat-label">总字数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${report.tags.length}</span>
          <span class="stat-label">标签数</span>
        </div>
      </div>
      <div class="report-tags">
        <h3>热门标签</h3>
        <div class="tag-list">
          ${this.renderTagList(report.tags)}
        </div>
      </div>
      <div class="report-daily">
        <h3>每日分布</h3>
        ${this.renderDailyDistribution(report.dailyDistribution)}
      </div>
      <div class="report-keywords">
        <h3>关键词</h3>
        <div class="keyword-list">
          ${this.renderKeywords(report.keywords)}
        </div>
      </div>
      <div class="report-summary">
        <h3>摘要</h3>
        <p>${this.escapeHtml(report.summary)}</p>
      </div>
      <div class="report-insights">
        <h3>洞察建议</h3>
        <ul>
          ${this.renderInsights(report.insights)}
        </ul>
      </div>
      <div class="report-actions">
        <button class="btn-export" aria-label="导出周报">
          <span class="material-symbols-outlined">download</span>
          导出周报
        </button>
      </div>
    `;

    this.bindEvents(report);
    return this.element;
  }

  renderTagList(tags) {
    if (!tags || tags.length === 0) {
      return '<span class="empty-hint">暂无标签</span>';
    }
    return tags.map(tag =>
      `<span class="tag-chip">${this.escapeHtml(tag.name)} (${tag.count})</span>`
    ).join('');
  }

  renderDailyDistribution(distribution) {
    if (!distribution) return '';

    const entries = Object.entries(distribution);
    const maxCount = Math.max(...entries.map(([, c]) => c), 1);

    return `<div class="daily-bars">
      ${entries.map(([date, count]) => {
        const height = Math.max((count / maxCount) * 100, 4);
        const dayLabel = date.slice(5);
        return `<div class="daily-bar-item">
          <div class="bar" style="height: ${height}%" title="${date}: ${count}条"></div>
          <span class="bar-label">${dayLabel}</span>
        </div>`;
      }).join('')}
    </div>`;
  }

  renderKeywords(keywords) {
    if (!keywords || keywords.length === 0) {
      return '<span class="empty-hint">暂无关键词</span>';
    }
    return keywords.map(kw =>
      `<span class="keyword-chip">${this.escapeHtml(kw.word)} (${kw.count})</span>`
    ).join('');
  }

  renderInsights(insights) {
    if (!insights || insights.length === 0) {
      return '<li>暂无洞察</li>';
    }
    return insights.map(insight =>
      `<li>${this.escapeHtml(insight)}</li>`
    ).join('');
  }

  bindEvents(report) {
    const exportBtn = this.element.querySelector('.btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport(report));
    }
  }

  exportReport(report) {
    const lines = [
      `# 周报总结`,
      ``,
      `日期：${report.weekStart} — ${report.weekEnd}`,
      ``,
      `## 统计概览`,
      `- 想法数：${report.totalIdeas}`,
      `- 总字数：${report.totalWords}`,
      `- 标签数：${report.tags.length}`,
      ``
    ];

    if (report.tags.length > 0) {
      lines.push('## 热门标签');
      report.tags.forEach(tag => {
        lines.push(`- ${tag.name} (${tag.count})`);
      });
      lines.push('');
    }

    if (report.keywords.length > 0) {
      lines.push('## 关键词');
      report.keywords.forEach(kw => {
        lines.push(`- ${kw.word} (${kw.count})`);
      });
      lines.push('');
    }

    if (report.summary) {
      lines.push('## 摘要');
      lines.push(report.summary);
      lines.push('');
    }

    if (report.insights.length > 0) {
      lines.push('## 洞察建议');
      report.insights.forEach(insight => {
        lines.push(`- ${insight}`);
      });
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `周报_${report.weekStart}_${report.weekEnd}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
