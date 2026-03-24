// app.js - 想法记录应用主入口

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
function initApp() {
    console.log('想法记录应用已加载');
    
    // 初始化UI组件
    initializeUI();
    
    // 初始化存储
    initializeStorage();
}

// 初始化UI
function initializeUI() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <header>
                <h1>想法记录</h1>
            </header>
            <main>
                <p>应用已成功加载。</p>
            </main>
        `;
    }
}

// 初始化存储
function initializeStorage() {
    // 这里将初始化IndexedDB存储
    console.log('存储系统初始化...');
}

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);