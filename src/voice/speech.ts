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
    const clean = text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/💡 Tips[\s\S]*/i, '')
      .replace(/⚠️[\s\S]*/g, '')
      .trim()
    if (!clean) return

    const utter = new SpeechSynthesisUtterance(clean.slice(0, 500))
    utter.lang = lang
    utter.rate = rate
    const voices = speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith(lang.slice(0, 2)) && v.name.includes('Google'),
    ) ?? voices.find((v) => v.lang.startsWith(lang.slice(0, 2)))
    if (preferred) utter.voice = preferred
    speechSynthesis.speak(utter)
  }

  /** Read a long passage by queueing it sentence by sentence. */
  speakLong(text: string, rate = 0.95, lang = 'en-US'): void {
    this.stopSpeaking()
    const clean = text.replace(/\s+/g, ' ').trim()
    if (!clean) return
    const chunks = clean.match(/[^.!?]+[.!?]*/g) ?? [clean]
    const voices = speechSynthesis.getVoices()
    const preferred =
      voices.find((v) => v.lang.startsWith(lang.slice(0, 2)) && v.name.includes('Google')) ??
      voices.find((v) => v.lang.startsWith(lang.slice(0, 2)))
    for (const chunk of chunks) {
      const trimmed = chunk.trim()
      if (!trimmed) continue
      const utter = new SpeechSynthesisUtterance(trimmed)
      utter.lang = lang
      utter.rate = rate
      if (preferred) utter.voice = preferred
      speechSynthesis.speak(utter)
    }
  }

  stopSpeaking() {
    speechSynthesis.cancel()
  }
}
