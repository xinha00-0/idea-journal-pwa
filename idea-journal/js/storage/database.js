export class IdeaDatabase {
  constructor() {
    this.db = null;
    this.version = 1;
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('IdeaJournalDB', this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 想法表
        if (!db.objectStoreNames.contains('ideas')) {
          const ideaStore = db.createObjectStore('ideas', { keyPath: 'id', autoIncrement: true });
          ideaStore.createIndex('created', 'created', { unique: false });
          ideaStore.createIndex('category', 'category', { unique: false });
        }
        
        // 标签表
        if (!db.objectStoreNames.contains('tags')) {
          const tagStore = db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true });
          tagStore.createIndex('name', 'name', { unique: true });
        }
        
        // 分类表
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
          categoryStore.createIndex('name', 'name', { unique: true });
          categoryStore.createIndex('order', 'order', { unique: false });
        }
      };
    });
  }
  
  async addIdea(idea) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readwrite');
      const store = transaction.objectStore('ideas');
      const request = store.add(idea);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getIdea(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readonly');
      const store = transaction.objectStore('ideas');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getAllIdeas() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readonly');
      const store = transaction.objectStore('ideas');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async updateIdea(idea) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readwrite');
      const store = transaction.objectStore('ideas');
      const request = store.put(idea);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async deleteIdea(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readwrite');
      const store = transaction.objectStore('ideas');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async clear() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ideas'], 'readwrite');
      const store = transaction.objectStore('ideas');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  // 分类表CRUD操作
  async addCategory(category) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.add(category);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getCategory(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getAllCategories() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async updateCategory(category) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.put(category);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async deleteCategory(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async clearCategories() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}