import { useState } from 'react'
import type { Task } from '../lib/types'
import { COLUMNS } from '../lib/types'
import { num } from '../lib/util'
import { Modal } from './ui'

export function TaskEditor({ task, onSave, onDelete, onClose }: {
  task: Task; onSave: (t: Task) => void; onDelete?: () => void; onClose: () => void
}) {
  const [t, setT] = useState(task)
  const set = (p: Partial<Task>) => setT((x) => ({ ...x, ...p }))
  return (
    <Modal title={onDelete ? 'Edit task' : 'New task'} onClose={onClose}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); if (t.title.trim()) { onSave({ ...t, title: t.title.trim() }); onClose() } }}>
        <label className="f full"><span>Task</span>
          <input autoFocus value={t.title} onChange={(e) => set({ title: e.target.value })} placeholder="Velvet cape, LED crown…" required /></label>
        <div className="seg full" role="radiogroup" aria-label="Type">
          {(['buy', 'make'] as const).map((k) => (
            <button type="button" key={k} className={t.kind === k ? 'on' : ''} onClick={() => set({ kind: k })}>{k === 'buy' ? '🛒 Buy' : '🧵 Make'}</button>
          ))}
        </div>
        <label className="f"><span>Column</span>
          <select value={t.column} onChange={(e) => set({ column: e.target.value as Task['column'] })}>
            {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select></label>
        <label className="f"><span>Priority</span>
          <select value={t.priority} onChange={(e) => set({ priority: e.target.value as Task['priority'] })}>
            <option value="high">High</option><option value="med">Medium</option><option value="low">Low</option>
          </select></label>
        <label className="f"><span>Due</span><input type="date" value={t.due ?? ''} onChange={(e) => set({ due: e.target.value || undefined })} /></label>
        <label className="f"><span>Est. cost ($)</span><input inputMode="decimal" value={t.est ?? ''} onChange={(e) => set({ est: num(e.target.value) })} placeholder="0" /></label>
        <label className="f"><span>Actual cost ($)</span><input inputMode="decimal" value={t.actual ?? ''} onChange={(e) => set({ actual: num(e.target.value) })} placeholder="0" /></label>
        <label className="f"><span>Where to buy (link)</span><input type="url" value={t.link ?? ''} onChange={(e) => set({ link: e.target.value || undefined })} placeholder="https://" /></label>
        <label className="f full"><span>Notes</span><textarea rows={3} value={t.notes ?? ''} onChange={(e) => set({ notes: e.target.value || undefined })} /></label>
        <div className="form-actions full">
          {onDelete && <button type="button" className="btn danger" onClick={() => { onDelete(); onClose() }}>Delete</button>}
          <span style={{ flex: 1 }} />
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary">Save task</button>
        </div>
      </form>
    </Modal>
  )
}
