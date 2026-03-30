function toLocalDateStr(d) {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class HeatmapChart {
  constructor(canvasId, options = {}) {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.data = { labels: [], values: [] };
    this.colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    this.cellSize = options.cellSize || 13;
    this.cellGap = options.cellGap || 3;
    this.cellRadius = options.cellRadius || 2;
    this.onCellClick = options.onCellClick || null;
    this.cells = [];

    if (this.canvas) {
      this.handleResize = () => this.render();
      window.addEventListener('resize', this.handleResize);
    }
  }

  updateData(data) {
    this.data = {
      labels: data.labels || [],
      values: data.values || []
    };
    this.render();
  }

  generateWeeklyData(ideas) {
    const countByDate = {};

    ideas.forEach(idea => {
      const d = idea.created instanceof Date ? idea.created : new Date(idea.created);
      const key = toLocalDateStr(d);
      countByDate[key] = (countByDate[key] || 0) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    const day = new Date(startDate);
    const labels = [];
    const values = [];

    while (day <= today) {
      const key = toLocalDateStr(day);
      labels.push(key);
      values.push(countByDate[key] || 0);
      day.setDate(day.getDate() + 1);
    }

    return { labels, values };
  }

  generateMonthData(ideas) {
    const countByMonth = {};

    ideas.forEach(idea => {
      const d = idea.created instanceof Date ? idea.created : new Date(idea.created);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      countByMonth[key] = (countByMonth[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(countByMonth).sort();
    return {
      labels: sortedKeys,
      values: sortedKeys.map(k => countByMonth[k])
    };
  }

  getColorForValue(value, maxValue) {
    if (value === 0) return this.colors[0];
    if (maxValue === 0) return this.colors[0];

    const ratio = value / maxValue;
    if (ratio <= 0.25) return this.colors[1];
    if (ratio <= 0.50) return this.colors[2];
    if (ratio <= 0.75) return this.colors[3];
    return this.colors[4];
  }

  updateColors(values) {
    const maxVal = Math.max(...values, 1);
    this.data.values = values;
    this.data.labels = this.data.labels.length >= values.length
      ? this.data.labels.slice(0, values.length)
      : this.data.labels;
    this.render();
  }

  render() {
    if (!this.ctx || !this.canvas) return;

    const { labels, values } = this.data;
    if (labels.length === 0) {
      this.clearCanvas();
      return;
    }

    const maxVal = Math.max(...values, 1);
    const weeks = Math.ceil(labels.length / 7);

    const leftPad = 36;
    const topPad = 24;
    const totalWidth = leftPad + weeks * (this.cellSize + this.cellGap);
    const totalHeight = topPad + 7 * (this.cellSize + this.cellGap);

    this.canvas.width = totalWidth;
    this.canvas.height = totalHeight;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    this.ctx.fillStyle = '#586069';
    this.ctx.font = '10px sans-serif';
    this.ctx.textBaseline = 'middle';

    [1, 3, 5].forEach(d => {
      this.ctx.fillText(dayNames[d], 2, topPad + d * (this.cellSize + this.cellGap) + this.cellSize / 2);
    });

    this.cells = [];

    labels.forEach((label, i) => {
      const week = Math.floor(i / 7);
      const dayOfWeek = i % 7;
      const value = values[i] || 0;
      const color = this.getColorForValue(value, maxVal);

      const x = leftPad + week * (this.cellSize + this.cellGap);
      const y = topPad + dayOfWeek * (this.cellSize + this.cellGap);

      this.cells.push({ x, y, label, value, week, dayOfWeek });

      this.ctx.fillStyle = color;
      this.roundRect(x, y, this.cellSize, this.cellSize, this.cellRadius);
      this.ctx.fill();
    });

    this.bindCanvasEvents();
  }

  roundRect(x, y, w, h, r) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, r);
    this.ctx.arcTo(x + w, y + h, x, y + h, r);
    this.ctx.arcTo(x, y + h, x, y, r);
    this.ctx.arcTo(x, y, x + w, y, r);
    this.ctx.closePath();
  }

  bindCanvasEvents() {
    if (this._clickHandler) {
      this.canvas.removeEventListener('click', this._clickHandler);
    }
    if (this._moveHandler) {
      this.canvas.removeEventListener('mousemove', this._moveHandler);
    }

    this._clickHandler = (e) => {
      if (!this.onCellClick) return;
      const cell = this.getCellAtEvent(e);
      if (cell && this.onCellClick) {
        this.onCellClick(cell);
      }
    };

    this._moveHandler = (e) => {
      const cell = this.getCellAtEvent(e);
      this.canvas.style.cursor = cell ? 'pointer' : 'default';
    };

    this.canvas.addEventListener('click', this._clickHandler);
    this.canvas.addEventListener('mousemove', this._moveHandler);
  }

  getCellAtEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    for (const cell of this.cells) {
      if (mx >= cell.x && mx <= cell.x + this.cellSize &&
          my >= cell.y && my <= cell.y + this.cellSize) {
        return cell;
      }
    }
    return null;
  }

  clearCanvas() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.cells = [];
    }
  }

  destroy() {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
    if (this._clickHandler) {
      this.canvas.removeEventListener('click', this._clickHandler);
    }
    if (this._moveHandler) {
      this.canvas.removeEventListener('mousemove', this._moveHandler);
    }
    this.clearCanvas();
    this.cells = [];
  }
}
