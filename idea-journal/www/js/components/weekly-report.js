import { WeeklySummary } from '../features/weekly-summary.js';

export class WeeklyReport {
  constructor(weekStart, weekEnd, report) {
    this.weekStart = new Date(weekStart);
    this.weekEnd = new Date(weekEnd);
    this.report = report;
  }
  
  render(containerId) {
    const container = document.getElementById(containerId);
    
    const header = document.createElement('div');
    header.className = 'report-header';
    header.innerHTML = `
      <h2 class="report-title">周报</h2>
      <div class="report-date">
        <span class="date-start">${this.formatDate(this.weekStart)}</span> -
        <span class="date-end">${this.formatDate(this.weekEnd)}</span>
      </div>
    `;
    
    container.appendChild(header);
    
    const summarySection = document.createElement('div');
    summarySection.className = 'report-section';
    summarySection.innerHTML = `
      <h3>摘要</h3>
      <p class="report-summary">${this.report.summary}</p>
    `;
    
    container.appendChild(summarySection);
    
    const tagsSection = document.createElement('div');
    tagsSection.className = 'report-section';
    const tagsHTML = this.report.topTags.map(({tag, count}) => 
      `<div class="tag-item">
        <span class="tag-dot" style="background-color: ${this.getTagColor(tag)}"></span>
        <span class="tag-name">${tag}</span>
        <span class="tag-count">${count} 个想法</span>
      </div>`
    ).join('');
    tagsSection.innerHTML = `
      <h3>热门标签</h3>
      <div class="top-tags">
        ${tagsHTML}
      </div>
    `;
    
    container.appendChild(tagsSection);
    
    const insightsSection = document.createElement('div');
    insightsSection.className = 'report-section';
    const insightsHTML = this.report.insights.map(insight => 
      `<li>${insight}</li>`
    ).join('');
    insightsSection.innerHTML = `
      <h3>洞察与建议</h3>
      <ul class="insights-list">
        ${insightsHTML}
      </ul>
    `;
    
    container.appendChild(insightsSection);
    
    const distributionSection = document.createElement('div');
    distributionSection.className = 'report-section';
    
    const dates = Object.keys(this.report.dailyDistribution).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    let distributionHTML = '';
    dates.forEach(date => {
      distributionHTML += `
        <div class="day-item">
          <div class="day-date">${this.formatDate(date)}</div>
          <div class="day-count">${this.report.dailyDistribution[date]} 个想法</div>
        </div>
      `;
    });
    distributionSection.innerHTML = `
      <h3>每日分布</h3>
      ${distributionHTML}
    `;
    
    container.appendChild(distributionSection);
    
    const exportSection = document.createElement('div');
    exportSection.className = 'report-section';
    exportSection.innerHTML = `
      <div class="export-actions">
        <button class="export-btn" data-format="json">导出JSON</button>
        <button class="export-btn" data-format="markdown">导出Markdown</button>
      </div>
    `;
    
    container.appendChild(exportSection);
    
    const actions = `
      <div class="report-actions">
        <button class="action-btn primary">返回</button>
        <button class="action-btn">分享</button>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', actions);
  }
  
  formatDate(date) {
    const d = new Date(date);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }
  
  getTagColor(tag) {
    const colors = ['#006e1c', '#0061a4', '#f59e0b', '#ea533c', '#e53500', '#795548', '#d81b60'];
    const index = Math.abs(tag.length) % colors.length;
    return colors[index];
  }
}
