export class TagChip {
  constructor(tag, options = {}) {
    this.tag = tag;
    this.options = {
      removable: false,
      clickable: true,
      ...options
    };
    this.element = null;
    this.onRemove = null;
    this.onClick = null;
  }

  render() {
    this.element = document.createElement('span');
    this.element.className = 'tag-chip';
    this.element.dataset.tagId = this.tag.id;
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('tabindex', '0');

    const color = this.tag.color || '#6366f1';
    this.element.style.setProperty('--tag-color', color);
    this.element.style.backgroundColor = color + '20';
    this.element.style.color = color;
    this.element.style.borderColor = color + '40';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'tag-name';
    nameSpan.textContent = this.tag.name;
    this.element.appendChild(nameSpan);

    if (this.tag.count > 0) {
      const countSpan = document.createElement('span');
      countSpan.className = 'tag-count';
      countSpan.textContent = this.tag.count;
      this.element.appendChild(countSpan);
    }

    if (this.options.removable) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'tag-remove';
      removeBtn.setAttribute('aria-label', `Remove tag ${this.tag.name}`);
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.onRemove) {
          this.onRemove(this.tag);
        }
      });
      this.element.appendChild(removeBtn);
    }

    if (this.options.clickable) {
      this.element.addEventListener('click', () => {
        if (this.onClick) {
          this.onClick(this.tag);
        }
      });
    }

    return this.element;
  }

  update(tag) {
    this.tag = tag;
    if (this.element) {
      const oldElement = this.element;
      const newElement = this.render();
      oldElement.replaceWith(newElement);
    }
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  static renderList(tags, container, options = {}) {
    container.innerHTML = '';
    const chips = [];
    for (const tag of tags) {
      const chip = new TagChip(tag, options);
      container.appendChild(chip.render());
      chips.push(chip);
    }
    return chips;
  }
}
