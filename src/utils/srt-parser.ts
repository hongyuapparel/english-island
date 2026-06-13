export interface SubtitleCue {
  index: number
  startMs: number
  endMs: number
  text: string
  speaker?: string
}

function parseTime(ts: string): number {
  const m = ts.trim().match(/(?:(\d+):)?(\d{2}):(\d{2})[,.](\d{3})/)
  if (!m) return 0
  const h = m[1] ? parseInt(m[1], 10) : 0
  const min = parseInt(m[2], 10)
  const sec = parseInt(m[3], 10)
  const ms = parseInt(m[4], 10)
  return ((h * 60 + min) * 60 + sec) * 1000 + ms
}

function parseSpeaker(text: string): { speaker?: string; text: string } {
  const named = text.match(/^([A-Za-z][A-Za-z .'-]{0,30}):\s*(.+)$/)
  if (named) return { speaker: named[1].trim(), text: named[2].trim() }

  const bracket = text.match(/^\[([^\]]+)\]\s*(.+)$/)
  if (bracket) return { speaker: bracket[1].trim(), text: bracket[2].trim() }

  return { text: text.trim() }
}

/** Parse SRT subtitle file — preserves verbatim dialogue lines */
export function parseSrt(raw: string): SubtitleCue[] {
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  const blocks = normalized.split(/\n\n+/)
  const cues: SubtitleCue[] = []

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim())
    if (lines.length < 2) continue

    let i = 0
    if (/^\d+$/.test(lines[0].trim())) i = 1
    if (i >= lines.length) continue

    const timeLine = lines[i]
    const timeMatch = timeLine.match(
      /(\d{1,2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{3})/,
    )
    if (!timeMatch) continue

    const textLines = lines.slice(i + 1)
    const fullText = textLines
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\{\\an\d\}/g, '')
      .trim()
    if (!fullText) continue

    const { speaker, text } = parseSpeaker(fullText)
    cues.push({
      index: cues.length + 1,
      startMs: parseTime(timeMatch[1]),
      endMs: parseTime(timeMatch[2]),
      text,
      speaker,
    })
  }

  return cues
}

export function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function cueDurationMs(cue: SubtitleCue): number {
  return Math.max(cue.endMs - cue.startMs, 800)
}
