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
    
    // 初始化存储
    const database = new IdeaDatabase();
    await database.init();
    
    // 如果数据库为空，添加示例数据
    const ideas = await database.getAllIdeas();
    if (ideas.length === 0) {
        await database.addIdea({
            title: '示例想法1',
            content: '这是第一个示例想法的内容。记录生活中的点滴灵感。',
            tags: ['灵感', '生活'],
            created: new Date(),
            category: 'life'
        });
        await database.addIdea({
            title: '学习新技能',
            content: '计划学习JavaScript框架，提升前端开发能力。',
            tags: ['学习', '工作'],
            created: new Date(Date.now() - 86400000), // 昨天
            category: 'study'
        });
        await database.addIdea({
            title: '旅行计划',
            content: '今年夏天计划去海边旅行，放松身心。',
            tags: ['旅行', '生活'],
            created: new Date(Date.now() - 172800000), // 前天
            category: 'travel'
        });
    }
    
    // 初始化想法列表
    const ideaList = new IdeaList('ideas-container');
    await ideaList.loadIdeas(database);
}





// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);