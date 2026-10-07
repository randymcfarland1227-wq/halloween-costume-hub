import type { CostumeStatus } from '../types'
import { STATUS_LABELS } from '../types'

export function StatusBadge({ status }: { status: CostumeStatus }) {
  return (
    <span className={`badge status-${status}`}>{STATUS_LABELS[status]}</span>
  )
}
