export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'unknown'

export type CorrectionStyle = 'gentle' | 'moderate' | 'strict' | 'chat-first'

export type AiProvider = 'ollama' | 'gemini'

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

export interface ChatScenario {
  id: string
  title: string
  description: string
  emoji: string
  image: string
  openingLine: string
}

export const AGENT_NAME = 'Luna'

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
  provider: 'ollama',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'qwen2.5:7b',
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
}

export const PRESET_SCENARIOS: ChatScenario[] = [
  {
    id: 'coffee',
    title: '咖啡店点单',
    description: '日常点餐 & 礼貌用语',
    emoji: '☕',
    image: 'https://images.unsplash.com/photo-1495474472287-4d21bcffdc4?w=600&q=80',
    openingLine: "Hi! Welcome to our café. What can I get for you today?",
  },
  {
    id: 'interview',
    title: '工作面试',
    description: '自我介绍 & 专业表达',
    emoji: '💼',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80',
    openingLine: "Good morning! Thanks for coming in. Could you tell me a bit about yourself?",
  },
  {
    id: 'travel',
    title: '机场问路',
    description: '旅行场景沟通',
    emoji: '✈️',
    image: 'https://images.unsplash.com/photo-1436491865339-9a61a46a755a?w=600&q=80',
    openingLine: "Excuse me, you look a bit lost. Can I help you find your gate?",
  },
  {
    id: 'show',
    title: '美剧台词',
    description: '用你喜欢的剧聊地道表达',
    emoji: '🎬',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
    openingLine: "So tell me — what's your favorite show? Let's break down some real dialogue from it!",
  },
  {
    id: 'story',
    title: '童话精读',
    description: '读故事、拆词汇、练句型',
    emoji: '📖',
    image: 'https://images.unsplash.com/photo-1512820790801-4153a25438d6?w=600&q=80',
    openingLine: "Pick a story you like — fairy tale, novel, anything. We'll read it together and unpack the language!",
  },
  {
    id: 'translate',
    title: '中译英教练',
    description: '你说中文，我帮你想英文',
    emoji: '🗣️',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=80',
    openingLine: "Tell me what you want to say in Chinese, and I'll help you say it naturally in English.",
  },
]

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
