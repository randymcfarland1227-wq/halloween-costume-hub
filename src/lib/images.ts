import { useEffect, useState } from 'react'
import { uid } from './util'

const DB = 'halloween-costume-hub-images'
const STORE = 'images'
const cache = new Map<string, string>()
let dbp: Promise<IDBDatabase> | null = null

function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE)
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
  return dbp
}
function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) {
  return db().then((d) => new Promise<T>((res, rej) => {
    const req = fn(d.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => res(req.result)
    req.onerror = () => rej(req.error)
  }))
}

export async function putImage(data: string, id = uid()) {
  await tx('readwrite', (s) => s.put(data, id)); cache.set(id, data); return `idb:${id}`
}
export async function getImage(id: string) {
  if (cache.has(id)) return cache.get(id)!
  const v = await tx<string | undefined>('readonly', (s) => s.get(id))
  if (v) cache.set(id, v)
  return v
}
export async function deleteImage(src?: string) {
  if (!src?.startsWith('idb:')) return
  const id = src.slice(4); cache.delete(id); await tx('readwrite', (s) => s.delete(id))
}
export async function allImages(): Promise<Record<string, string>> {
  const d = await db()
  return new Promise((res, rej) => {
    const out: Record<string, string> = {}
    const req = d.transaction(STORE).objectStore(STORE).openCursor()
    req.onsuccess = () => {
      const c = req.result
      if (c) { out[String(c.key)] = c.value as string; c.continue() } else res(out)
    }
    req.onerror = () => rej(req.error)
  })
}

export async function compress(file: Blob, max = 1400, q = 0.82): Promise<{ data: string; w: number; h: number }> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url
    })
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s)
    const c = document.createElement('canvas'); c.width = w; c.height = h
    c.getContext('2d')!.drawImage(img, 0, 0, w, h)
    return { data: c.toDataURL('image/webp', q), w, h }
  } finally { URL.revokeObjectURL(url) }
}

export function useImageSrc(src?: string) {
  const isIdb = !!src?.startsWith('idb:')
  const [v, setV] = useState<string | undefined>(() => (isIdb ? cache.get(src!.slice(4)) : src))
  useEffect(() => {
    if (!src) { setV(undefined); return }
    if (!isIdb) { setV(src); return }
    let alive = true
    getImage(src.slice(4)).then((d) => alive && setV(d)).catch(() => {})
    return () => { alive = false }
  }, [src, isIdb])
  return v
}
