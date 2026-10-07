import { useState } from 'react'
import type { Column, Costume, Task } from '../lib/types'
import { COLUMNS } from '../lib/types'
import { spend, useStore } from '../lib/store'
import { daysUntil, fmtDay, money, nowIso, num, uid } from '../lib/util'
import { TaskEditor } from '../components/TaskEditor'

export function BudgetBar({ c }: { c: Costume }) {
  const { update } = useStore()
  const s = spend(c)
  const pct = s.budget ? Math.min(1, s.actual / s.budget) : 0
  const over = s.budget > 0 && s.actual > s.budget
  return (
    <div className="budget">
      <label className="budget-in"><span>Budget</span>
        <span className="money-in">$<input inputMode="decimal" value={c.budget || ''} placeholder="0" onChange={(e) => update(c.id, (x) => ({ ...x, budget: num(e.target.value) ?? 0 }))} /></span></label>
      <div className="budget-stats">
        <div><small>Spent</small><b className={over ? 'bad' : ''}>{money(s.actual)}</b></div>
        <div><small>Estimated</small><b>{money(s.est)}</b></div>
        <div><small>{over ? 'Over by' : 'Left'}</small><b className={over ? 'bad' : 'good'}>{money(Math.abs(s.budget - s.actual))}</b></div>
      </div>
      <div className="bar"><span className={over ? 'over' : ''} style={{ width: `${pct * 100}%` }} />
        {s.budget > 0 && s.est > 0 && <i style={{ left: `${Math.min(100, (s.est / s.budget) * 100)}%` }} title="Estimated total" />}</div>
    </div>
  )
}

export function TaskCard({ t, onOpen, onDragStart }: { t: Task; onOpen: () => void; onDragStart?: (e: React.DragEvent) => void }) {
  const dd = t.due ? daysUntil(t.due) : null
  const overdue = dd !== null && dd < 0 && t.column !== 'done'
  return (
    <button className={`task pr-${t.priority} ${t.column === 'done' ? 'is-done' : ''} ${overdue ? 'overdue' : ''}`} draggable={!!onDragStart} onDragStart={onDragStart} onClick={onOpen}>
      <div className="task-top"><span className={`kind k-${t.kind}`}>{t.kind}</span><span className="pr" title={`${t.priority} priority`} /></div>
      <div className="task-title">{t.title}</div>
      <div className="task-meta">
        {t.due && <span className={overdue ? 'bad' : dd !== null && dd <= 3 ? 'warn' : ''}>📅 {fmtDay(t.due)}</span>}
        {(t.est || t.actual) ? <span>💰 {t.actual ? money(t.actual) : `~${money(t.est!)}`}</span> : null}
        {t.link && <a href={t.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>🔗 shop</a>}
      </div>
    </button>
  )
}

export function Board({ c }: { c: Costume }) {
  const { update } = useStore()
  const [edit, setEdit] = useState<{ task: Task; isNew: boolean } | null>(null)
  const [filter, setFilter] = useState<'all' | 'buy' | 'make'>('all')
  const [over, setOver] = useState<Column | null>(null)
  const [quick, setQuick] = useState<Record<string, string>>({})

  const save = (t: Task) => update(c.id, (x) => ({ ...x, tasks: x.tasks.some((y) => y.id === t.id) ? x.tasks.map((y) => (y.id === t.id ? t : y)) : [...x.tasks, t] }))
  const move = (id: string, col: Column) => update(c.id, (x) => ({ ...x, tasks: x.tasks.map((y) => (y.id === id ? { ...y, column: col } : y)) }))
  const blank = (col: Column, title = ''): Task => ({ id: uid(), title, kind: filter === 'make' ? 'make' : 'buy', column: col, priority: 'med', createdAt: nowIso() })
  const prio = { high: 0, med: 1, low: 2 }
  const shown = c.tasks.filter((t) => filter === 'all' || t.kind === filter)

  return (
    <div className="board-wrap">
      <BudgetBar c={c} />
      <div className="board-bar">
        <div className="seg">{(['all', 'buy', 'make'] as const).map((f) => <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'buy' ? '🛒 Buy' : '🧵 Make'}</button>)}</div>
        <button className="btn primary" onClick={() => setEdit({ task: blank('todo'), isNew: true })}>＋ New task</button>
      </div>
      <div className="board">
        {COLUMNS.map((col) => {
          const list = shown.filter((t) => t.column === col.id).sort((a, b) => prio[a.priority] - prio[b.priority] || (a.due ?? '9').localeCompare(b.due ?? '9'))
          return (
            <section key={col.id} className={`col col-${col.id} ${over === col.id ? 'over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setOver(col.id) }} onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('task'); if (id) move(id, col.id) }}>
              <header><h3>{col.label}</h3><span className="count">{list.length}</span></header>
              <div className="col-list">
                {list.map((t) => <TaskCard key={t.id} t={t} onOpen={() => setEdit({ task: t, isNew: false })} onDragStart={(e) => e.dataTransfer.setData('task', t.id)} />)}
                {list.length === 0 && <div className="col-empty">{col.id === 'done' ? 'Nothing finished yet. The night is young.' : col.id === 'doing' ? 'Drag a task here when you start it.' : 'All clear. Suspicious.'}</div>}
              </div>
              <form className="quick" onSubmit={(e) => { e.preventDefault(); const v = quick[col.id]?.trim(); if (v) { save(blank(col.id, v)); setQuick((q) => ({ ...q, [col.id]: '' })) } }}>
                <input placeholder="＋ Quick add…" value={quick[col.id] ?? ''} onChange={(e) => setQuick((q) => ({ ...q, [col.id]: e.target.value }))} />
              </form>
            </section>
          )
        })}
      </div>
      <p className="hint">Drag cards between columns, or open one to change its column. On phones, tap a card to edit and move it.</p>
      {edit && <TaskEditor task={edit.task} onClose={() => setEdit(null)} onSave={save}
        onDelete={edit.isNew ? undefined : () => update(c.id, (x) => ({ ...x, tasks: x.tasks.filter((y) => y.id !== edit.task.id) }))} />}
    </div>
  )
}
