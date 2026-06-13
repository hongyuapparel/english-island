# English Training — Luna 🦉

成人英语学习：语音对话 + 图文课程共读。

## 两种学习方式

### 🎤 语音对话
- 点击麦克风说话（中文或英文）
- Luna 语音朗读回复（浏览器免费 TTS）
- **不会主动发消息** — 你说，她才答
- 聊天中自动记住你的信息

### 📚 课程共读
- 三套图文教材：日常英语、美剧口语、童话精读
- 配图 + 中英对照 + 词汇卡片
- 你翻页、你提问 — 点「问 Luna」她才回答
- 🔊 朗读本页 / 进度自动保存

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:5173（推荐 **Chrome / Edge** + 允许麦克风）

### AI 配置
```bash
ollama pull qwen2.5:7b
```
或在设置页填入 Gemini 免费 API Key。

## 技术说明

- 语音识别：浏览器 Web Speech API（免费）
- 语音朗读：浏览器 Speech Synthesis（免费）
- AI 思考：Ollama 本地 / Gemini API
