import type {
  AgentStats,
  AiSettings,
  ChatMessage,
  ErrorNote,
  IslandState,
  SavedWord,
  SessionSummary,
  UserProfile,
} from './types'
import {
  DEFAULT_AI_SETTINGS,
  DEFAULT_ISLAND,
  DEFAULT_PROFILE,
  DEFAULT_STATS,
} from './types'

const KEYS = {
  profile: 'ei_profile_v1',
  aiSettings: 'ei_ai_settings',
  errorNotes: 'ei_error_notes',
  chatHistory: 'ei_chat_history',
  stats: 'ei_agent_stats',
  voiceAutoRead: 'ei_voice_auto_read',
  savedWords: 'ei_saved_words',
  summaries: 'ei_session_summaries',
  readArticles: 'ei_read_articles',
  island: 'ei_island',
} as const

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) } as T
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function readArr<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export const storage = {
  getProfile: (): UserProfile => load(KEYS.profile, DEFAULT_PROFILE),
  saveProfile: (profile: UserProfile) => save(KEYS.profile, profile),

  getStats: (): AgentStats => load(KEYS.stats, DEFAULT_STATS),
  saveStats: (stats: AgentStats) => save(KEYS.stats, stats),

  recordActivity: (userMessageCount = 1) => {
    const stats = storage.getStats()
    const today = todayStr()
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    if (stats.lastActiveDate === today) {
      stats.totalMessages += userMessageCount
    } else {
      stats.streak =
        stats.lastActiveDate === yesterday ? stats.streak + 1 : stats.lastActiveDate ? 1 : 1
      stats.lastActiveDate = today
      stats.totalMessages += userMessageCount
      stats.sessionsCount += 1
    }

    stats.xp += userMessageCount * 10
    storage.saveStats(stats)
    return stats
  },

  getAiSettings: (): AiSettings => {
    const s = load(KEYS.aiSettings, DEFAULT_AI_SETTINGS)
    // One-time switch of existing installs to the free, no-key AI + voice,
    // so chat/read-aloud work without setting up any API key.
    if (localStorage.getItem('ei_free_migrated_v1') !== '1') {
      s.provider = 'free'
      s.ttsVoice = 'free'
      if (!s.freeVoice) s.freeVoice = 'nova'
      save(KEYS.aiSettings, s)
      localStorage.setItem('ei_free_migrated_v1', '1')
    }
    // v2: default read-aloud to the reliable system voice (iOS-safe);
    // the free/neural voices stay available as an opt-in.
    if (localStorage.getItem('ei_tts_system_v2') !== '1') {
      if (s.ttsVoice === 'free') {
        s.ttsVoice = 'system'
        save(KEYS.aiSettings, s)
      }
      localStorage.setItem('ei_tts_system_v2', '1')
    }
    // v3: switch free voice to Amazon Polly (reliable on mobile incl. iOS) and
    // make it the default read-aloud again; old Pollinations voice ids are reset.
    if (localStorage.getItem('ei_tts_polly_v3') !== '1') {
      const pollyNames = ['Salli', 'Joanna', 'Kimberly', 'Kendra', 'Amy', 'Emma', 'Matthew', 'Brian', 'Ivy']
      if (!pollyNames.includes(s.freeVoice)) s.freeVoice = 'Salli'
      s.ttsVoice = 'free'
      save(KEYS.aiSettings, s)
      localStorage.setItem('ei_tts_polly_v3', '1')
    }
    return s
  },
  saveAiSettings: (settings: AiSettings) => save(KEYS.aiSettings, settings),

  getErrorNotes: (): ErrorNote[] => {
    try {
      const raw = localStorage.getItem(KEYS.errorNotes)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },
  saveErrorNotes: (notes: ErrorNote[]) => save(KEYS.errorNotes, notes),
  addErrorNote: (note: Omit<ErrorNote, 'id' | 'createdAt'>) => {
    const notes = storage.getErrorNotes()
    notes.unshift({
      ...note,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    })
    storage.saveErrorNotes(notes)
    return notes
  },
  deleteErrorNote: (id: string) => {
    const notes = storage.getErrorNotes().filter((n) => n.id !== id)
    storage.saveErrorNotes(notes)
    return notes
  },

  getChatHistory: (): ChatMessage[] => {
    try {
      const raw = localStorage.getItem(KEYS.chatHistory)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },
  saveChatHistory: (messages: ChatMessage[]) => save(KEYS.chatHistory, messages),
  clearChatHistory: () => {
    localStorage.removeItem(KEYS.chatHistory)
  },

  getSavedWords: (): SavedWord[] => readArr<SavedWord>(KEYS.savedWords),
  addSavedWords: (words: { word: string; meaning: string }[]) => {
    const existing = storage.getSavedWords()
    const known = new Set(existing.map((w) => w.word.toLowerCase()))
    for (const w of words) {
      const key = w.word.trim().toLowerCase()
      if (!key || known.has(key)) continue
      known.add(key)
      existing.unshift({ word: w.word.trim(), meaning: w.meaning, createdAt: Date.now() })
    }
    save(KEYS.savedWords, existing.slice(0, 300))
    return existing
  },
  deleteSavedWord: (word: string) => {
    const words = storage.getSavedWords().filter((w) => w.word !== word)
    save(KEYS.savedWords, words)
    return words
  },

  getSummaries: (): SessionSummary[] => readArr<SessionSummary>(KEYS.summaries),
  addSummary: (summary: SessionSummary) => {
    const all = storage.getSummaries()
    all.unshift(summary)
    save(KEYS.summaries, all.slice(0, 50))
    return all
  },

  getReadArticles: (): string[] => readArr<string>(KEYS.readArticles),
  markArticleRead: (id: string) => {
    const ids = storage.getReadArticles()
    if (!ids.includes(id)) {
      ids.push(id)
      save(KEYS.readArticles, ids)
    }
  },

  getIsland: (): IslandState => load(KEYS.island, DEFAULT_ISLAND),
  saveIsland: (state: IslandState) => save(KEYS.island, state),

  /** Has the player already cleared a brand-new scene today? (daily gate) */
  unlockedToday: (): boolean => {
    return storage.getIsland().lastUnlockDate === todayStr()
  },

  /** Record a cleared scene: award coins, unlock the next spot, gate to today. */
  completeScene: (
    sceneId: string,
    reward: { coins: number; unlockSpot?: string },
  ): IslandState => {
    const island = storage.getIsland()
    const isNew = !island.completedScenes.includes(sceneId)
    if (isNew) {
      island.completedScenes.push(sceneId)
      island.coins += reward.coins
      if (reward.unlockSpot && !island.unlockedSpots.includes(reward.unlockSpot)) {
        island.unlockedSpots.push(reward.unlockSpot)
      }
      island.lastUnlockDate = todayStr()
    }
    storage.saveIsland(island)
    return island
  },

  /** Spend shells to build a plot. Returns false if too few coins. */
  buildPlot: (id: string, cost: number): boolean => {
    const island = storage.getIsland()
    if (island.built.includes(id)) return true
    if (island.coins < cost) return false
    island.coins -= cost
    island.built.push(id)
    storage.saveIsland(island)
    return true
  },

  canCollect: (id: string): boolean => {
    const island = storage.getIsland()
    if (island.collectDate !== todayStr()) return true
    return !island.collectedToday.includes(id)
  },

  /** Collect the daily shells from a built plot. Returns coins gained (0 if already collected). */
  collectFromPlot: (id: string, amount: number): number => {
    const island = storage.getIsland()
    const today = todayStr()
    if (island.collectDate !== today) {
      island.collectDate = today
      island.collectedToday = []
    }
    if (island.collectedToday.includes(id)) {
      storage.saveIsland(island)
      return 0
    }
    island.collectedToday.push(id)
    island.coins += amount
    storage.saveIsland(island)
    return amount
  },

  getVoiceAutoRead: (): boolean => {
    return localStorage.getItem(KEYS.voiceAutoRead) !== '0'
  },
  setVoiceAutoRead: (v: boolean) => {
    localStorage.setItem(KEYS.voiceAutoRead, v ? '1' : '0')
  },
}
