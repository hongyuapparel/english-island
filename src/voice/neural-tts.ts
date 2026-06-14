// High-quality, expressive speech via Gemini's text-to-speech model.
// Called straight from the browser with the user's own key (no backend),
// so it works on the static mobile build. Falls back to the system voice
// (handled by the caller) when there's no key or a request fails.
import type { AiSettings } from '../types'

export type TtsStyle = 'normal' | 'slow' | 'warm'

const TTS_MODEL = 'gemini-2.5-flash-preview-tts'
const DEFAULT_RATE = 24000
const DEFAULT_VOICE = 'Sulafat'

/** Warm fox-companion voices, with the tone Google documents for each. */
export const GEMINI_VOICES: { name: string; zh: string }[] = [
  { name: 'Sulafat', zh: '温暖' },
  { name: 'Achird', zh: '友好' },
  { name: 'Vindemiatrix', zh: '柔和' },
  { name: 'Aoede', zh: '轻快' },
  { name: 'Leda', zh: '年轻' },
  { name: 'Kore', zh: '沉稳' },
]

/** Free (Pollinations / OpenAI) voices — no key required. */
export const FREE_VOICES: { name: string; zh: string }[] = [
  { name: 'nova', zh: '温暖女声' },
  { name: 'shimmer', zh: '轻柔女声' },
  { name: 'fable', zh: '故事感' },
  { name: 'alloy', zh: '自然中性' },
  { name: 'echo', zh: '沉稳男声' },
  { name: 'onyx', zh: '低沉男声' },
]

export function useNeuralVoice(settings: AiSettings): boolean {
  if (settings.ttsVoice === 'system') return false
  if (settings.ttsVoice === 'free') return true // no key needed
  return !!settings.geminiApiKey
}

/** Free TTS: a plain audio URL the <audio> element streams directly (no CORS). */
function freeVoiceUrl(text: string, settings: AiSettings): string {
  const voice = settings.freeVoice || 'nova'
  return `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${voice}`
}

async function getAudioUrl(
  text: string,
  settings: AiSettings,
  style: TtsStyle,
): Promise<string> {
  if (settings.ttsVoice === 'free') return freeVoiceUrl(text, settings)
  return fetchTts(text, settings, style)
}

function stylePrefix(style: TtsStyle): string {
  switch (style) {
    case 'slow':
      return 'Read this slowly and very clearly, warmly, for someone learning English: '
    case 'warm':
      return 'Say this warmly and gently, like a kind, friendly fox talking to a friend: '
    default:
      return 'Read this naturally and warmly, with gentle, lively expression: '
  }
}

// --- audio cache (object URLs keyed by voice+style+text) ---------------
const cache = new Map<string, string>()
const CACHE_MAX = 80

function cacheGet(key: string): string | undefined {
  return cache.get(key)
}
function cacheSet(key: string, url: string) {
  cache.set(key, url)
  if (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) {
      const old = cache.get(oldest)
      if (old) URL.revokeObjectURL(old)
      cache.delete(oldest)
    }
  }
}

// --- shared, unlock-able <audio> element (mobile autoplay) -------------
let sharedAudio: HTMLAudioElement | null = null
let unlocked = false

function getAudio(): HTMLAudioElement {
  if (!sharedAudio) sharedAudio = new Audio()
  return sharedAudio
}

const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='

/** Call from a real user gesture once so later programmatic plays work on iOS. */
export function unlockNeuralAudio(): void {
  if (unlocked) return
  const a = getAudio()
  a.src = SILENT_WAV
  a.play()
    .then(() => {
      a.pause()
      a.currentTime = 0
      unlocked = true
    })
    .catch(() => {
      /* will retry on next gesture */
    })
}

// --- PCM → WAV ---------------------------------------------------------
function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function pcmToWav(pcm: Uint8Array, sampleRate: number): Blob {
  const header = new ArrayBuffer(44)
  const view = new DataView(header)
  const writeStr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i))
  }
  const dataLen = pcm.length
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataLen, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, dataLen, true)
  return new Blob([header, pcm as BlobPart], { type: 'audio/wav' })
}

async function fetchTts(
  text: string,
  settings: AiSettings,
  style: TtsStyle,
): Promise<string> {
  const voice = settings.geminiVoiceName || DEFAULT_VOICE
  const key = `${voice}|${style}|${text}`
  const cached = cacheGet(key)
  if (cached) return cached

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${settings.geminiApiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: stylePrefix(style) + text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
        },
      },
    }),
  })
  if (!res.ok) throw new Error(`TTS ${res.status}`)
  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> }
    }>
  }
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData
  if (!part?.data) throw new Error('no audio')
  const rateMatch = /rate=(\d+)/.exec(part.mimeType ?? '')
  const rate = rateMatch ? Number(rateMatch[1]) : DEFAULT_RATE
  const objUrl = URL.createObjectURL(pcmToWav(base64ToBytes(part.data), rate))
  cacheSet(key, objUrl)
  return objUrl
}

// --- playback ----------------------------------------------------------
let stopFlag = false
let settleCurrent: (() => void) | null = null

/**
 * Play one audio URL. Resolves when it finishes (or is stopped), REJECTS if
 * the audio can't load/play — so callers fall back to the system voice
 * instead of going silent.
 */
function playUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const a = getAudio()
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      a.onended = null
      a.onerror = null
      settleCurrent = null
      if (ok) resolve()
      else reject(new Error('audio failed'))
    }
    settleCurrent = () => finish(true) // intentional stop = not a failure
    a.onended = () => finish(true)
    a.onerror = () => finish(false)
    a.src = url
    a.play().catch(() => finish(false))
  })
}

/** Speak one short piece of text. Rejects if the request fails (caller falls back). */
export async function neuralSpeak(
  text: string,
  settings: AiSettings,
  style: TtsStyle = 'warm',
): Promise<void> {
  stopFlag = false
  const url = await getAudioUrl(text, settings, style)
  if (stopFlag) return
  await playUrl(url)
}

/** Speak a list of sentences in order, prefetching the next while one plays. */
export async function neuralSpeakSequence(
  texts: string[],
  settings: AiSettings,
  style: TtsStyle = 'normal',
): Promise<void> {
  stopFlag = false
  let nextUrl: Promise<string> | null = texts.length
    ? getAudioUrl(texts[0], settings, style)
    : null
  for (let i = 0; i < texts.length; i++) {
    if (stopFlag || !nextUrl) return
    let url: string
    try {
      url = await nextUrl
    } catch {
      throw new Error('TTS sequence failed')
    }
    nextUrl =
      i + 1 < texts.length
        ? (getAudioUrl(texts[i + 1], settings, style).catch(() => '') as Promise<string>)
        : null
    if (stopFlag) return
    await playUrl(url)
  }
}

export function neuralStop(): void {
  stopFlag = true
  if (settleCurrent) settleCurrent()
  if (sharedAudio) {
    sharedAudio.pause()
    try {
      sharedAudio.currentTime = 0
    } catch {
      /* ignore */
    }
  }
}
