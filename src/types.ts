export type CostumeStatus = 'idea' | 'planning' | 'shopping' | 'making' | 'ready'

export type ItemType = 'buy' | 'make'

export interface Inspiration {
  id: string
  title: string
  url?: string
  imageUrl?: string
  notes?: string
  createdAt: string
}

export interface CostumeItem {
  id: string
  label: string
  type: ItemType
  notes?: string
  done: boolean
  createdAt: string
}

export interface Costume {
  id: string
  name: string
  status: CostumeStatus
  ideas: string
  inspiration: Inspiration[]
  items: CostumeItem[]
  createdAt: string
  updatedAt: string
}

export interface AppData {
  version: 1
  costumes: Costume[]
  seedDismissed: boolean
}

export const STATUS_LABELS: Record<CostumeStatus, string> = {
  idea: 'Idea',
  planning: 'Planning',
  shopping: 'Shopping',
  making: 'Making',
  ready: 'Ready',
}

export const STATUS_ORDER: CostumeStatus[] = [
  'idea',
  'planning',
  'shopping',
  'making',
  'ready',
]
