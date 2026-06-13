import { storage } from '../storage'
import { generateGreeting } from '../ai/chat'
import { VoiceHelper, isTTSSupported } from '../voice/speech'
import { ARTICLES } from '../data/articles'
import { goTo } from '../app'
import { AGENT_NAME } from '../types'
import type { UserProfile, AgentStats } from '../types'

const tts = new VoiceHelper()

/** A warm offline greeting built from memory, used when AI is unavailable. */
function fallbackGreeting(profile: UserProfile, stats: AgentStats): string {
  const hi = profile.name ? `Hi ${profile.name}! ` : 'Hi there! '
  if (stats.streak >= 2) {
    const fact = profile.learnedFacts[profile.learnedFacts.length - 1]
    if (fact) return `${hi}Day ${stats.streak} together — I'm so glad you're back. Last time you mentioned ${fact.toLowerCase()}. How is that going?`
    return `${hi}That's ${stats.streak} days in a row! I really look forward to our chats. What's on your mind today?`
  }
  if (profile.interests.length) {
    return `${hi}Welcome back to the island. I remember you like ${profile.interests[0]}. Tell me — how has your week been?`
  }
  return `${hi}Welcome to English Island. I'm ${AGENT_NAME}, and I'd love to get to know you. What did you do today?`
}

export function renderHome(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'page home-page'

  const profile = storage.getProfile()
  const stats = storage.getStats()
  const settings = storage.getAiSettings()
  const recommended = pickArticle()

  el.innerHTML = `
    <div class="home-sky">
      <img src="/fox.svg" alt="${AGENT_NAME}" class="home-fox" />
      <div class="home-greeting">
        <div class="speech-bubble" id="greeting">
          <span class="greeting-loading">…</span>
        </div>
        <button class="replay-btn home-replay" id="speak-greeting" title="朗读">🔊</button>
      </div>
    </div>

    <div class="home-stats">
      <div class="stat-pill"><span class="stat-num">${stats.streak}</span><span class="stat-label">连续天数</span></div>
      <div class="stat-pill"><span class="stat-num">${profile.level === 'unknown' ? '—' : profile.level}</span><span class="stat-label">当前水平</span></div>
      <div class="stat-pill"><span class="stat-num">${storage.getSavedWords().length}</span><span class="stat-label">收藏单词</span></div>
    </div>

    <div class="home-actions">
      <button class="home-card home-card-chat" id="go-chat">
        <span class="home-card-emoji">💬</span>
        <div>
          <h3>和 ${AGENT_NAME} 聊聊</h3>
          <p>用语音或打字，随便聊点什么</p>
        </div>
      </button>
      <button class="home-card home-card-read" id="go-read">
        <span class="home-card-emoji">${recommended.emoji}</span>
        <div>
          <h3>今天读一篇：${esc(recommended.titleZh)}</h3>
          <p>${esc(recommended.hook)}</p>
        </div>
      </button>
    </div>
  `

  el.querySelector('#go-chat')?.addEventListener('click', () => goTo('chat'))
  el.querySelector('#go-read')?.addEventListener('click', () => {
    sessionStorage.setItem('ei_open_article', recommended.id)
    goTo('reading')
  })

  const bubble = el.querySelector('#greeting') as HTMLElement
  const speakBtn = el.querySelector('#speak-greeting') as HTMLButtonElement
  let greetingText = ''

  function showGreeting(text: string) {
    greetingText = text
    bubble.textContent = text
    speakBtn.style.display = isTTSSupported() ? '' : 'none'
  }

  speakBtn.addEventListener('click', () => {
    if (greetingText) tts.speak(greetingText)
  })

  // Try a live, memory-aware greeting; fall back to a warm template offline.
  const hasAi = settings.provider === 'gemini' ? !!settings.geminiApiKey : true
  if (hasAi) {
    generateGreeting(profile, stats, settings)
      .then((text) => showGreeting(text.trim() || fallbackGreeting(profile, stats)))
      .catch(() => showGreeting(fallbackGreeting(profile, stats)))
  } else {
    showGreeting(fallbackGreeting(profile, stats))
  }

  return el
}

/** Recommend an unread article, cycling by day so it feels fresh. */
function pickArticle() {
  const read = new Set(storage.getReadArticles())
  const unread = ARTICLES.filter((a) => !read.has(a.id))
  const pool = unread.length ? unread : ARTICLES
  const dayIndex = Math.floor(Date.now() / 86400000) % pool.length
  return pool[dayIndex]
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
