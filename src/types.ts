export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'unknown'

export type CorrectionStyle = 'gentle' | 'moderate' | 'strict' | 'chat-first'

export type AiProvider = 'free' | 'ollama' | 'gemini'

export interface UserProfile {
  name: string
  level: EnglishLevel
  interests: string[]
  correctionStyle: CorrectionStyle
  weakPoints: string[]
  goals: string
  notes: string
  lastTopics: string[]
  /** free-form facts the agent learned from chat */
  learnedFacts: string[]
}

export interface AgentStats {
  streak: number
  lastActiveDate: string
  totalMessages: number
  xp: number
  sessionsCount: number
}

export interface AiSettings {
  provider: AiProvider
  ollamaBaseUrl: string
  ollamaModel: string
  geminiApiKey: string
  geminiModel: string
  /** 'free' = free no-key neural voice; 'natural' = Gemini voice (needs key); 'system' = browser. */
  ttsVoice: 'free' | 'natural' | 'system'
  /** Gemini prebuilt voice name, e.g. 'Sulafat'. */
  geminiVoiceName: string
  /** Free (Pollinations) voice name, e.g. 'nova'. */
  freeVoice: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ErrorNote {
  id: string
  original: string
  corrected: string
  explanation: string
  createdAt: number
}

/** A word the user collected while reading / chatting. */
export interface SavedWord {
  word: string
  meaning: string
  createdAt: number
}

/** Gentle end-of-session recap produced after a chat. */
export interface SessionSummary {
  id: string
  createdAt: number
  encouragement: string
  betterPhrasings: { said: string; better: string }[]
  commonMistakes: string[]
  newWords: { word: string; meaning: string }[]
}

/** Progress of the player's English Island (the core game loop). */
export interface IslandState {
  coins: number
  unlockedSpots: string[]
  completedScenes: string[]
  /** YYYY-MM-DD of the last day a brand-new scene was cleared (daily gate). */
  lastUnlockDate: string
}

export const DEFAULT_ISLAND: IslandState = {
  coins: 0,
  unlockedSpots: ['beach'],
  completedScenes: [],
  lastUnlockDate: '',
}

export const AGENT_NAME = 'Fox'
export const APP_NAME = 'English Island'
export const APP_NAME_ZH = '英语小岛'

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  level: 'unknown',
  interests: [],
  correctionStyle: 'chat-first',
  weakPoints: [],
  goals: '',
  notes: '',
  lastTopics: [],
  learnedFacts: [],
}

export const DEFAULT_STATS: AgentStats = {
  streak: 0,
  lastActiveDate: '',
  totalMessages: 0,
  xp: 0,
  sessionsCount: 0,
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: 'free',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'qwen2.5:7b',
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  ttsVoice: 'free',
  geminiVoiceName: 'Sulafat',
  freeVoice: 'nova',
}

export interface MemoryExtraction {
  name?: string
  level?: EnglishLevel
  interests?: string[]
  goals?: string
  weakPoints?: string[]
  notes?: string
  lastTopics?: string[]
  learnedFacts?: string[]
  correctionStyle?: CorrectionStyle | 'unknown'
}
