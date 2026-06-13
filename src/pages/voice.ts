import type { ChatMessage } from '../types'
import { AGENT_NAME } from '../types'
import { storage } from '../storage'
import {
  sendChatMessage,
  extractMemoryFromChat,
  mergeMemoryIntoProfile,
} from '../ai/chat'
import { VoiceHelper, isSpeechSupported } from '../voice/speech'

const voice = new VoiceHelper()
let isLoading = false
let statusText = '点击麦克风开始说话'
let interimText = ''

export function renderVoice(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'page voice-page'

  function render() {
    const messages = storage.getChatHistory()
    const autoRead = storage.getVoiceAutoRead()
    const supported = isSpeechSupported()

    el.innerHTML = `
      <div class="voice-header">
        <img src="/coach-luna.png" alt="${AGENT_NAME}" class="voice-mascot ${voice.isListening ? 'listening' : ''}" />
        <h1>语音对话</h1>
        <p class="voice-status" id="status">${esc(statusText)}</p>
        ${interimText ? `<p class="voice-interim">${esc(interimText)}</p>` : ''}
      </div>

      ${
        !supported
          ? `<div class="card voice-warn">⚠️ 请用 Chrome 或 Edge 浏览器，并允许麦克风权限</div>`
          : ''
      }

      <div class="voice-messages" id="voice-messages">
        ${
          messages.length === 0
            ? `<div class="voice-empty">
                <p>🎤 按住麦克风说话</p>
                <p class="hint">英文或中文都行，Luna 会语音回复你</p>
                <p class="hint">不会主动打扰你 — 你说，她才答</p>
              </div>`
            : messages.map((m) => renderMsg(m)).join('')
        }
        ${
          isLoading
            ? `<div class="voice-loading"><img src="/coach-luna.png" alt="" /> Luna 在想…</div>`
            : ''
        }
      </div>

      <div class="voice-controls">
        <label class="toggle-auto">
          <input type="checkbox" id="auto-read" ${autoRead ? 'checked' : ''} />
          🔊 自动朗读 Luna 的回复
        </label>
        <div class="voice-buttons">
          <button class="btn btn-ghost btn-sm" id="clear-voice" ${messages.length === 0 ? 'disabled' : ''}>清空</button>
          <button class="mic-btn ${voice.isListening ? 'active' : ''}" id="mic-btn" ${!supported || isLoading ? 'disabled' : ''} aria-label="说话">
            <span class="mic-icon">${voice.isListening ? '⏹' : '🎤'}</span>
          </button>
        </div>
        <p class="mic-hint">${voice.isListening ? '正在听… 说完自动发送' : '点击开始 / 再点停止'}</p>
      </div>

      <details class="text-fallback">
        <summary>打字输入</summary>
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
        ${m.role === 'assistant' ? `<img src="/coach-luna.png" alt="" class="msg-av" />` : ''}
        <div class="msg-bubble">
          <p>${formatContent(m.content)}</p>
          ${m.role === 'assistant' ? `<button class="replay-btn" data-text="${escAttr(m.content)}" title="再听一遍">🔊</button>` : ''}
        </div>
      </div>
    `
  }

  function bindEvents() {
    el.querySelector('#mic-btn')?.addEventListener('click', toggleMic)

    el.querySelector('#auto-read')?.addEventListener('change', (e) => {
      storage.setVoiceAutoRead((e.target as HTMLInputElement).checked)
    })

    el.querySelector('#clear-voice')?.addEventListener('click', () => {
      if (confirm('清空对话记录？')) {
        voice.stopListening()
        voice.stopSpeaking()
        storage.clearChatHistory()
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
    statusText = 'Luna 在想…'
    render()

    try {
      const reply = await sendChatMessage(
        storage.getProfile(),
        storage.getStats(),
        storage.getErrorNotes(),
        storage.getAiSettings(),
        messages.slice(0, -1),
        text,
        true,
      )
      messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      })
      storage.saveChatHistory(messages)

      if (storage.getVoiceAutoRead()) {
        voice.speak(reply)
      }

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
        content: `⚠️ ${err instanceof Error ? err.message : '失败'}。去「设置」检查 AI。`,
        timestamp: Date.now(),
      })
      storage.saveChatHistory(messages)
    } finally {
      isLoading = false
      statusText = '点击麦克风开始说话'
      render()
    }
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

function formatContent(text: string): string {
  return esc(text).replace(/\n/g, '<br>')
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escAttr(s: string): string {
  return esc(s).replace(/"/g, '&quot;')
}
