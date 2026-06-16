// A tiny IndexedDB store for generated illustrations. Images are large
// (data URLs ~1–2MB each), so they can't live in localStorage — IndexedDB
// holds them so every picture is generated only once.
const DB_NAME = 'ei-images'
const STORE = 'img'

let dbPromise: Promise<IDBDatabase> | null = null

function db(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

export async function getCachedImage(key: string): Promise<string | null> {
  try {
    const d = await db()
    return await new Promise((resolve) => {
      const req = d.transaction(STORE, 'readonly').objectStore(STORE).get(key)
      req.onsuccess = () => resolve((req.result as string) ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function putCachedImage(key: string, dataUrl: string): Promise<void> {
  try {
    const d = await db()
    await new Promise<void>((resolve) => {
      const req = d.transaction(STORE, 'readwrite').objectStore(STORE).put(dataUrl, key)
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
    })
  } catch {
    /* ignore — illustration just won't be cached */
  }
}
