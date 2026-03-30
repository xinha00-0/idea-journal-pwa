export class TagChip {
  constructor(tagData, onRemove) {
    this.tagData = tagData;
    this.onRemove = onRemove;
  }

  render() {
    const chip = document.createElement('div');
    chip.className = 'tag-chip';
    chip.dataset.id = this.tagData.id;

    const colorDot = document.createElement('div');
    colorDot.className = 'tag-dot';
    colorDot.style.backgroundColor = this.tagData.color;

    const text = document.createElement('span');
    text.className = 'tag-text';
    text.textContent = this.tagData.name;

    chip.appendChild(colorDot);
    chip.appendChild(text);

    if (this.onRemove) {
      const removeBtn = document.createElement('span');
      removeBtn.className = 'tag-remove';
      removeBtn.textContent = '×';
      removeBtn.onclick = () => this.onRemove(this.tagData.id);
      chip.appendChild(removeBtn);
    }

    return chip;
  }
}
