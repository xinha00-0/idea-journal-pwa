export class WeeklySummary {
  constructor(options = {}) {
    this.keywords = {
      '工作': ['项目', '任务', '会议', '客户', '产品', '功能', '优化', '改进', '架构'],
      '生活': ['家庭', '朋友', '旅行', '健康', '运动', '饮食', '娱乐'],
      '学习': ['读书', '课程', '技能', '知识', '研究', '实践', '思考'],
      '灵感': ['创意', '想法', '创新', '设计', '艺术']
    };
  }
  
  async generateWeeklyReport(ideas, weekStart, weekEnd) {
    const weekIdeas = ideas.filter(idea => {
      const created = new Date(idea.created);
      return created >= weekStart && created < weekEnd;
    });
    
    const topTags = this.getTopTags(weekIdeas);
    const summary = this.generateSummaryText(weekIdeas);
    const keywords = this.extractAllKeywords(weekIdeas);
    const dailyDistribution = this.getDailyDistribution(weekIdeas);
    
    const report = {
      weekStart: weekStart,
      weekEnd: weekEnd,
      totalIdeas: weekIdeas.length,
      topTags: topTags,
      summary: summary,
      keywords: keywords,
      dailyDistribution: dailyDistribution,
      insights: this.getInsights({
        totalIdeas: weekIdeas.length,
        topTags: topTags
      })
    };
    
    return report;
  }
  
  getTopTags(ideas, limit = 5) {
    const tagCount = {};
    
    ideas.forEach(idea => {
      idea.tags?.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }
  
  extractKeywords(content) {
    const keywords = [];
    
    Object.values(this.keywords).flat().forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return [...new Set(keywords)];
  }
  
  extractAllKeywords(ideas) {
    const allKeywords = new Set();
    
    ideas.forEach(idea => {
      const content = `${idea.title} ${idea.content}`;
      const keywords = this.extractKeywords(content);
      keywords.forEach(keyword => allKeywords.add(keyword));
    });
    
    return Array.from(allKeywords);
  }
  
  generateSummaryText(ideas) {
    if (ideas.length === 0) {
      return '本周没有记录想法。';
    }
    
    let summary = '';
    
    ideas.forEach((idea, index) => {
      if (idea.content) {
        summary += idea.content;
        if (index < ideas.length - 1) {
          summary += ' ';
        }
      }
    });
    
    const topTags = this.getTopTags(ideas, 3);
    const tagNames = topTags.map(({tag}) => tag).join('、');
    
    if (tagNames) {
      summary += ` 主要关注 ${tagNames}方面。`;
    }
    
    if (ideas.length >= 7) {
      summary += ' 记录习惯良好！继续保持。';
    }
    
    return summary;
  }
  
  getDailyDistribution(ideas) {
    const distribution = {};

    ideas.forEach(idea => {
      const d = new Date(idea.created);
      const date = d.toISOString().split('T')[0];
      distribution[date] = (distribution[date] || 0) + 1;
    });

    return distribution;
  }
  
  getInsights(report) {
    const insights = [];
    
    if (report.totalIdeas === 0) {
      insights.push('本周记录较少，考虑每天记录一个想法。');
    } else if (report.totalIdeas >= 7) {
      insights.push('记录习惯良好！继续保持。');
    }
    
    if (report.topTags.length > 3) {
      insights.push('思考领域较广泛，建议集中精力在关键领域。');
    }
    
    return insights;
  }
}
