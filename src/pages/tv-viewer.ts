import { mfStorage, stillForCueIndex } from '../storage/mf-imports'
import type { SubtitleCue } from '../utils/srt-parser'
import { formatTime, cueDurationMs } from '../utils/srt-parser'
import { VoiceHelper } from '../voice/speech'
import { sendLessonQuestion } from '../ai/chat'
import { storage } from '../storage'
import type { ChatMessage } from '../types'

const voice = new VoiceHelper()

export function renderTvViewer(episodeId: string, onBack: () => void): HTMLElement {
  const el = document.createElement('div')
  el.className = 'tv-viewer'

  let data: Awaited<ReturnType<typeof mfStorage.get>>
  let cueIndex = 0
  let mode: 'watch' | 'script' = 'watch'
  let playing = false
  let playTimer: ReturnType<typeof setTimeout> | null = null
  let selectedWord = ''
  let askOpen = false
  let askLoading = false
  let askHistory: ChatMessage[] = []

  const progressKey = `mf-tv-${episodeId}`

  async function init() {
    data = await mfStorage.get(episodeId)
    if (!data) {
      el.innerHTML = '<p>本集尚未导入</p>'
      return
    }
    cueIndex = storage.getLessonProgress()[progressKey]?.page ?? 0
    render()
  }

  function currentCue(): SubtitleCue {
    return data!.cues[cueIndex]
  }

  function bgImage(): string | undefined {
    if (!data) return undefined
    return (
      stillForCueIndex(cueIndex, data.cues.length, data.stillImages) ??
      data.backdropImage
    )
  }

  function stopPlay() {
    playing = false
    if (playTimer) clearTimeout(playTimer)
    playTimer = null
  }

  function scheduleNext() {
    if (!playing || !data) return
    const cue = currentCue()
    const dur = Math.min(cueDurationMs(cue), 6000)
    playTimer = setTimeout(() => {
      if (cueIndex < data!.cues.length - 1) {
        cueIndex++
        storage.saveLessonPage(progressKey, cueIndex)
        render()
        scheduleNext()
      } else {
        stopPlay()
        render()
      }
    }, dur)
  }

  function togglePlay() {
    if (playing) {
      stopPlay()
    } else {
      playing = true
      voice.speak(currentCue().text)
      scheduleNext()
    }
    render()
  }

  function renderWatch() {
    const cue = currentCue()
    const total = data!.cues.length
    const bg = bgImage()
    const progress = ((cueIndex + 1) / total) * 100

    el.innerHTML = `
      <div class="tv-screen" style="${bg ? `background-image:url('${bg}')` : ''}">
        <div class="tv-vignette"></div>
        <div class="tv-top-bar">
          <button class="tv-icon-btn" id="back" aria-label="返回">←</button>
          <span class="tv-ep-label">S${String(data!.season).padStart(2, '0')}E${String(data!.episode).padStart(2, '0')} · ${esc(data!.title)}</span>
          <button class="tv-icon-btn" id="mode-script" title="剧本模式">📜</button>
        </div>

        <div class="tv-subtitle-wrap">
          ${cue.speaker ? `<div class="tv-speaker">${esc(cue.speaker)}</div>` : ''}
          <div class="tv-subtitle" id="subtitle">${renderClickableWords(cue.text)}</div>
          <div class="tv-time">${formatTime(cue.startMs)} · ${cueIndex + 1} / ${total}</div>
        </div>

        <div class="tv-progress"><div style="width:${progress}%"></div></div>
      </div>

      <div class="tv-controls">
        <button class="btn btn-ghost btn-sm" id="prev" ${cueIndex === 0 ? 'disabled' : ''}>上一句</button>
        <button class="tv-play-btn" id="play">${playing ? '⏸' : '▶'}</button>
        <button class="btn btn-ghost btn-sm" id="speak">🔊</button>
        <button class="btn btn-ghost btn-sm" id="next" ${cueIndex >= total - 1 ? 'disabled' : ''}>下一句</button>
      </div>

      ${
        selectedWord
          ? `<div class="tv-word-pop">
              <strong>${esc(selectedWord)}</strong>
              <button class="btn btn-primary btn-sm" id="explain-word">查词 / 问 Luna</button>
              <button class="tv-pop-close" id="close-word">✕</button>
            </div>`
          : ''
      }

      ${renderAskPanel()}
    `
    bindWatchEvents()
  }

  function renderScript() {
    const total = data!.cues.length
    el.innerHTML = `
      <div class="script-view">
        <div class="script-header">
          <button class="btn btn-ghost back-btn" id="back">← 返回</button>
          <h2>${esc(data!.title)} — 完整台词本</h2>
          <button class="btn btn-secondary btn-sm" id="mode-watch">📺 电视模式</button>
        </div>
        <div class="script-list">
          ${data!.cues
            .map(
              (c, i) => `
            <div class="script-line ${i === cueIndex ? 'active' : ''}" data-idx="${i}">
              <span class="script-time">${formatTime(c.startMs)}</span>
              ${c.speaker ? `<span class="script-speaker">${esc(c.speaker)}</span>` : ''}
              <span class="script-text">${renderClickableWords(c.text)}</span>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
      ${renderAskPanel()}
    `
    bindScriptEvents()
  }

  function renderAskPanel(): string {
    if (!askOpen) return ''
    return `
      <div class="ask-panel tv-ask">
        <div class="ask-header">
          <img src="/coach-luna.png" alt="" />
          <span>关于 "${esc(selectedWord || currentCue().text.slice(0, 30))}"</span>
          <button class="ask-close" id="close-ask">✕</button>
        </div>
        <div class="ask-messages" id="ask-msgs">
          ${askHistory.map((m) => `<div class="ask-msg ${m.role}">${esc(m.content)}</div>`).join('')}
          ${askLoading ? '<p class="ask-loading">Luna 在想…</p>' : ''}
        </div>
        <div class="ask-input-row">
          <input type="text" id="ask-input" placeholder="这个词什么意思？有没有更多例句？" />
          <button class="btn btn-primary btn-sm" id="ask-send">问</button>
        </div>
      </div>
    `
  }

  function renderClickableWords(text: string): string {
    return esc(text).replace(
      /([a-zA-Z'-]+)/g,
      '<button type="button" class="word-tap" data-word="$1">$1</button>',
    )
  }

  function bindWatchEvents() {
    el.querySelector('#back')?.addEventListener('click', () => {
      stopPlay()
      onBack()
    })
    el.querySelector('#mode-script')?.addEventListener('click', () => {
      stopPlay()
      mode = 'script'
      render()
    })
    el.querySelector('#prev')?.addEventListener('click', () => {
      stopPlay()
      if (cueIndex > 0) {
        cueIndex--
        storage.saveLessonPage(progressKey, cueIndex)
        render()
      }
    })
    el.querySelector('#next')?.addEventListener('click', () => {
      stopPlay()
      if (cueIndex < data!.cues.length - 1) {
        cueIndex++
        storage.saveLessonPage(progressKey, cueIndex)
        render()
      }
    })
    el.querySelector('#play')?.addEventListener('click', togglePlay)
    el.querySelector('#speak')?.addEventListener('click', () => {
      voice.speak(currentCue().text)
    })
    bindWordTaps()
    el.querySelector('#explain-word')?.addEventListener('click', () => {
      askOpen = true
      if (selectedWord && askHistory.length === 0) {
        submitAsk(`请解释 "${selectedWord}" 在这句话里的意思：${currentCue().text}`)
      } else {
        render()
      }
    })
    el.querySelector('#close-word')?.addEventListener('click', () => {
      selectedWord = ''
      render()
    })
    bindAskEvents()
  }

  function bindScriptEvents() {
    el.querySelector('#back')?.addEventListener('click', onBack)
    el.querySelector('#mode-watch')?.addEventListener('click', () => {
      mode = 'watch'
      render()
    })
    el.querySelectorAll('.script-line').forEach((line) => {
      line.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).classList.contains('word-tap')) return
        cueIndex = Number((line as HTMLElement).dataset.idx)
        storage.saveLessonPage(progressKey, cueIndex)
        mode = 'watch'
        render()
      })
    })
    bindWordTaps()
    bindAskEvents()
  }

  function bindWordTaps() {
    el.querySelectorAll('.word-tap').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        selectedWord = (btn as HTMLElement).dataset.word ?? ''
        askOpen = false
        askHistory = []
        render()
      })
    })
  }

  function bindAskEvents() {
    el.querySelector('#close-ask')?.addEventListener('click', () => {
      askOpen = false
      render()
    })
    el.querySelector('#ask-send')?.addEventListener('click', () => {
      const input = el.querySelector('#ask-input') as HTMLInputElement
      submitAsk(input?.value.trim() || `解释 "${selectedWord}" 的意思和用法`)
      if (input) input.value = ''
    })
  }

  async function submitAsk(question: string) {
    if (!question || askLoading || !data) return
    askOpen = true
    askHistory.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    })
    askLoading = true
    render()

    const cue = currentCue()
    try {
      const reply = await sendLessonQuestion(
        storage.getProfile(),
        storage.getAiSettings(),
        {
          id: data.episodeId,
          courseId: 'modern-family',
          order: data.episode,
          title: data.title,
          subtitle: data.titleZh,
          coverImage: '',
          level: 'B1',
          duration: '',
          pages: [
            {
              title: 'Current line',
              image: '',
              content: cue.text,
              translation: '',
              vocabulary: selectedWord
                ? [{ word: selectedWord, meaning: '' }]
                : [],
            },
          ],
        },
        {
          title: 'Current line',
          image: '',
          content: cue.text,
          translation: '',
          vocabulary: [],
        },
        0,
        askHistory.slice(0, -1),
        question,
      )
      askHistory.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      })
      voice.speak(reply, 'zh-CN')
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

  function render() {
    if (!data) return
    if (mode === 'watch') renderWatch()
    else renderScript()
  }

  init()
  return el
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
