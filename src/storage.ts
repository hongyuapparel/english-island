import type {
  AgentStats,
  AiSettings,
  ChatMessage,
  ErrorNote,
  SavedWord,
  SessionSummary,
  UserProfile,
} from './types'
import { DEFAULT_AI_SETTINGS, DEFAULT_PROFILE, DEFAULT_STATS } from './types'

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

  getAiSettings: (): AiSettings => load(KEYS.aiSettings, DEFAULT_AI_SETTINGS),
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

  getVoiceAutoRead: (): boolean => {
    return localStorage.getItem(KEYS.voiceAutoRead) !== '0'
  },
  setVoiceAutoRead: (v: boolean) => {
    localStorage.setItem(KEYS.voiceAutoRead, v ? '1' : '0')
  },
}
