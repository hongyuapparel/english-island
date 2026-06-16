// Generate a content-matched pen-and-watercolor illustration for a passage,
// using the user's AIHubMix (OpenAI-compatible) image endpoint. Results are
// cached in IndexedDB so each picture is only ever drawn once.
import type { AiSettings } from '../types'
import { storage } from '../storage'
import { getCachedImage, putCachedImage } from '../storage/imagedb'

const STYLE_PROMPT =
  "A children's storybook illustration in delicate pen-and-watercolor style: " +
  'loose hand-drawn ink outlines with soft, muted watercolor washes, a warm gentle ' +
  'fairytale palette, plenty of soft white paper space, cosy and whimsical mood. ' +
  'Absolutely no text, no words, no letters, no captions, no signage anywhere. ' +
  'Single calm scene. Illustrate this moment: '

function hash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

export function illustrationsEnabled(settings: AiSettings): boolean {
  return !!settings.openaiApiKey && storage.getIllustrate()
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = () => reject(new Error('read failed'))
    fr.readAsDataURL(blob)
  })
}

async function generate(sceneText: string, settings: AiSettings): Promise<string> {
  const base = (settings.openaiBaseUrl || 'https://aihubmix.com/v1').replace(/\/$/, '')
  const model = settings.imageModel || 'dall-e-3'
  const prompt = STYLE_PROMPT + sceneText.replace(/\s+/g, ' ').trim().slice(0, 700)
  const res = await fetch(`${base}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.openaiApiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    }),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`配图失败 ${res.status}: ${t.slice(0, 120)}`)
  }
  const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> }
  const b64 = data.data?.[0]?.b64_json
  if (b64) return `data:image/png;base64,${b64}`
  const url = data.data?.[0]?.url
  if (url) {
    // Remote URLs expire — fetch and inline so the cache stays valid.
    try {
      const r = await fetch(url)
      return await blobToDataUrl(await r.blob())
    } catch {
      return url
    }
  }
  throw new Error('配图失败：无图片返回')
}

/** Cached illustration for one passage. `cacheKey` should be stable per slot. */
export async function getIllustration(
  cacheKey: string,
  sceneText: string,
  settings: AiSettings,
): Promise<string> {
  const model = settings.imageModel || 'dall-e-3'
  const key = `${model}|${cacheKey}|${hash(sceneText)}`
  const cached = await getCachedImage(key)
  if (cached) return cached
  const dataUrl = await generate(sceneText, settings)
  await putCachedImage(key, dataUrl)
  return dataUrl
}
