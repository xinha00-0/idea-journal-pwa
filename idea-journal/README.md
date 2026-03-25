# 想法记录 PWA

一个基于PWA的想法记录工具，支持Markdown编辑、图片压缩、标签分类、按周回顾和热力图可视化。

## 功能特性

- ✨ Markdown编辑器
- 📸 图片压缩
- 🏷️ 标签管理
- 📊 热力图可视化
- 📝 周报生成
- 📥 数据导入导出
- 🌙 深色模式
- 📱 响应式设计
- 📴 离线支持

## 技术栈

- HTML5, CSS3, JavaScript
- IndexedDB
- Chart.js
- EasyMDE
- Capacitor (Android)

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test
```

## 部署

本项目部署在 Vercel: [访问在线版本](https://idea-journal-pwa.vercel.app)

## 构建 APK

使用 Capacitor 构建 Android APK：

```bash
# 同步代码到 Android 项目
npx cap sync android

# 在 Android Studio 中打开
npx cap open android
```

## 许可证

ISC
