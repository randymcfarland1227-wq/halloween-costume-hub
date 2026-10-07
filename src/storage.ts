import type { AppData, Costume } from './types'
import { createSeedCostumes } from './seed'

export const STORAGE_KEY = 'halloween-costume-hub-v1'

const emptyData = (): AppData => ({
  version: 1,
  costumes: [],
  seedDismissed: false,
})

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as AppData
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.costumes)) {
      return emptyData()
    }
    return {
      version: 1,
      costumes: parsed.costumes,
      seedDismissed: Boolean(parsed.seedDismissed),
    }
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getDisplayCostumes(data: AppData): Costume[] {
  if (data.costumes.length > 0) return data.costumes
  if (!data.seedDismissed) return createSeedCostumes()
  return []
}

export function isShowingSeed(data: AppData): boolean {
  return data.costumes.length === 0 && !data.seedDismissed
}

export function exportJson(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

export function parseImportJson(raw: string): AppData {
  const parsed = JSON.parse(raw) as AppData
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.costumes)) {
    throw new Error('Invalid Costume Hub backup file')
  }
  return {
    version: 1,
    costumes: parsed.costumes,
    seedDismissed: Boolean(parsed.seedDismissed),
  }
}
