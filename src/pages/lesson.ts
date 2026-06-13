import { getLesson } from '../data/courses'
import { storage } from '../storage'
import { sendLessonQuestion } from '../ai/chat'
import { VoiceHelper, speakLessonText, isSpeechSupported } from '../voice/speech'
import type { ChatMessage } from '../types'
import { AGENT_NAME } from '../types'

const voice = new VoiceHelper()

export function renderLesson(lessonId: string, onBack: () => void): HTMLElement {
  const data = getLesson(lessonId)
  const el = document.createElement('div')
  el.className = 'page lesson-page'

  if (!data) {
    el.innerHTML = '<p>课程未找到</p>'
    return el
  }

  const { course, lesson } = data
  const savedPage = storage.getLessonProgress()[lessonId]?.page ?? 0
  let pageIndex = savedPage
  let showTranslation = false
  let askOpen = false
  let askLoading = false
  let askHistory: ChatMessage[] = []

  function render() {
    const page = lesson.pages[pageIndex]
    const total = lesson.pages.length
    const progress = ((pageIndex + 1) / total) * 100

    el.innerHTML = `
      <div class="lesson-top">
        <button class="btn btn-ghost back-btn" id="back">← ${esc(course.title)}</button>
        <div class="lesson-progress-bar"><div style="width:${progress}%"></div></div>
        <div class="lesson-page-num">${pageIndex + 1} / ${total}</div>
      </div>

      <article class="textbook-page">
        <div class="textbook-image" style="background-image:url('${page.image}')"></div>
        <div class="textbook-body">
          <h2>${esc(page.title)}</h2>
          <div class="textbook-content">${formatContent(page.content)}</div>

          <button class="btn btn-ghost btn-sm trans-toggle" id="toggle-trans">
            ${showTranslation ? '隐藏中文' : '显示中文翻译'}
          </button>
          ${
            showTranslation
              ? `<div class="textbook-translation">${formatContent(page.translation)}</div>`
              : ''
          }

          ${
            page.vocabulary.length
              ? `<div class="vocab-section">
                  <h3>📖 词汇</h3>
                  <div class="vocab-grid">
                    ${page.vocabulary
                      .map(
                        (v) => `
                      <div class="vocab-card">
                        <div class="vocab-word">${esc(v.word)}</div>
                        ${v.phonetic ? `<div class="vocab-phonetic">${esc(v.phonetic)}</div>` : ''}
                        <div class="vocab-meaning">${esc(v.meaning)}</div>
                      </div>
                    `,
                      )
                      .join('')}
                  </div>
                </div>`
              : ''
          }

          ${page.tip ? `<div class="tip-box">💡 ${esc(page.tip)}</div>` : ''}
        </div>
      </article>

      <div class="lesson-actions">
        <button class="btn btn-secondary" id="prev" ${pageIndex === 0 ? 'disabled' : ''}>← 上一页</button>
        <button class="btn btn-accent" id="read-aloud">🔊 朗读本页</button>
        <button class="btn btn-primary" id="ask-luna">💬 问 Luna</button>
        <button class="btn btn-secondary" id="next" ${pageIndex >= total - 1 ? 'disabled' : ''}>
          ${pageIndex >= total - 1 ? '完成 ✓' : '下一页 →'}
        </button>
      </div>

      ${
        askOpen
          ? `<div class="ask-panel">
              <div class="ask-header">
                <img src="/coach-luna.png" alt="" />
                <span>关于这一页，问 ${AGENT_NAME}</span>
                <button class="ask-close" id="close-ask">✕</button>
              </div>
              <div class="ask-messages" id="ask-msgs">
                ${
                  askHistory.length === 0
                    ? '<p class="ask-hint">例如："caterpillar 怎么读？" "帮我造个句"</p>'
                    : askHistory.map((m) => `<div class="ask-msg ${m.role}">${esc(m.content)}</div>`).join('')
                }
                ${askLoading ? '<p class="ask-loading">Luna 在想…</p>' : ''}
              </div>
              <div class="ask-input-row">
                ${isSpeechSupported() ? '<button class="btn btn-secondary btn-sm" id="ask-mic">🎤</button>' : ''}
                <input type="text" id="ask-input" placeholder="输入问题…" ${askLoading ? 'disabled' : ''} />
                <button class="btn btn-primary btn-sm" id="ask-send" ${askLoading ? 'disabled' : ''}>问</button>
              </div>
            </div>`
          : ''
      }
    `

    bindEvents()
    storage.saveLessonPage(lessonId, pageIndex)
  }

  function bindEvents() {
    el.querySelector('#back')?.addEventListener('click', onBack)
    el.querySelector('#toggle-trans')?.addEventListener('click', () => {
      showTranslation = !showTranslation
      render()
    })
    el.querySelector('#read-aloud')?.addEventListener('click', () => {
      speakLessonText(lesson.pages[pageIndex].content)
    })
    el.querySelector('#prev')?.addEventListener('click', () => {
      if (pageIndex > 0) {
        pageIndex--
        askHistory = []
        render()
      }
    })
    el.querySelector('#next')?.addEventListener('click', () => {
      if (pageIndex < lesson.pages.length - 1) {
        pageIndex++
        askHistory = []
        render()
      } else {
        storage.markLessonDone(lessonId)
        alert('🎉 本课完成！')
        onBack()
      }
    })
    el.querySelector('#ask-luna')?.addEventListener('click', () => {
      askOpen = true
      render()
    })
    el.querySelector('#close-ask')?.addEventListener('click', () => {
      askOpen = false
      voice.stopListening()
      render()
    })
    el.querySelector('#ask-send')?.addEventListener('click', () => submitAsk())
    el.querySelector('#ask-input')?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') submitAsk()
    })
    el.querySelector('#ask-mic')?.addEventListener('click', () => {
      voice.startListening(
        (text, isFinal) => {
          if (isFinal && text.trim()) {
            const input = el.querySelector('#ask-input') as HTMLInputElement
            input.value = text.trim()
            voice.stopListening()
            submitAsk()
          }
        },
        () => {},
        'zh-CN',
      )
    })
  }

  async function submitAsk() {
    const input = el.querySelector('#ask-input') as HTMLInputElement | null
    const text = input?.value.trim()
    if (!text || askLoading) return
    if (input) input.value = ''

    askHistory.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    })
    askLoading = true
    render()

    try {
      const reply = await sendLessonQuestion(
        storage.getProfile(),
        storage.getAiSettings(),
        lesson,
        lesson.pages[pageIndex],
        pageIndex,
        askHistory.slice(0, -1),
        text,
      )
      askHistory.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      })
      voice.speak(reply)
    } catch (err) {
      askHistory.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ ${err instanceof Error ? err.message : '失败'}`,
        timestamp: Date.now(),
      })
    } finally {
      askLoading = false
      render()
      const box = el.querySelector('#ask-msgs')
      if (box) box.scrollTop = box.scrollHeight
    }
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
