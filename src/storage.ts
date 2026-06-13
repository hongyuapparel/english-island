import type {
  AgentStats,
  AiSettings,
  ChatMessage,
  ErrorNote,
  UserProfile,
} from './types'
import { DEFAULT_AI_SETTINGS, DEFAULT_PROFILE, DEFAULT_STATS } from './types'

const KEYS = {
  profile: 'et_profile_v2',
  aiSettings: 'et_ai_settings',
  errorNotes: 'et_error_notes',
  chatHistory: 'et_chat_history',
  stats: 'et_agent_stats',
  lessonProgress: 'et_lesson_progress',
  voiceAutoRead: 'et_voice_auto_read',
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

  getLessonProgress: (): Record<string, { page: number; done: boolean }> => {
    try {
      const raw = localStorage.getItem(KEYS.lessonProgress)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  },
  saveLessonPage: (lessonId: string, page: number) => {
    const prog = storage.getLessonProgress()
    prog[lessonId] = { page, done: prog[lessonId]?.done ?? false }
    localStorage.setItem(KEYS.lessonProgress, JSON.stringify(prog))
  },
  markLessonDone: (lessonId: string) => {
    const prog = storage.getLessonProgress()
    prog[lessonId] = { page: prog[lessonId]?.page ?? 0, done: true }
    localStorage.setItem(KEYS.lessonProgress, JSON.stringify(prog))
  },

  getVoiceAutoRead: (): boolean => {
    return localStorage.getItem(KEYS.voiceAutoRead) !== '0'
  },
  setVoiceAutoRead: (v: boolean) => {
    localStorage.setItem(KEYS.voiceAutoRead, v ? '1' : '0')
  },
}
