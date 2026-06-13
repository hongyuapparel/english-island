import type {
  AiSettings,
  ChatMessage,
  MemoryExtraction,
  UserProfile,
} from '../types'
import {
  buildAgentSystemPrompt,
  buildLessonSystemPrompt,
  MEMORY_EXTRACTION_PROMPT,
} from './prompt'
import type { AgentStats, ErrorNote } from '../types'
import type { Lesson, LessonPage } from '../data/courses'

type ApiMessage = { role: 'system' | 'user' | 'assistant'; content: string }

async function callAi(
  settings: AiSettings,
  messages: ApiMessage[],
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: settings.provider,
      messages,
      ollamaBaseUrl: settings.ollamaBaseUrl,
      ollamaModel: settings.ollamaModel,
      geminiApiKey: settings.geminiApiKey,
      geminiModel: settings.geminiModel,
    }),
  })
  const data = (await response.json()) as { content?: string; error?: string }
  if (!response.ok) throw new Error(data.error || '请求失败')
  return data.content ?? ''
}

export async function sendChatMessage(
  profile: UserProfile,
  stats: AgentStats,
  errorNotes: ErrorNote[],
  settings: AiSettings,
  history: ChatMessage[],
  userMessage: string,
  voiceMode = false,
): Promise<string> {
  const systemPrompt = buildAgentSystemPrompt(profile, stats, errorNotes, {
    voiceMode,
  })
  const messages: ApiMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]
  return callAi(settings, messages)
}

export async function sendLessonQuestion(
  profile: UserProfile,
  settings: AiSettings,
  lesson: Lesson,
  page: LessonPage,
  pageIndex: number,
  history: ChatMessage[],
  question: string,
): Promise<string> {
  const systemPrompt = buildLessonSystemPrompt(profile, lesson, page, pageIndex)
  const messages: ApiMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: question },
  ]
  return callAi(settings, messages)
}

export async function extractMemoryFromChat(
  settings: AiSettings,
  history: ChatMessage[],
  currentProfile: UserProfile,
): Promise<MemoryExtraction | null> {
  if (history.length < 2) return null
  const transcript = history
    .slice(-12)
    .map((m) => `${m.role === 'user' ? 'Learner' : 'Coach'}: ${m.content}`)
    .join('\n')
  try {
    const raw = await callAi(settings, [
      { role: 'system', content: MEMORY_EXTRACTION_PROMPT },
      {
        role: 'user',
        content: `Profile:\n${JSON.stringify(currentProfile)}\n\nChat:\n${transcript}`,
      },
    ])
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0]) as MemoryExtraction
  } catch {
    return null
  }
}

export function mergeMemoryIntoProfile(
  profile: UserProfile,
  extracted: MemoryExtraction,
): UserProfile {
  const mergeArr = (a: string[], b?: string[]) => {
    if (!b?.length) return a
    return [...new Set([...a, ...b])].slice(-20)
  }
  return {
    name: extracted.name?.trim() || profile.name,
    level:
      extracted.level && extracted.level !== 'unknown'
        ? extracted.level
        : profile.level,
    interests: mergeArr(profile.interests, extracted.interests),
    goals: extracted.goals?.trim() || profile.goals,
    weakPoints: mergeArr(profile.weakPoints, extracted.weakPoints),
    notes: extracted.notes?.trim() || profile.notes,
    lastTopics: extracted.lastTopics?.length
      ? extracted.lastTopics
      : profile.lastTopics,
    learnedFacts: mergeArr(profile.learnedFacts, extracted.learnedFacts),
    correctionStyle:
      extracted.correctionStyle && extracted.correctionStyle !== 'unknown'
        ? extracted.correctionStyle
        : profile.correctionStyle,
  }
}

export async function fetchOllamaModels(baseUrl: string): Promise<string[]> {
  const response = await fetch(
    `/api/ollama/models?baseUrl=${encodeURIComponent(baseUrl)}`,
  )
  const data = (await response.json()) as {
    models?: Array<{ name: string }>
    error?: string
  }
  if (!response.ok) throw new Error(data.error || '获取模型列表失败')
  return data.models?.map((m) => m.name) ?? []
}
