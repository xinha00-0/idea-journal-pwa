export class HeatmapChart {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.options = {
      colorScheme: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
      ...options
    };
    this.chart = null;

    if (this.canvas && typeof Chart !== 'undefined') {
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
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => `${item.raw} 个想法`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              font: { size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { display: false }
          }
        }
      }
    });
  }

  updateData(data) {
    if (!this.chart) return;
    const labels = data.labels.map(d => {
      const date = new Date(d);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data.values;
    this.chart.update();
  }

  generateWeeklyData(ideas) {
    const weeklyData = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      weeklyData[key] = 0;
    }

    ideas.forEach(idea => {
      const ideaDate = new Date(idea.created);
      const key = ideaDate.toISOString().split('T')[0];
      if (key in weeklyData) {
        weeklyData[key]++;
      }
    });

    return weeklyData;
  }

  generateMonthData(ideas) {
    const monthData = {};

    ideas.forEach(idea => {
      const d = new Date(idea.created);
      const month = d.toISOString().slice(0, 7);
      monthData[month] = (monthData[month] || 0) + 1;
    });

    return monthData;
  }

  getColorForValue(value, maxValue) {
    if (value === 0) return this.options.colorScheme[0];
    const ratio = value / maxValue;
    const index = Math.min(Math.floor(ratio * (this.options.colorScheme.length - 1)) + 1, this.options.colorScheme.length - 1);
    return this.options.colorScheme[index];
  }

  updateColors(values) {
    if (!this.chart) return;
    const maxValue = Math.max(...values, 1);
    const colors = values.map(value => this.getColorForValue(value, maxValue));
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.update();
  }
}
