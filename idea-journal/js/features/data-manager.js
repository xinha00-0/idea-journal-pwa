export class DataManager {
  constructor(database) {
    this.db = database;
  }

  async getStorageInfo() {
    const ideas = await this.db.getAllIdeas();
    const tags = await this.db.getAllTags();
    const categories = await this.db.getAllCategories();

    const totalSize = JSON.stringify(ideas).length + JSON.stringify(tags).length + JSON.stringify(categories).length;

    const formattedSize = this.formatBytes(totalSize);

    return {
      ideasCount: ideas.length,
      tagsCount: tags.length,
      categoriesCount: categories.length,
      totalSize,
      formattedSize
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  async clearOldData(daysOld = 365) {
    const ideas = await this.db.getAllIdeas();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldIdeas = ideas.filter(idea => new Date(idea.created) < cutoffDate);

    for (const idea of oldIdeas) {
      await this.db.deleteIdea(idea.id);
    }

    return oldIdeas.length;
  }

  async backupData() {
    const ideas = await this.db.getAllIdeas();
    const tags = await this.db.getAllTags();
    const categories = await this.db.getAllCategories();

    return {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        ideas,
        tags,
        categories
      }
    };
  }

  async restoreData(backupJson) {
    try {
      const backup = JSON.parse(backupJson);

      if (backup.version !== 1) {
        throw new Error('不支持的备份版本');
      }

      const { ideas, tags, categories } = backup.data;

      for (const idea of ideas) {
        await this.db.addIdea(idea);
      }

      for (const tag of tags) {
        await this.db.addTag(tag);
      }

      for (const category of categories) {
        await this.db.addCategory(category);
      }

      return true;
    } catch (error) {
      throw new Error(`恢复失败: ${error.message}`);
    }
  }

  async getAllIdeas() {
    return await this.db.getAllIdeas();
  }
}
