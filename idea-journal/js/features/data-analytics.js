function toLocalDateStr(d) {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class DataAnalytics {
  getStreak(ideas) {
    if (!ideas || ideas.length === 0) return 0;

    const dates = new Set();
    ideas.forEach(idea => {
      const d = idea.created instanceof Date ? idea.created : new Date(idea.created);
      dates.add(toLocalDateStr(d));
    });

    const sorted = [...dates].sort().reverse();
    const todayStr = toLocalDateStr(new Date());

    if (sorted[0] !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (sorted[0] !== toLocalDateStr(yesterday)) {
        return 0;
      }
    }

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + 'T00:00:00');
      const curr = new Date(sorted[i] + 'T00:00:00');
      const diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  getMostActiveDay(ideas) {
    if (!ideas || ideas.length === 0) return null;

    const countByDate = {};
    ideas.forEach(idea => {
      const d = idea.created instanceof Date ? idea.created : new Date(idea.created);
      const key = toLocalDateStr(d);
      countByDate[key] = (countByDate[key] || 0) + 1;
    });

    let maxDate = null;
    let maxCount = 0;
    for (const [date, count] of Object.entries(countByDate)) {
      if (count > maxCount) {
        maxCount = count;
        maxDate = date;
      }
    }

    return { date: maxDate, count: maxCount };
  }

  getAveragePerDay(ideas) {
    if (!ideas || ideas.length === 0) return 0;

    const dates = new Set();
    ideas.forEach(idea => {
      const d = idea.created instanceof Date ? idea.created : new Date(idea.created);
      dates.add(toLocalDateStr(d));
    });

    return Math.round((ideas.length / dates.size) * 100) / 100;
  }

  getTagDistribution(ideas) {
    if (!ideas || ideas.length === 0) return {};

    const distribution = {};
    ideas.forEach(idea => {
      const tags = idea.tags || [];
      tags.forEach(tag => {
        distribution[tag] = (distribution[tag] || 0) + 1;
      });
    });

    return distribution;
  }
}
