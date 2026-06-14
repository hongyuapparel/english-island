import type { ChatMessage, SessionSummary } from '../types'
import { FOX_ICON } from '../asset'
import { AGENT_NAME } from '../types'
import { storage } from '../storage'
import {
  sendChatMessage,
  extractMemoryFromChat,
  mergeMemoryIntoProfile,
  summarizeSession,
  buildArticleSystemPrompt,
} from '../ai/chat'
import { VoiceHelper, isSpeechSupported } from '../voice/speech'
import { articleById } from '../data/articles'
import type { Article } from '../data/articles'
import { goTo } from '../app'

const voice = new VoiceHelper()
let isLoading = false
let statusText = '点击麦克风开始说话'
let interimText = ''

/** When set, the chat is framed around discussing this article. */
let discussionArticle: Article | null = null
let pendingOpenerId: string | null = null

/** Called from the reading page to start chatting about an article. */
export function startArticleDiscussion(articleId: string) {
  const article = articleById(articleId)
  if (!article) return
  discussionArticle = article
  pendingOpenerId = articleId
  goTo('chat')
}

export function renderChat(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'page voice-page'

  // If we arrived here to discuss an article, post Fox's opener once.
  if (pendingOpenerId && discussionArticle) {
    const opener = `Let's talk about "${discussionArticle.title}"! ${discussionArticle.discussion[0]}`
    const messages = storage.getChatHistory()
    messages.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: opener,
      timestamp: Date.now(),
    })
    storage.saveChatHistory(messages)
    pendingOpenerId = null
  }

  function render() {
    const messages = storage.getChatHistory()
    const autoRead = storage.getVoiceAutoRead()
    const supported = isSpeechSupported()

    el.innerHTML = `
      <div class="voice-header">
        <img src="${FOX_ICON}" alt="${AGENT_NAME}" class="voice-mascot ${voice.isListening ? 'listening' : ''}" />
        <h1>和 ${AGENT_NAME} 对话</h1>
        <p class="voice-status" id="status">${esc(statusText)}</p>
        ${interimText ? `<p class="voice-interim">${esc(interimText)}</p>` : ''}
      </div>

      ${
        discussionArticle
          ? `<div class="discuss-banner">📖 正在聊：${esc(discussionArticle.titleZh)}
              <button class="banner-x" id="end-discuss" title="结束话题">✕</button></div>`
          : ''
      }

      ${
        !supported
          ? `<div class="card voice-warn">⚠️ 语音需 Chrome / Edge 并允许麦克风；你仍可打字交流</div>`
          : ''
      }

      <div class="voice-messages" id="voice-messages">
        ${
          messages.length === 0
            ? `<div class="voice-empty">
                <img src="${FOX_ICON}" alt="" class="empty-fox" />
                <p>嗨，我是 ${AGENT_NAME} 🦊</p>
                <p class="hint">说点什么吧 — 中文英文都行，我会陪你聊</p>
                <p class="hint">聊完点「结束并总结」，我帮你温柔复盘</p>
              </div>`
            : messages.map((m) => renderMsg(m)).join('')
        }
        ${
          isLoading
            ? `<div class="voice-loading"><img src="${FOX_ICON}" alt="" /> ${AGENT_NAME} 在想…</div>`
            : ''
        }
      </div>

      <div class="voice-controls">
        <label class="toggle-auto">
          <input type="checkbox" id="auto-read" ${autoRead ? 'checked' : ''} />
          🔊 自动朗读 ${AGENT_NAME} 的回复
        </label>
        <div class="voice-buttons">
          <button class="btn btn-ghost btn-sm" id="summarize" ${messages.length === 0 || isLoading ? 'disabled' : ''}>结束并总结</button>
          <button class="mic-btn ${voice.isListening ? 'active' : ''}" id="mic-btn" ${!supported || isLoading ? 'disabled' : ''} aria-label="说话">
            <span class="mic-icon">${voice.isListening ? '⏹' : '🎤'}</span>
          </button>
          <button class="btn btn-ghost btn-sm" id="clear-voice" ${messages.length === 0 ? 'disabled' : ''}>清空</button>
        </div>
        <p class="mic-hint">${voice.isListening ? '正在听… 说完自动发送' : '点击麦克风开始 / 再点停止'}</p>
      </div>

      <details class="text-fallback">
        <summary>⌨️ 打字输入</summary>
        <form id="text-form" class="text-form">
          <input type="text" id="text-input" placeholder="输入文字…" ${isLoading ? 'disabled' : ''} />
          <button type="submit" class="btn btn-primary btn-sm" ${isLoading ? 'disabled' : ''}>发送</button>
        </form>
      </details>
    `

    bindEvents()
    scrollMsgs()
  }

  function renderMsg(m: ChatMessage): string {
    return `
      <div class="voice-msg ${m.role}">
        ${m.role === 'assistant' ? `<img src="${FOX_ICON}" alt="" class="msg-av" />` : ''}
        <div class="msg-bubble">
          <p>${formatContent(m.content)}</p>
          ${m.role === 'assistant' ? `<button class="replay-btn" data-text="${escAttr(m.content)}" title="再听一遍">🔊</button>` : ''}
        </div>
      </div>
    `
  }

  function bindEvents() {
    el.querySelector('#mic-btn')?.addEventListener('click', toggleMic)
    el.querySelector('#summarize')?.addEventListener('click', runSummary)

    el.querySelector('#end-discuss')?.addEventListener('click', () => {
      discussionArticle = null
      render()
    })

    el.querySelector('#auto-read')?.addEventListener('change', (e) => {
      storage.setVoiceAutoRead((e.target as HTMLInputElement).checked)
    })

    el.querySelector('#clear-voice')?.addEventListener('click', () => {
      if (confirm('清空对话记录？')) {
        voice.stopListening()
        voice.stopSpeaking()
        storage.clearChatHistory()
        discussionArticle = null
        statusText = '点击麦克风开始说话'
        interimText = ''
        render()
      }
    })

    el.querySelectorAll('.replay-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        voice.speak((btn as HTMLElement).dataset.text ?? '')
      })
    })

    el.querySelector('#text-form')?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const input = el.querySelector('#text-input') as HTMLInputElement
      const text = input.value.trim()
      if (!text || isLoading) return
      input.value = ''
      await sendMessage(text)
    })
  }

  function toggleMic() {
    if (voice.isListening) {
      voice.stopListening()
      statusText = '点击麦克风开始说话'
      interimText = ''
      render()
      return
    }

    statusText = '正在听…'
    interimText = ''
    render()

    voice.startListening(
      (text, isFinal) => {
        interimText = isFinal ? '' : text
        if (isFinal && text.trim()) {
          voice.stopListening()
          statusText = '点击麦克风开始说话'
          sendMessage(text.trim())
        } else {
          render()
        }
      },
      (err) => {
        statusText = err
        interimText = ''
        render()
      },
      'zh-CN',
    )
    render()
  }

  async function sendMessage(text: string) {
    const messages = storage.getChatHistory()
    messages.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    })
    storage.saveChatHistory(messages)
    storage.recordActivity(1)
    isLoading = true
    interimText = ''
    statusText = `${AGENT_NAME} 在想…`
    render()

    try {
      const profile = storage.getProfile()
      const systemOverride = discussionArticle
        ? buildArticleSystemPrompt(profile, discussionArticle)
        : undefined
      const reply = await sendChatMessage(
        profile,
        storage.getStats(),
        storage.getErrorNotes(),
        storage.getAiSettings(),
        messages.slice(0, -1),
        text,
        true,
        systemOverride,
      )
      messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      })
      storage.saveChatHistory(messages)

      if (storage.getVoiceAutoRead()) voice.speak(reply)

      const userCount = messages.filter((m) => m.role === 'user').length
      if (userCount % 2 === 0) {
        extractMemoryFromChat(
          storage.getAiSettings(),
          messages,
          storage.getProfile(),
        ).then((ext) => {
          if (ext) storage.saveProfile(mergeMemoryIntoProfile(storage.getProfile(), ext))
        })
      }
    } catch (err) {
      messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: friendlyError(err),
        timestamp: Date.now(),
      })
      storage.saveChatHistory(messages)
    } finally {
      isLoading = false
      statusText = '点击麦克风开始说话'
      render()
    }
  }

  async function runSummary() {
    if (isLoading) return
    isLoading = true
    statusText = `${AGENT_NAME} 在为你复盘…`
    render()
    try {
      const summary = await summarizeSession(
        storage.getAiSettings(),
        storage.getChatHistory(),
      )
      if (summary) {
        storage.addSummary(summary)
        if (summary.newWords.length) storage.addSavedWords(summary.newWords)
        showSummaryModal(summary)
      } else {
        statusText = '这次还没什么可总结的，继续聊聊吧'
      }
    } catch (err) {
      statusText = `复盘失败：${err instanceof Error ? err.message : ''}`
    } finally {
      isLoading = false
      render()
    }
  }

  function showSummaryModal(s: SessionSummary) {
    const overlay = document.createElement('div')
    overlay.className = 'summary-overlay'
    overlay.innerHTML = `
      <div class="summary-card">
        <div class="summary-head"><img src="${FOX_ICON}" alt="" /><h2>今日小结</h2></div>
        ${s.encouragement ? `<p class="summary-cheer">🌟 ${esc(s.encouragement)}</p>` : ''}
        ${
          s.betterPhrasings.length
            ? `<div class="summary-section"><h3>💬 更自然的说法</h3>${s.betterPhrasings
                .map(
                  (p) =>
                    `<div class="phrase"><span class="said">${esc(p.said)}</span><span class="arrow">→</span><span class="better">${esc(p.better)}</span></div>`,
                )
                .join('')}</div>`
            : ''
        }
        ${
          s.commonMistakes.length
            ? `<div class="summary-section"><h3>📍 常见错误</h3><ul>${s.commonMistakes
                .map((m) => `<li>${esc(m)}</li>`)
                .join('')}</ul></div>`
            : ''
        }
        ${
          s.newWords.length
            ? `<div class="summary-section"><h3>📒 今日新词（已收藏）</h3><div class="word-chips">${s.newWords
                .map((w) => `<span class="word-chip"><b>${esc(w.word)}</b> ${esc(w.meaning)}</span>`)
                .join('')}</div></div>`
            : ''
        }
        <button class="btn btn-primary btn-block" id="close-summary">好的，谢谢 Fox</button>
      </div>
    `
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove()
    })
    overlay.querySelector('#close-summary')?.addEventListener('click', () => overlay.remove())
    el.appendChild(overlay)
  }

  function scrollMsgs() {
    requestAnimationFrame(() => {
      const box = el.querySelector('#voice-messages')
      if (box) box.scrollTop = box.scrollHeight
    })
  }

  render()
  return el
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/quota|exceeded|RESOURCE_EXHAUSTED|limit:\s*0|429/i.test(msg)) {
    return '⚠️ 你的 Gemini Key 免费额度不足或为 0（多为 Google 账号/地区限制，或需开通计费）。\n可在「我的 → AI 设置」换一个能用的 Key，朗读语音也会随之恢复。'
  }
  if (/API key|API_KEY|invalid|403|PERMISSION/i.test(msg)) {
    return '⚠️ Gemini Key 无效或未授权。请到「我的 → AI 设置」检查 Key。'
  }
  return `⚠️ ${msg}。去「我的 → AI 设置」检查一下。`
}

function formatContent(text: string): string {
  return esc(text).replace(/\n/g, '<br>')
}
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escAttr(s: string): string {
  return esc(s).replace(/"/g, '&quot;')
}
