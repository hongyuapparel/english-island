import { storage } from '../storage'
import {
  neuralSpeak,
  neuralSpeakSequence,
  neuralStop,
  useNeuralVoice,
  type TtsStyle,
} from './neural-tts'

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isSpeechSupported(): boolean {
  return getRecognitionCtor() !== null && 'speechSynthesis' in window
}

export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window
}

export class VoiceHelper {
  private recognition: SpeechRecognitionInstance | null = null
  private listening = false

  get isListening() {
    return this.listening
  }

  startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (msg: string) => void,
    lang = 'zh-CN',
  ): boolean {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      onError('你的浏览器不支持语音识别，请用 Chrome 或 Edge')
      return false
    }

    this.stopListening()
    this.recognition = new Ctor()
    this.recognition.lang = lang
    this.recognition.interimResults = true
    this.recognition.continuous = false

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      onResult(final || interim, !!final)
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted') {
        onError(
          event.error === 'not-allowed'
            ? '请允许麦克风权限'
            : `语音识别错误: ${event.error}`,
        )
      }
      this.listening = false
    }

    this.recognition.onend = () => {
      this.listening = false
    }

    this.recognition.start()
    this.listening = true
    return true
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.abort()
      } catch {
        /* ignore */
      }
      this.recognition = null
    }
    this.listening = false
  }

  speak(text: string, lang = 'en-US', rate = 0.9): void {
    this.stopSpeaking()
    const clean = cleanForSpeech(text)
    if (!clean) return

    const settings = storage.getAiSettings()
    // Use the warm neural voice for English when a key is set; otherwise
    // fall back to the system voice (and also on any neural failure).
    if (lang.startsWith('en') && useNeuralVoice(settings)) {
      const style: TtsStyle = rate < 0.85 ? 'slow' : 'warm'
      neuralSpeak(clean, settings, style).catch(() => browserSpeak(clean, lang, rate))
      return
    }
    browserSpeak(clean, lang, rate)
  }

  /** Read a long passage; neural reads it expressively sentence by sentence. */
  speakLong(text: string, rate = 0.95, lang = 'en-US'): void {
    this.stopSpeaking()
    const clean = text.replace(/\s+/g, ' ').trim()
    if (!clean) return
    const chunks = (clean.match(/[^.!?]+[.!?]*/g) ?? [clean])
      .map((c) => c.trim())
      .filter(Boolean)

    const settings = storage.getAiSettings()
    if (lang.startsWith('en') && useNeuralVoice(settings)) {
      const style: TtsStyle = rate < 0.85 ? 'slow' : 'normal'
      neuralSpeakSequence(chunks, settings, style).catch(() => browserSpeakChunks(chunks, lang, rate))
      return
    }
    browserSpeakChunks(chunks, lang, rate)
  }

  /** Like speak(), but resolves when the speech finishes (for hands-free mode). */
  speakAwait(text: string, lang = 'en-US', rate = 0.95): Promise<void> {
    this.stopSpeaking()
    const clean = cleanForSpeech(text)
    if (!clean) return Promise.resolve()
    const settings = storage.getAiSettings()
    if (lang.startsWith('en') && useNeuralVoice(settings)) {
      const style: TtsStyle = rate < 0.85 ? 'slow' : 'warm'
      return neuralSpeak(clean, settings, style).catch(() => browserSpeakAwait(clean, lang, rate))
    }
    return browserSpeakAwait(clean, lang, rate)
  }

  stopSpeaking() {
    speechSynthesis.cancel()
    neuralStop()
  }
}

function browserSpeakAwait(clean: string, lang: string, rate: number): Promise<void> {
  return new Promise((resolve) => {
    void speakChunks(splitForSpeech(clean), lang, rate, resolve)
  })
}

function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/💡 Tips[\s\S]*/i, '')
    .replace(/⚠️[\s\S]*/g, '')
    .trim()
}

// A brighter pitch makes the local voice sound warmer and more cheerful.
const VOICE_PITCH = 1.16

// iOS Safari returns an empty voice list until they load asynchronously; if we
// speak before then, nothing is heard. Resolve once voices are available.
let voicesReadyP: Promise<void> | null = null
function ensureVoices(): Promise<void> {
  if (voicesReadyP) return voicesReadyP
  voicesReadyP = new Promise((resolve) => {
    if (speechSynthesis.getVoices().length) return resolve()
    let settled = false
    const done = () => {
      if (!settled) {
        settled = true
        resolve()
      }
    }
    try {
      speechSynthesis.addEventListener('voiceschanged', done, { once: true })
    } catch {
      /* older browsers */
    }
    let n = 0
    const iv = setInterval(() => {
      if (speechSynthesis.getVoices().length || n++ > 25) {
        clearInterval(iv)
        done()
      }
    }, 100)
  })
  return voicesReadyP
}

/** Pick the warmest female English voice available (prefer enhanced en-US). */
function pickBrowserVoice(lang: string): SpeechSynthesisVoice | undefined {
  const code = lang.slice(0, 2).toLowerCase()
  const all = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith(code))
  if (!all.length) return undefined
  const us = all.filter((v) => /en[-_]us/i.test(v.lang))
  const pool = us.length ? us : all
  const female =
    /samantha|ava|allison|susan|zoe|nicky|joelle|karen|moira|tessa|fiona|serena|female|woman|girl/i
  const rich = /enhanced|premium|neural|natural|siri/i
  return (
    pool.find((v) => female.test(v.name) && rich.test(v.name)) ??
    pool.find((v) => rich.test(v.name)) ??
    pool.find((v) => female.test(v.name)) ??
    pool.find((v) => /google/i.test(v.name)) ??
    pool.find((v) => v.localService) ??
    pool[0]
  )
}

function splitForSpeech(clean: string): string[] {
  return (clean.match(/[^.!?]+[.!?]*/g) ?? [clean]).map((c) => c.trim()).filter(Boolean)
}

/** Speak sentence-by-sentence, chained via onend (reliable on iOS Safari). */
async function speakChunks(
  chunks: string[],
  lang: string,
  rate: number,
  onDone?: () => void,
): Promise<void> {
  await ensureVoices()
  // A short gap after a cancel() — iOS Safari silently drops a speak() that
  // fires too soon after cancelling the previous utterance.
  await new Promise((r) => setTimeout(r, 60))
  const voice = pickBrowserVoice(lang)
  let i = 0
  const next = () => {
    if (i >= chunks.length) {
      onDone?.()
      return
    }
    const u = new SpeechSynthesisUtterance(chunks[i++])
    u.lang = lang
    u.rate = rate
    u.pitch = VOICE_PITCH
    u.volume = 1
    if (voice) u.voice = voice
    u.onend = next
    u.onerror = next
    speechSynthesis.speak(u)
  }
  next()
}

function browserSpeak(clean: string, lang: string, rate: number): void {
  void speakChunks(splitForSpeech(clean), lang, rate)
}

function browserSpeakChunks(chunks: string[], lang: string, rate: number): void {
  void speakChunks(chunks, lang, rate)
}
