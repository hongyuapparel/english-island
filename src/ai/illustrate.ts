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
  'no text, no words, no letters, no captions. Scene: '

function hash(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) | 0
  return h >>> 0
}

export function illustrationsEnabled(): boolean {
  return storage.getIllustrate()
}

function pollinationsUrl(sceneText: string): string {
  const prompt = STYLE_PROMPT + sceneText.replace(/\s+/g, ' ').trim().slice(0, 480)
  const seed = hash(prompt) % 100000 // stable seed → same prompt returns same image
  return (
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=768&height=768&nologo=true&model=flux&seed=${seed}`
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

/** Cached illustration for one passage. `cacheKey` should be stable per slot. */
export async function getIllustration(cacheKey: string, sceneText: string): Promise<string> {
  const key = `poll|${cacheKey}|${hash(sceneText).toString(36)}`
  const cached = await getCachedImage(key)
  if (cached) return cached
  const url = pollinationsUrl(sceneText)
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
}
