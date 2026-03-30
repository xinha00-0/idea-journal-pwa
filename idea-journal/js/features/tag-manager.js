export class TagManager {
  constructor(database) {
    this.database = database;
  }

  async createTag(tagData) {
    const existingTags = await this.database.getAllTags();
    const duplicate = existingTags.find(t => t.name === tagData.name);
    if (duplicate) {
      throw new Error(`Tag "${tagData.name}" already exists`);
    }

    const tag = {
      name: tagData.name,
      color: tagData.color || '#6366f1',
      count: 0,
      created: new Date()
    };

    const id = await this.database.addTag(tag);
    return { ...tag, id };
  }

  async getAllTags() {
    return this.database.getAllTags();
  }

  async getTagById(id) {
    return this.database.getTag(id);
  }

  async updateTag(id, updates) {
    const tag = await this.database.getTag(id);
    if (!tag) {
      throw new Error(`Tag with id ${id} not found`);
    }

    if (updates.name && updates.name !== tag.name) {
      const existingTags = await this.database.getAllTags();
      const duplicate = existingTags.find(t => t.name === updates.name && t.id !== id);
      if (duplicate) {
        throw new Error(`Tag "${updates.name}" already exists`);
      }
    }

    const updatedTag = { ...tag, ...updates, id };
    await this.database.updateTag(updatedTag);
    return updatedTag;
  }

  async deleteTag(id) {
    const tag = await this.database.getTag(id);
    if (!tag) {
      throw new Error(`Tag with id ${id} not found`);
    }
    await this.database.deleteTag(id);
  }

  async incrementTagCount(tagId) {
    const tag = await this.database.getTag(tagId);
    if (!tag) return;

    tag.count = (tag.count || 0) + 1;
    await this.database.updateTag(tag);
  }

  async decrementTagCount(tagId) {
    const tag = await this.database.getTag(tagId);
    if (!tag) return;

    tag.count = Math.max(0, (tag.count || 0) - 1);
    await this.database.updateTag(tag);
  }

  async addTagsToIdea(ideaId, tagIds) {
    const idea = await this.database.getIdea(ideaId);
    if (!idea) {
      throw new Error(`Idea with id ${ideaId} not found`);
    }

    const currentTagIds = idea.tagIds || [];

    for (const tagId of tagIds) {
      const tag = await this.database.getTag(tagId);
      if (!tag) {
        throw new Error(`Tag with id ${tagId} not found`);
      }
    }

    const newTagIds = [...new Set([...currentTagIds, ...tagIds])];
    idea.tagIds = newTagIds;

    for (const tagId of tagIds) {
      if (!currentTagIds.includes(tagId)) {
        await this.incrementTagCount(tagId);
      }
    }

    await this.database.updateIdea(idea);
    return idea;
  }

  async removeTagFromIdea(ideaId, tagId) {
    const idea = await this.database.getIdea(ideaId);
    if (!idea) {
      throw new Error(`Idea with id ${ideaId} not found`);
    }

    const currentTagIds = idea.tagIds || [];
    if (!currentTagIds.includes(tagId)) {
      return idea;
    }

    idea.tagIds = currentTagIds.filter(id => id !== tagId);
    await this.decrementTagCount(tagId);
    await this.database.updateIdea(idea);
    return idea;
  }

  async getPopularTags(limit = 10) {
    const tags = await this.database.getAllTags();
    return tags
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, limit);
  }
}
