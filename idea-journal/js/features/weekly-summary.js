const STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '他', '她', '它', '们', '那', '些', '么', '什么', '怎么', '如何',
  '可以', '能够', '这个', '那个', '但是', '因为', '所以', '如果', '虽然', '而且',
  '或者', '以及', '还是', '已经', '正在', '将要', '应该', '需要', '可能', '只是',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both',
  'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than',
  'too', 'very', 'just', 'because', 'if', 'when', 'where', 'how',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his',
  'she', 'her', 'it', 'its', 'they', 'them', 'their'
]);

function toLocalDateStr(d) {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class WeeklySummary {
  generateWeeklyReport(ideas, weekStart, weekEnd) {
    if (!ideas || ideas.length === 0) {
      return {
        weekStart: toLocalDateStr(weekStart),
        weekEnd: toLocalDateStr(weekEnd),
        totalIdeas: 0,
        totalWords: 0,
        tags: [],
        keywords: [],
        dailyDistribution: {},
        summary: '',
        insights: []
      };
    }

    const filtered = ideas.filter(idea => {
      const d = idea.created instanceof Date ? idea.created : new Date(idea.created);
      return d >= new Date(weekStart) && d <= new Date(weekEnd);
    });

    const totalWords = filtered.reduce((sum, idea) => {
      return sum + (idea.content ? idea.content.length : 0);
    }, 0);

    const keywords = this.extractKeywords(
      filtered.map(i => i.content || '').join(' ')
    );

    const report = {
      weekStart: toLocalDateStr(weekStart),
      weekEnd: toLocalDateStr(weekEnd),
      totalIdeas: filtered.length,
      totalWords,
      tags: this.getTopTags(filtered),
      keywords,
      dailyDistribution: this.getDailyDistribution(filtered, weekStart, weekEnd),
      summary: this.generateSummaryText(filtered),
      insights: []
    };

    report.insights = this.getInsights(report);
    return report;
  }

  getTopTags(ideas, limit = 5) {
    if (!ideas || ideas.length === 0) return [];

    const tagCount = {};
    ideas.forEach(idea => {
      const tags = idea.tags || [];
      tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  extractKeywords(content) {
    if (!content || typeof content !== 'string') return [];

    const segments = content.split(/[\s,，。！？；：、""''（）()[\]{}<>《》·\-\n\r\t]+/);
    const wordCount = {};

    segments.forEach(word => {
      const w = word.trim().toLowerCase();
      if (w.length >= 2 && !STOP_WORDS.has(w)) {
        wordCount[w] = (wordCount[w] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }

  generateSummaryText(ideas) {
    if (!ideas || ideas.length === 0) return '';

    const count = ideas.length;
    const tags = this.getTopTags(ideas, 3);
    const tagNames = tags.map(t => t.name).join('、');

    let summary = `本周共记录 ${count} 条想法`;

    if (tagNames) {
      summary += `，主要关注 ${tagNames}`;
    }

    const titles = ideas
      .filter(i => i.title)
      .slice(0, 3)
      .map(i => i.title);

    if (titles.length > 0) {
      summary += `。包括：${titles.join('、')}`;
    }

    return summary + '。';
  }

  getDailyDistribution(ideas, weekStart, weekEnd) {
    const distribution = {};
    const start = new Date(weekStart);
    const end = new Date(weekEnd);

    let current = new Date(start);
    while (current <= end) {
      distribution[toLocalDateStr(current)] = 0;
      current.setDate(current.getDate() + 1);
    }

    if (ideas && ideas.length > 0) {
      ideas.forEach(idea => {
        const d = idea.created instanceof Date ? idea.created : new Date(idea.created);
        const key = toLocalDateStr(d);
        if (key in distribution) {
          distribution[key]++;
        }
      });
    }

    return distribution;
  }

  getInsights(report) {
    const insights = [];

    if (report.totalIdeas === 0) {
      insights.push('本周暂无记录，试着每天记录一个想法吧');
      return insights;
    }

    if (report.totalIdeas >= 7) {
      insights.push('坚持每天记录想法，保持了良好的记录习惯');
    } else if (report.totalIdeas >= 4) {
      insights.push('本周记录了不少想法，继续保持');
    } else {
      insights.push('本周记录较少，可以尝试更频繁地记录灵感');
    }

    if (report.totalWords > 1000) {
      insights.push('记录内容丰富，思考深入');
    }

    if (report.tags.length > 0) {
      const topTag = report.tags[0];
      insights.push(`本周最关注的主题是「${topTag.name}」（${topTag.count}次）`);
    }

    const days = Object.values(report.dailyDistribution);
    const activeDays = days.filter(c => c > 0).length;
    if (activeDays === 7) {
      insights.push('每天都记录了想法，非常棒');
    } else if (activeDays >= 5) {
      insights.push(`本周有${activeDays}天记录了想法`);
    }

    const maxDay = Object.entries(report.dailyDistribution).sort(
      (a, b) => b[1] - a[1]
    )[0];
    if (maxDay && maxDay[1] > 1) {
      insights.push(`${maxDay[0]} 是最活跃的一天，记录了${maxDay[1]}条想法`);
    }

    if (report.keywords.length > 0) {
      const topKeywords = report.keywords.slice(0, 3).map(k => k.word).join('、');
      insights.push(`高频关键词：${topKeywords}`);
    }

    return insights;
  }
}
