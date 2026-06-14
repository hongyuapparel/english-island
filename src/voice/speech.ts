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
    const utter = new SpeechSynthesisUtterance(clean.slice(0, 500))
    utter.lang = lang
    utter.rate = rate
    utter.pitch = 1.05
    utter.volume = 1
    const v = pickBrowserVoice(lang)
    if (v) utter.voice = v
    utter.onend = () => resolve()
    utter.onerror = () => resolve()
    speechSynthesis.speak(utter)
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

/** Pick the most natural-sounding system voice available for a language. */
function pickBrowserVoice(lang: string): SpeechSynthesisVoice | undefined {
  const code = lang.slice(0, 2)
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith(code))
  if (!voices.length) return undefined
  const nice = /natural|neural|premium|enhanced|google|siri|samantha|karen|daniel|moira|aaron|allison/i
  return voices.find((v) => nice.test(v.name)) ?? voices.find((v) => v.localService) ?? voices[0]
}

function browserSpeak(clean: string, lang: string, rate: number): void {
  const utter = new SpeechSynthesisUtterance(clean.slice(0, 500))
  utter.lang = lang
  utter.rate = rate
  utter.pitch = 1.05
  utter.volume = 1
  const v = pickBrowserVoice(lang)
  if (v) utter.voice = v
  speechSynthesis.speak(utter)
}

function browserSpeakChunks(chunks: string[], lang: string, rate: number): void {
  // Chain via onend rather than queueing all at once — far more reliable on
  // iOS Safari, which often stalls when many utterances are queued together.
  const v = pickBrowserVoice(lang)
  let i = 0
  const speakNext = () => {
    if (i >= chunks.length) return
    const utter = new SpeechSynthesisUtterance(chunks[i++])
    utter.lang = lang
    utter.rate = rate
    utter.pitch = 1.05
    utter.volume = 1
    if (v) utter.voice = v
    utter.onend = speakNext
    speechSynthesis.speak(utter)
  }
  speakNext()
}
