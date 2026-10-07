export type Status = 'idea' | 'planning' | 'shopping' | 'making' | 'ready'
export type Column = 'todo' | 'doing' | 'done'
export type Priority = 'low' | 'med' | 'high'
export type TaskKind = 'buy' | 'make'

export interface Task {
  id: string
  title: string
  kind: TaskKind
  column: Column
  priority: Priority
  due?: string
  est?: number
  actual?: number
  link?: string
  notes?: string
  createdAt: string
}

export type ElKind = 'image' | 'note' | 'swatch'
export interface CanvasEl {
  id: string
  kind: ElKind
  x: number
  y: number
  w: number
  h: number
  z: number
  src?: string // url or idb:<id>
  text?: string
  color?: string
  group?: string
}

export interface Costume {
  id: string
  name: string
  status: Status
  eventName: string
  eventDate: string // yyyy-mm-dd
  budget: number
  palette: string[]
  coverSrc?: string
  elements: CanvasEl[]
  tasks: Task[]
  brainstorm: Record<string, string>
  demo?: boolean
  createdAt: string
  updatedAt: string
}

export interface AppState {
  version: 2
  costumes: Costume[]
}

export const STATUS_LABELS: Record<Status, string> = {
  idea: 'Idea', planning: 'Planning', shopping: 'Shopping', making: 'Making', ready: 'Ready',
}
export const STATUSES: Status[] = ['idea', 'planning', 'shopping', 'making', 'ready']
export const COLUMNS: { id: Column; label: string }[] = [
  { id: 'todo', label: 'To do' }, { id: 'doing', label: 'In progress' }, { id: 'done', label: 'Done' },
]
