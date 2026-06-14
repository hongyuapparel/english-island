// A microphone "call session": opens one mic stream + AudioContext for the
// whole conversation (so iOS keeps it alive across turns), and records one
// spoken utterance at a time, auto-stopping after a short silence (VAD).
export class CallSession {
  private stream: MediaStream
  private ctx: AudioContext
  private analyser: AnalyserNode
  private stopped = false
  private endCurrent: (() => void) | null = null

  private constructor(stream: MediaStream, ctx: AudioContext, analyser: AnalyserNode) {
    this.stream = stream
    this.ctx = ctx
    this.analyser = analyser
  }

  static async start(): Promise<CallSession> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    await ctx.resume().catch(() => {})
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)
    return new CallSession(stream, ctx, analyser)
  }

  /** Record until ~silence after speech (or maxMs). Returns null if nothing was said. */
  recordUtterance(silenceMs = 1300, maxMs = 15000): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (this.stopped) return resolve(null)
      const pick = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
      const mime = pick.find((m) => {
        try {
          return MediaRecorder.isTypeSupported(m)
        } catch {
          return false
        }
      })
      let rec: MediaRecorder
      try {
        rec = mime ? new MediaRecorder(this.stream, { mimeType: mime }) : new MediaRecorder(this.stream)
      } catch {
        return resolve(null)
      }
      const chunks: Blob[] = []
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data)
      }
      let done = false
      let started = false
      let lastVoice = Date.now()
      const startedAt = Date.now()
      const buf = new Uint8Array(this.analyser.frequencyBinCount)

      const finish = () => {
        if (done) return
        done = true
        this.endCurrent = null
        try {
          if (rec.state !== 'inactive') rec.stop()
        } catch {
          /* ignore */
        }
      }
      this.endCurrent = finish
      rec.onstop = () => {
        resolve(started && chunks.length ? new Blob(chunks, { type: rec.mimeType || 'audio/webm' }) : null)
      }
      try {
        rec.start()
      } catch {
        return resolve(null)
      }

      const tick = () => {
        if (done) return
        this.analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const d = buf[i] - 128
          sum += d * d
        }
        const rms = Math.sqrt(sum / buf.length)
        const now = Date.now()
        if (rms > 4.5) {
          started = true
          lastVoice = now
        }
        if (this.stopped) return finish()
        if (started && now - lastVoice > silenceMs) return finish()
        if (now - startedAt > maxMs) return finish()
        if (!started && now - startedAt > 8000) return finish() // no speech at all
        requestAnimationFrame(tick)
      }
      tick()
    })
  }

  /** End the current utterance now (e.g. user tapped the mic). */
  stopCurrent(): void {
    this.endCurrent?.()
  }

  /** Close the mic + audio for good. */
  end(): void {
    this.stopped = true
    this.endCurrent?.()
    try {
      this.stream.getTracks().forEach((t) => t.stop())
    } catch {
      /* ignore */
    }
    try {
      this.ctx.close()
    } catch {
      /* ignore */
    }
  }
}
