import type {
  AgentStats,
  AiSettings,
  ChatMessage,
  ErrorNote,
  MemoryExtraction,
  SessionSummary,
  UserProfile,
} from '../types'
import {
  buildAgentSystemPrompt,
  buildArticleDiscussionPrompt,
  buildGreetingPrompt,
  MEMORY_EXTRACTION_PROMPT,
  SESSION_SUMMARY_PROMPT,
} from './prompt'
import type { Article } from '../data/articles'

type ApiMessage = { role: 'system' | 'user' | 'assistant'; content: string }

async function callAi(
  settings: AiSettings,
  messages: ApiMessage[],
): Promise<string> {
  // Free, no-key AI (Pollinations) — works from the browser with no backend
  // and no API key, so the app is usable out of the box.
  if (settings.provider === 'free') {
    return callPollinations(messages)
  }
  // Gemini is called straight from the browser so the app works on a
  // static host (e.g. GitHub Pages) with no backend — ideal for mobile.
  if (settings.provider === 'gemini') {
    return callGeminiDirect(settings, messages)
  }
  // Ollama needs the local Express proxy (development only).
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: settings.provider,
      messages,
      ollamaBaseUrl: settings.ollamaBaseUrl,
      ollamaModel: settings.ollamaModel,
    }),
  })
  const data = (await response.json()) as { content?: string; error?: string }
  if (!response.ok) throw new Error(data.error || '请求失败')
  return data.content ?? ''
}

async function callPollinations(messages: ApiMessage[]): Promise<string> {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages,
      referrer: 'english-island',
    }),
  })
  if (!res.ok) {
    throw new Error(`免费 AI 暂时不可用（${res.status}），可稍后再试或在设置里换用 Gemini`)
  }
  const raw = await res.text()
  try {
    const data = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    return data.choices?.[0]?.message?.content ?? raw
  } catch {
    return raw
  }
}

async function callGeminiDirect(
  settings: AiSettings,
  messages: ApiMessage[],
): Promise<string> {
  if (!settings.geminiApiKey) {
    throw new Error('请先在「我的 → AI 设置」填入 Gemini API Key')
  }
  const model = settings.geminiModel || 'gemini-2.0-flash'
  const system = messages.find((m) => m.role === 'system')
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
  const body: Record<string, unknown> = { contents }
  if (system) body.systemInstruction = { parts: [{ text: system.content }] }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.geminiApiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    error?: { message?: string }
  }
  if (!response.ok) {
    throw new Error(`Gemini 错误：${data.error?.message ?? response.status}`)
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

function firstJson<T>(raw: string): T | null {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as T
  } catch {
    return null
  }
}

export async function sendChatMessage(
  profile: UserProfile,
  stats: AgentStats,
  errorNotes: ErrorNote[],
  settings: AiSettings,
  history: ChatMessage[],
  userMessage: string,
  voiceMode = false,
  systemOverride?: string,
): Promise<string> {
  const systemPrompt =
    systemOverride ??
    buildAgentSystemPrompt(profile, stats, errorNotes, { voiceMode })
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

/** Ask Fox to proactively greet the user when they open the app. */
export async function generateGreeting(
  profile: UserProfile,
  stats: AgentStats,
  settings: AiSettings,
): Promise<string> {
  return callAi(settings, [
    { role: 'system', content: buildGreetingPrompt(profile, stats) },
    { role: 'user', content: '(The user just opened the app. Greet them.)' },
  ])
}

export function buildArticleSystemPrompt(
  profile: UserProfile,
  article: Article,
): string {
  return buildArticleDiscussionPrompt(profile, article)
}

export async function extractMemoryFromChat(
  settings: AiSettings,
  history: ChatMessage[],
  currentProfile: UserProfile,
): Promise<MemoryExtraction | null> {
  if (history.length < 2) return null
  const transcript = history
    .slice(-12)
    .map((m) => `${m.role === 'user' ? 'Learner' : 'Fox'}: ${m.content}`)
    .join('\n')
  try {
    const raw = await callAi(settings, [
      { role: 'system', content: MEMORY_EXTRACTION_PROMPT },
      {
        role: 'user',
        content: `Profile:\n${JSON.stringify(currentProfile)}\n\nChat:\n${transcript}`,
      },
    ])
    return firstJson<MemoryExtraction>(raw)
  } catch {
    return null
  }
}

/** Produce a gentle end-of-session recap. */
export async function summarizeSession(
  settings: AiSettings,
  history: ChatMessage[],
): Promise<SessionSummary | null> {
  const userTurns = history.filter((m) => m.role === 'user')
  if (userTurns.length < 1) return null
  const transcript = history
    .map((m) => `${m.role === 'user' ? 'Learner' : 'Fox'}: ${m.content}`)
    .join('\n')
  try {
    const raw = await callAi(settings, [
      { role: 'system', content: SESSION_SUMMARY_PROMPT },
      { role: 'user', content: transcript },
    ])
    const parsed = firstJson<Omit<SessionSummary, 'id' | 'createdAt'>>(raw)
    if (!parsed) return null
    return {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      encouragement: parsed.encouragement ?? '',
      betterPhrasings: parsed.betterPhrasings ?? [],
      commonMistakes: parsed.commonMistakes ?? [],
      newWords: parsed.newWords ?? [],
    }
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
