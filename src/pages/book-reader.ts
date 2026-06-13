import { getEpisode } from '../data/modern-family'
import type { Annotation } from '../data/modern-family/types'
import { storage } from '../storage'
import { renderParagraph, esc } from '../utils/render-annotated'
import { speakLessonText } from '../voice/speech'
import { sendLessonQuestion } from '../ai/chat'
import type { ChatMessage } from '../types'
import type { BookPage } from '../data/modern-family/types'

function pageSpeechText(page: BookPage): string {
  return page.paragraphs.flatMap((p) => p.parts.map((x) => x.value)).join(' ')
}

export function renderBookReader(episodeId: string, onBack: () => void): HTMLElement {
  const episode = getEpisode(episodeId)
  const el = document.createElement('div')
  el.className = 'page book-reader-page'

  if (!episode) {
    el.innerHTML = '<p>本集内容尚未上线</p>'
    return el
  }

  const progressKey = `mf-${episodeId}`
  let scrollPage = storage.getLessonProgress()[progressKey]?.page ?? 0
  let activeNoteId: string | null = null
  let showZh = true
  let askOpen = false
  let askLoading = false
  let askHistory: ChatMessage[] = []

  function render() {
    const total = episode!.pages.length
    const page = episode!.pages[scrollPage]
    const activeNote: Annotation | null = activeNoteId
      ? episode!.annotations[activeNoteId] ?? null
      : null

    el.innerHTML = `
      <div class="book-chrome">
        <button class="btn btn-ghost back-btn" id="back">
          ← S${String(episode!.season).padStart(2, '0')}E${String(episode!.episode).padStart(2, '0')}
        </button>
        <div class="book-meta">
          <span class="book-ep-title">${esc(episode!.title)}</span>
          <span class="book-ep-zh">${esc(episode!.titleZh)}</span>
        </div>
        <div class="book-chrome-actions">
          <button class="btn btn-ghost btn-sm" id="toggle-zh">${showZh ? '隐藏中文' : '显示中文'}</button>
        </div>
      </div>

      <div class="book-progress">
        <div class="book-progress-fill" style="width:${((scrollPage + 1) / total) * 100}%"></div>
        <span class="book-progress-label">${scrollPage + 1} / ${total}</span>
      </div>

      <article class="book-page">
        <header class="book-scene-header">
          <h2 class="book-scene-title">${esc(page.sceneTitle)}</h2>
          ${showZh && page.sceneTitleZh ? `<p class="book-scene-zh">${esc(page.sceneTitleZh)}</p>` : ''}
        </header>

        ${
          page.image
            ? `<figure class="book-figure">
                <img src="${page.image}" alt="" loading="lazy" />
                ${page.imageCaption ? `<figcaption>${esc(page.imageCaption)}</figcaption>` : ''}
              </figure>`
            : ''
        }

        <div class="book-body">
          ${page.paragraphs.map((p) => renderParagraph(p, episode!.annotations, activeNoteId)).join('')}
        </div>

        ${
          activeNote
            ? `<aside class="book-margin-note open" id="margin-note">
                <div class="margin-note-header">
                  <span class="margin-label">📌 注释</span>
                  <button class="margin-close" id="close-note">✕</button>
                </div>
                <div class="margin-phrase">${esc(activeNote.phrase)}</div>
                <div class="margin-meaning">${esc(activeNote.meaning)}</div>
                <p class="margin-expl">${esc(activeNote.explanation)}</p>
                ${activeNote.example ? `<p class="margin-example"><em>e.g.</em> ${esc(activeNote.example)}</p>` : ''}
                <button class="btn btn-secondary btn-sm" id="ask-phrase">💬 问 Luna 关于这个词</button>
              </aside>`
            : `<aside class="book-margin-note hint">
                <p>👆 点击文中 <span class="annotated-sample">高亮词</span> 查看注释</p>
              </aside>`
        }
      </article>

      <nav class="book-nav">
        <button class="btn btn-secondary" id="prev" ${scrollPage === 0 ? 'disabled' : ''}>← 上一页</button>
        <button class="btn btn-accent" id="read-aloud">🔊 朗读本页</button>
        <button class="btn btn-primary" id="next">
          ${scrollPage >= total - 1 ? '读完本集 ✓' : '下一页 →'}
        </button>
      </nav>

      ${
        askOpen && activeNote
          ? `<div class="ask-panel book-ask">
              <div class="ask-header">
                <img src="/coach-luna.png" alt="" />
                <span>关于 "${esc(activeNote.phrase)}"</span>
                <button class="ask-close" id="close-ask">✕</button>
              </div>
              <div class="ask-messages" id="ask-msgs">
                ${askHistory.length === 0 ? '<p class="ask-hint">例如：这个词在什么场合用？给我更多例句</p>' : askHistory.map((m) => `<div class="ask-msg ${m.role}">${esc(m.content)}</div>`).join('')}
                ${askLoading ? '<p class="ask-loading">Luna 在想…</p>' : ''}
              </div>
              <div class="ask-input-row">
                <input type="text" id="ask-input" placeholder="输入问题…" />
                <button class="btn btn-primary btn-sm" id="ask-send">问</button>
              </div>
            </div>`
          : ''
      }
    `

    const pageText = pageSpeechText(page)
    bindEvents(pageText)
    storage.saveLessonPage(progressKey, scrollPage)
  }

  function bindEvents(pageText: string) {
    el.querySelector('#back')?.addEventListener('click', onBack)
    el.querySelector('#toggle-zh')?.addEventListener('click', () => {
      showZh = !showZh
      render()
    })
    el.querySelector('#prev')?.addEventListener('click', () => {
      if (scrollPage > 0) {
        scrollPage--
        activeNoteId = null
        askHistory = []
        render()
        scrollTop()
      }
    })
    el.querySelector('#next')?.addEventListener('click', () => {
      if (scrollPage < episode!.pages.length - 1) {
        scrollPage++
        activeNoteId = null
        askHistory = []
        render()
        scrollTop()
      } else {
        storage.markLessonDone(progressKey)
        alert('🎉 本集读完！')
        onBack()
      }
    })
    el.querySelector('#read-aloud')?.addEventListener('click', () => {
      speakLessonText(pageText)
    })
    el.querySelectorAll('.annotated-word').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeNoteId = (btn as HTMLElement).dataset.note ?? null
        askHistory = []
        render()
      })
    })
    el.querySelector('#close-note')?.addEventListener('click', () => {
      activeNoteId = null
      askOpen = false
      render()
    })
    el.querySelector('#ask-phrase')?.addEventListener('click', () => {
      askOpen = true
      render()
    })
    el.querySelector('#close-ask')?.addEventListener('click', () => {
      askOpen = false
      render()
    })
    el.querySelector('#ask-send')?.addEventListener('click', () => submitAsk())
    el.querySelector('#ask-input')?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') submitAsk()
    })
  }

  async function submitAsk() {
    if (!activeNoteId) return
    const note = episode!.annotations[activeNoteId]
    const input = el.querySelector('#ask-input') as HTMLInputElement | null
    const text = input?.value.trim() || `请详细讲讲 "${note.phrase}" 的用法和更多例句`
    if (input) input.value = ''
    if (askLoading) return

    askHistory.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    })
    askLoading = true
    render()

    try {
      const page = episode!.pages[scrollPage]
      const fakeLesson = {
        id: episode!.id,
        courseId: 'modern-family',
        order: episode!.episode,
        title: episode!.title,
        subtitle: episode!.titleZh,
        coverImage: episode!.coverImage,
        level: 'B1',
        duration: '',
        pages: [
          {
            title: page.sceneTitle,
            image: page.image ?? '',
            content: page.paragraphs.map((p) => p.parts.map((x) => x.value).join('')).join('\n'),
            translation: '',
            vocabulary: [{ word: note.phrase, meaning: note.meaning }],
          },
        ],
      }
      const reply = await sendLessonQuestion(
        storage.getProfile(),
        storage.getAiSettings(),
        fakeLesson,
        fakeLesson.pages[0],
        0,
        askHistory.slice(0, -1),
        text,
      )
      askHistory.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      })
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
    }
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  render()
  return el
}

// Extend BookPage with helper - actually I called page.contentForSpeech() which doesn't exist
// Fix: compute page text inline in render
