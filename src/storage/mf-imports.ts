import type { SubtitleCue } from '../utils/srt-parser'

export interface ImportedEpisode {
  episodeId: string
  season: number
  episode: number
  title: string
  titleZh: string
  importedAt: number
  cues: SubtitleCue[]
  /** 主背景剧照 base64 或 blob url */
  backdropImage?: string
  /** 多张剧照按台词进度分布 */
  stillImages: string[]
}

const DB_NAME = 'english-training-mf'
const STORE = 'episodes'
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'episodeId' })
      }
    }
  })
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const mfStorage = {
  async save(episode: ImportedEpisode): Promise<void> {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(episode)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async get(episodeId: string): Promise<ImportedEpisode | undefined> {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(episodeId)
      req.onsuccess = () => resolve(req.result as ImportedEpisode | undefined)
      req.onerror = () => reject(req.error)
    })
  },

  async has(episodeId: string): Promise<boolean> {
    const ep = await this.get(episodeId)
    return !!ep && ep.cues.length > 0
  },

  async remove(episodeId: string): Promise<void> {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(episodeId)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async listIds(): Promise<string[]> {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).getAllKeys()
      req.onsuccess = () => resolve(req.result as string[])
      req.onerror = () => reject(req.error)
    })
  },

  readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsText(file, 'UTF-8')
    })
  },

  filesToDataUrls(files: FileList | File[]): Promise<string[]> {
    return Promise.all(Array.from(files).map((f) => fileToDataUrl(f)))
  },
}

/** 将多张剧照均匀映射到台词索引 */
export function stillForCueIndex(cueIndex: number, totalCues: number, stills: string[]): string | undefined {
  if (stills.length === 0) return undefined
  if (stills.length === 1) return stills[0]
  const ratio = totalCues > 1 ? cueIndex / (totalCues - 1) : 0
  const idx = Math.min(Math.floor(ratio * stills.length), stills.length - 1)
  return stills[idx]
}
