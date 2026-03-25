// app.js - 想法记录应用主入口
import { IdeaDatabase } from './storage/database.js';
import { IdeaList } from './components/idea-list.js';

// Service Worker 注册
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker 注册成功:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker 注册失败:', error);
            });
    });
}

// 应用初始化
async function initApp() {
    console.log('想法记录应用已加载');
    
    // 初始化数据库
    const database = new IdeaDatabase();
    await database.init();
    
    // 初始化想法列表
    const ideaList = new IdeaList('ideas-container');
    await ideaList.loadIdeas(database);
    
    // 初始化UI事件
    initializeUIEvents(database);
}

// 初始化UI事件
function initializeUIEvents(database) {
    // 发布按钮事件
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
            const quickEntry = document.getElementById('quick-entry');
            const content = quickEntry.value.trim();
            if (content) {
                const idea = {
                    title: content.substring(0, 20), // 简单标题
                    content: content,
                    tags: [],
                    created: new Date()
                };
                await database.addIdea(idea);
                quickEntry.value = '';
                // 重新加载列表
                const ideaList = new IdeaList('ideas-container');
                await ideaList.loadIdeas(database);
            }
        });
    }
    
    // 标签筛选事件
    const tagChips = document.querySelectorAll('.tag-chip');
    tagChips.forEach(chip => {
        chip.addEventListener('click', () => {
            tagChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            // 这里可以添加筛选逻辑
        });
    });
}

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);