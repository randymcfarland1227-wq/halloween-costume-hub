import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState, CanvasEl, Costume, Task } from './types'
import { seedCostumes } from './seed'
import { halloween, nowIso, uid } from './util'
import { allImages, putImage } from './images'

export const KEY = 'halloween-costume-hub-v2'
const V1 = 'halloween-costume-hub-v1'

/* eslint-disable @typescript-eslint/no-explicit-any */
function migrateV1(raw: any): Costume[] {
  const H = halloween()
  return (raw?.costumes ?? []).map((c: any): Costume => {
    const els: CanvasEl[] = []
    let x = 60, z = 1
    if (c.ideas?.trim()) els.push({ id: uid(), kind: 'note', x: 60, y: 40, w: 300, h: 200, z: z++, color: '#e8dfd0', text: c.ideas })
    for (const i of c.inspiration ?? []) {
      if (i.imageUrl) els.push({ id: uid(), kind: 'image', x: (x += 40) + 340, y: 60, w: 280, h: 280, z: z++, src: i.imageUrl })
      else els.push({ id: uid(), kind: 'note', x: (x += 40) + 340, y: 360, w: 240, h: 150, z: z++, color: '#f07a3a', text: [i.title, i.notes, i.url].filter(Boolean).join('\n') })
    }
    const tasks: Task[] = (c.items ?? []).map((i: any) => ({
      id: i.id ?? uid(), title: i.label, kind: i.type === 'make' ? 'make' : 'buy',
      column: i.done ? 'done' : 'todo', priority: 'med', notes: i.notes, createdAt: i.createdAt ?? nowIso(),
    }))
    return {
      id: c.id ?? uid(), name: c.name ?? 'Untitled', status: c.status ?? 'idea', eventName: 'Halloween night',
      eventDate: H, budget: 0, palette: ['#0b0a0f', '#3d1a2e', '#6b2d4a', '#e8dfd0', '#f07a3a'],
      elements: els, tasks, brainstorm: {}, createdAt: c.createdAt ?? nowIso(), updatedAt: nowIso(),
    }
  })
}

function load(): AppState {
  try {
    const v2 = localStorage.getItem(KEY)
    if (v2) { const p = JSON.parse(v2); if (p?.version === 2) return p }
    const v1 = localStorage.getItem(V1)
    if (v1) {
      const p = JSON.parse(v1)
      const migrated = migrateV1(p)
      if (migrated.length) return { version: 2, costumes: migrated }
      if (p?.seedDismissed) return { version: 2, costumes: [] }
    }
  } catch { /* fall through */ }
  return { version: 2, costumes: seedCostumes() }
}

export function newCostume(name = 'Untitled costume'): Costume {
  const t = nowIso()
  return {
    id: uid(), name, status: 'idea', eventName: 'Halloween night', eventDate: halloween(), budget: 100,
    palette: ['#0b0a0f', '#3d1a2e', '#6b2d4a', '#e8dfd0', '#f07a3a'], elements: [], tasks: [], brainstorm: {},
    createdAt: t, updatedAt: t,
  }
}

function useStoreImpl() {
  const [state, setState] = useState<AppState>(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) { console.warn('save failed', e) }
  }, [state])

  const update = useCallback((id: string, fn: (c: Costume) => Costume) => {
    setState((s) => ({ ...s, costumes: s.costumes.map((c) => (c.id === id ? { ...fn(c), updatedAt: nowIso() } : c)) }))
  }, [])
  const add = useCallback((c: Costume) => setState((s) => ({ ...s, costumes: [c, ...s.costumes] })), [])
  const remove = useCallback((id: string) => setState((s) => ({ ...s, costumes: s.costumes.filter((c) => c.id !== id) })), [])
  const clearDemos = useCallback(() => setState((s) => ({ ...s, costumes: s.costumes.filter((c) => !c.demo) })), [])
  const keepDemos = useCallback(() => setState((s) => ({ ...s, costumes: s.costumes.map((c) => ({ ...c, demo: false })) })), [])

  const exportJson = useCallback(async () => {
    const images = await allImages().catch(() => ({}))
    return JSON.stringify({ ...state, images }, null, 1)
  }, [state])
  const importJson = useCallback(async (raw: string) => {
    const p = JSON.parse(raw)
    let costumes: Costume[]
    if (p?.version === 2 && Array.isArray(p.costumes)) costumes = p.costumes
    else if (p?.version === 1) costumes = migrateV1(p)
    else throw new Error('Not a Costume Hub backup')
    for (const [id, data] of Object.entries(p.images ?? {})) await putImage(data as string, id)
    setState({ version: 2, costumes })
  }, [])

  return useMemo(() => ({ state, update, add, remove, clearDemos, keepDemos, exportJson, importJson }),
    [state, update, add, remove, clearDemos, keepDemos, exportJson, importJson])
}

type Store = ReturnType<typeof useStoreImpl>
const Ctx = createContext<Store | null>(null)
export function StoreProvider({ children }: { children: ReactNode }) {
  const s = useStoreImpl()
  return <Ctx.Provider value={s}>{children}</Ctx.Provider>
}
export function useStore() {
  const s = useContext(Ctx); if (!s) throw new Error('no store'); return s
}

export function progress(c: Costume) {
  const total = c.tasks.length, done = c.tasks.filter((t) => t.column === 'done').length
  return { done, total, pct: total ? done / total : 0 }
}
export function spend(c: Costume) {
  const est = c.tasks.reduce((a, t) => a + (t.est ?? 0), 0)
  const actual = c.tasks.reduce((a, t) => a + (t.actual ?? 0), 0)
  return { est, actual, budget: c.budget }
}
