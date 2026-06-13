# English Island · 英语小岛 🦊

一个**长期陪伴你学英语的 AI 伙伴**，而不是背单词 / 刷题软件。

你每天回来，不是为了完成作业，而是想看看**狐狸 Fox** 今天会和你说什么。
学英语不是目标，**交流**才是目标，英语只是工具。

## 核心体验

### 🏝️ 今天（Home）
Fox 会**主动问候**你，并记得你上次说过的事——
"How is your clothing business going?"、"Did you exercise this week?"
没配置 AI 时也会用记忆生成温暖的问候。

### 📖 每日阅读
每天一篇 300–800 词的小故事（创业 / 外贸 / 育儿 / 健身 / 旅行 / 童话…）：
- 🔊 正常 / 🐢 慢速朗读，点**任意句子单独重复**，方便跟读
- 中英对照随时切换、重点词汇一键收藏
- 读完点「和 Fox 聊聊这篇」，把阅读变成真实对话

### 💬 对话
语音或打字，中文英文都行。Fox **不会频繁打断纠错**，优先自然交流。
聊完点「**结束并总结**」，Fox 温柔复盘：更自然的说法、常见错误、今日新词（自动收藏）。

### 👤 我的
Fox 眼中的你：自动识别的 CEFR 水平、它记住的关于你的事、单词本、历史小结。
**无需手动选初级 / 中级 / 高级**——系统从聊天中自动判断并调整难度。

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:5173（推荐 **Chrome / Edge** + 允许麦克风）。

### 配置 AI（二选一，均免费）
- **Ollama 本地**：安装后 `ollama pull qwen2.5:7b`
- **Google Gemini**：在 [AI Studio](https://aistudio.google.com/apikey) 申请免费 Key，填到「我的 → AI 设置」

## 技术说明
- 前端：Vite + TypeScript + Tailwind（Web App / PWA 优先，无原生 App）
- 语音识别 & 朗读：浏览器 Web Speech / Speech Synthesis（免费）
- AI：本地 Ollama 或 Gemini API（通过轻量 Express 代理）
- 记忆 / 画像 / 单词本：localStorage（MVP 阶段，无需后端账号）
