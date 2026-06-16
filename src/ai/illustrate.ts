// Generate a content-matched pen-and-watercolor illustration for a passage.
// Uses Pollinations' FREE, key-less image service (same provider as the free
// text AI), so it works for everyone with no API key and no per-image cost.
// Results are cached in IndexedDB so each picture is only ever drawn once.
import { storage } from '../storage'
import { getCachedImage, putCachedImage } from '../storage/imagedb'

const STYLE_PROMPT =
  "children's storybook illustration in delicate pen-and-watercolor style, " +
  'loose hand-drawn ink outlines with soft muted watercolor washes, warm gentle ' +
  'fairytale palette, lots of soft white paper space, cosy and whimsical, ' +
  'no text, no words, no letters, no captions. '

function hash(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) | 0
  return h >>> 0
}

export function illustrationsEnabled(): boolean {
  return storage.getIllustrate()
}

function buildPrompt(sceneText: string, artNote?: string): string {
  const note = artNote ? artNote.trim() + ' ' : ''
  return STYLE_PROMPT + note + 'This page shows: ' + sceneText.replace(/\s+/g, ' ').trim().slice(0, 420)
}

function pollinationsUrl(prompt: string, bookKey: string): string {
  // Same book → same base seed, so the style/character stay coherent across pages.
  const seed = hash(bookKey) % 100000
  return (
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=768&height=576&nologo=true&model=flux&seed=${seed}`
  )
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = () => reject(new Error('read failed'))
    fr.readAsDataURL(blob)
  })
}

// Proactively generate + cache every story's pictures in the background, so by
// the time the reader opens a book its pages are already drawn (and instant on
// later visits). Runs once per session, gently (low concurrency).
export interface IlloItem {
  key: string
  text: string
  artNote?: string
  bookKey?: string
}

let warmed = false
export function warmIllustrations(items: IlloItem[]): void {
  if (warmed || !illustrationsEnabled()) return
  warmed = true
  let i = 0
  const worker = async () => {
    while (i < items.length) {
      const it = items[i++]
      try {
        await getIllustration(it.key, it.text, it.artNote, it.bookKey)
      } catch {
        /* ignore — the reader will retry on open */
      }
    }
  }
  void worker()
  void worker()
}

const inflight = new Map<string, Promise<string>>()

/** Cached illustration for one passage. `cacheKey` should be stable per slot. */
export async function getIllustration(
  cacheKey: string,
  sceneText: string,
  artNote?: string,
  bookKey?: string,
): Promise<string> {
  const prompt = buildPrompt(sceneText, artNote)
  const key = `poll2|${cacheKey}|${hash(prompt).toString(36)}`
  const cached = await getCachedImage(key)
  if (cached) return cached
  const existing = inflight.get(key)
  if (existing) return existing
  const job = (async () => {
    const url = pollinationsUrl(prompt, bookKey || cacheKey)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`image ${res.status}`)
      const dataUrl = await blobToDataUrl(await res.blob())
      await putCachedImage(key, dataUrl)
      return dataUrl
    } catch {
      // Couldn't cache (e.g. CORS) — show it directly from the URL anyway.
      return url
    }
  })()
  inflight.set(key, job)
  try {
    return await job
  } finally {
    inflight.delete(key)
  }
}
