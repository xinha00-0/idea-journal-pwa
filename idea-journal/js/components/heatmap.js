export class HeatmapChart {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.options = {
      colorScheme: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
      ...options
    };
    
    if (typeof Chart !== 'undefined') {
      this.init();
    }
  }
  
  init() {
    const ctx = this.canvas.getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: '想法数量',
          data: [],
          backgroundColor: this.options.colorScheme[1],
          borderRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => `${item.raw} 个想法`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
  
  updateData(data) {
    this.chart.data.labels = data.labels;
    this.chart.data.datasets[0].data = data.values;
    this.chart.update();
  }
  
  generateWeeklyData(ideas) {
    const weeklyData = {};
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    ideas.forEach(idea => {
      const ideaDate = new Date(idea.created);
      
      // 只包含最近7天的数据
      if (ideaDate >= sevenDaysAgo) {
        const date = idea.created.toISOString().split('T')[0];
        weeklyData[date] = (weeklyData[date] || 0) + 1;
      }
    });
    
    // 按日期升序排序
    const sortedData = {};
    Object.keys(weeklyData)
      .sort((a, b) => new Date(a) - new Date(b))
      .forEach(date => {
        sortedData[date] = weeklyData[date];
      });
    
    return sortedData;
  }
  
  generateMonthData(ideas) {
    const monthData = {};
    
    ideas.forEach(idea => {
      const month = idea.created.toISOString().slice(0, 7);
      monthData[month] = (monthData[month] || 0) + 1;
    });
    
    return monthData;
  }
  
  getColorForValue(value, maxValue) {
    const ratio = value / maxValue;
    const index = Math.min(Math.floor(ratio * this.options.colorScheme.length), this.options.colorScheme.length - 1);
    return this.options.colorScheme[index];
  }
  
  updateColors(values) {
    const maxValue = Math.max(...values, 1);
    const colors = values.map(value => this.getColorForValue(value, maxValue));
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.update();
  }
}
