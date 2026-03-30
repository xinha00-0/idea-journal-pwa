export class TagManager {
  constructor(database) {
    this.db = database;
  }

  async createTag(tagData) {
    const tag = {
      ...tagData,
      count: 0,
      created: new Date()
    };

    const id = await this.db.addTag(tag);
    return { id, ...tag };
  }

  async getTagById(id) {
    return await this.db.getTag(id);
  }

  async getAllTags() {
    return await this.db.getAllTags();
  }

  async updateTag(id, updates) {
    const tag = await this.getTagById(id);
    const updatedTag = { ...tag, ...updates };
    await this.db.updateTag(updatedTag);
    return updatedTag;
  }

  async deleteTag(id) {
    await this.db.deleteTag(id);
  }

  async addTagsToIdea(ideaId, tagIds) {
    const idea = await this.db.getIdea(ideaId);
    const uniqueTagIds = [...new Set([...idea.tags, ...tagIds])];
    idea.tags = uniqueTagIds;
    await this.db.updateIdea(idea);

    await this.incrementTagCounts(tagIds);
  }

  async incrementTagCount(tagId) {
    const tag = await this.getTagById(tagId);
    if (tag) {
      tag.count = (tag.count || 0) + 1;
      await this.db.updateTag(tag);
    }
  }

  async incrementTagCounts(tagIds) {
    for (const tagId of tagIds) {
      await this.incrementTagCount(tagId);
    }
  }

  async getPopularTags(limit = 10) {
    const tags = await this.getAllTags();
    return tags
      .sort((a, b) => (b.count || 0) - (a.count || 0) || (a.name || '').localeCompare(b.name || ''))
      .slice(0, limit);
  }

  async loadPopularTags(limit = 10) {
    const tags = await this.getPopularTags(limit);
    this.updateTagChips(tags);
    return tags;
  }

  updateTagChips(tags) {
    const tagFilter = document.querySelector('.tag-scroll');
    if (!tagFilter) return;

    const allChip = tagFilter.querySelector('.tag-chip[data-tag="all"]');
    tagFilter.innerHTML = '';

    if (allChip) {
      tagFilter.appendChild(allChip);
    }

    tags.forEach(tag => {
      const chip = document.createElement('button');
      chip.className = 'tag-chip';
      chip.dataset.tag = tag.name || tag.id;
      chip.textContent = tag.name || tag.id;
      tagFilter.appendChild(chip);
    });
  }
}
