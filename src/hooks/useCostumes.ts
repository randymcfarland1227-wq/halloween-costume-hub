import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type {
  AppData,
  Costume,
  CostumeItem,
  CostumeStatus,
  Inspiration,
  ItemType,
} from '../types'
import {
  exportJson,
  getDisplayCostumes,
  isShowingSeed,
  loadData,
  parseImportJson,
  saveData,
} from '../storage'
import { createSeedCostumes } from '../seed'

function touch(c: Costume): Costume {
  return { ...c, updatedAt: new Date().toISOString() }
}

export function useCostumes() {
  const [data, setData] = useState<AppData>(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  const showingSeed = isShowingSeed(data)
  const costumes = useMemo(() => getDisplayCostumes(data), [data])

  const persistCostumes = useCallback((next: Costume[]) => {
    setData((prev) => ({
      ...prev,
      costumes: next,
      seedDismissed: true,
    }))
  }, [])

  const ensureReal = useCallback((): Costume[] => {
    if (data.costumes.length > 0) return data.costumes
    if (!data.seedDismissed) return createSeedCostumes()
    return []
  }, [data])

  const dismissSeed = useCallback(() => {
    setData((prev) => ({ ...prev, seedDismissed: true, costumes: [] }))
  }, [])

  const keepSeed = useCallback(() => {
    setData({
      version: 1,
      costumes: createSeedCostumes(),
      seedDismissed: true,
    })
  }, [])

  const addCostume = useCallback(
    (name: string): string => {
      const base = ensureReal()
      const id = uuid()
      const t = new Date().toISOString()
      const costume: Costume = {
        id,
        name: name.trim() || 'Untitled costume',
        status: 'idea',
        ideas: '',
        inspiration: [],
        items: [],
        createdAt: t,
        updatedAt: t,
      }
      persistCostumes([costume, ...base])
      return id
    },
    [ensureReal, persistCostumes],
  )

  const updateCostume = useCallback(
    (id: string, patch: Partial<Pick<Costume, 'name' | 'status' | 'ideas'>>) => {
      const base = ensureReal()
      persistCostumes(
        base.map((c) => (c.id === id ? touch({ ...c, ...patch }) : c)),
      )
    },
    [ensureReal, persistCostumes],
  )

  const deleteCostume = useCallback(
    (id: string) => {
      const base = ensureReal()
      persistCostumes(base.filter((c) => c.id !== id))
    },
    [ensureReal, persistCostumes],
  )

  const getCostume = useCallback(
    (id: string): Costume | undefined => costumes.find((c) => c.id === id),
    [costumes],
  )

  const addInspiration = useCallback(
    (
      costumeId: string,
      entry: Omit<Inspiration, 'id' | 'createdAt'>,
    ) => {
      const base = ensureReal()
      persistCostumes(
        base.map((c) => {
          if (c.id !== costumeId) return c
          const item: Inspiration = {
            ...entry,
            id: uuid(),
            createdAt: new Date().toISOString(),
          }
          return touch({ ...c, inspiration: [item, ...c.inspiration] })
        }),
      )
    },
    [ensureReal, persistCostumes],
  )

  const deleteInspiration = useCallback(
    (costumeId: string, inspirationId: string) => {
      const base = ensureReal()
      persistCostumes(
        base.map((c) =>
          c.id === costumeId
            ? touch({
                ...c,
                inspiration: c.inspiration.filter((i) => i.id !== inspirationId),
              })
            : c,
        ),
      )
    },
    [ensureReal, persistCostumes],
  )

  const addItem = useCallback(
    (
      costumeId: string,
      entry: { label: string; type: ItemType; notes?: string },
    ) => {
      const base = ensureReal()
      persistCostumes(
        base.map((c) => {
          if (c.id !== costumeId) return c
          const item: CostumeItem = {
            id: uuid(),
            label: entry.label.trim(),
            type: entry.type,
            notes: entry.notes?.trim() || undefined,
            done: false,
            createdAt: new Date().toISOString(),
          }
          return touch({ ...c, items: [...c.items, item] })
        }),
      )
    },
    [ensureReal, persistCostumes],
  )

  const updateItem = useCallback(
    (
      costumeId: string,
      itemId: string,
      patch: Partial<Pick<CostumeItem, 'label' | 'type' | 'notes' | 'done'>>,
    ) => {
      const base = ensureReal()
      persistCostumes(
        base.map((c) => {
          if (c.id !== costumeId) return c
          return touch({
            ...c,
            items: c.items.map((i) =>
              i.id === itemId ? { ...i, ...patch } : i,
            ),
          })
        }),
      )
    },
    [ensureReal, persistCostumes],
  )

  const deleteItem = useCallback(
    (costumeId: string, itemId: string) => {
      const base = ensureReal()
      persistCostumes(
        base.map((c) =>
          c.id === costumeId
            ? touch({
                ...c,
                items: c.items.filter((i) => i.id !== itemId),
              })
            : c,
        ),
      )
    },
    [ensureReal, persistCostumes],
  )

  const exportBackup = useCallback(() => {
    const payload = showingSeed
      ? { version: 1 as const, costumes: costumes, seedDismissed: true }
      : data
    return exportJson(payload)
  }, [data, costumes, showingSeed])

  const importBackup = useCallback((raw: string) => {
    const parsed = parseImportJson(raw)
    setData(parsed)
  }, [])

  return {
    data,
    costumes,
    showingSeed,
    dismissSeed,
    keepSeed,
    addCostume,
    updateCostume,
    deleteCostume,
    getCostume,
    addInspiration,
    deleteInspiration,
    addItem,
    updateItem,
    deleteItem,
    exportBackup,
    importBackup,
  }
}

export type CostumesApi = ReturnType<typeof useCostumes>

export function itemProgress(c: Costume): { done: number; total: number } {
  const total = c.items.length
  const done = c.items.filter((i) => i.done).length
  return { done, total }
}

export function statusClass(status: CostumeStatus): string {
  return `status-${status}`
}
