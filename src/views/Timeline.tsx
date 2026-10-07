import { useState } from 'react'
import type { Costume, Task } from '../lib/types'
import { useStore } from '../lib/store'
import { addDays, daysUntil, fmtDay, relDay, todayStr } from '../lib/util'
import { TaskEditor } from '../components/TaskEditor'

export function milestones(c: Costume) {
  const E = c.eventDate
  return [
    { off: -21, title: 'Lock the concept', body: 'Moodboard done, palette chosen, signature pieces named.' },
    { off: -14, title: 'Order online buys by', body: 'Shipping buffer for anything not local.' },
    { off: -10, title: 'Finish shopping', body: 'Thrift + craft-store runs complete.' },
    { off: -5, title: 'Build by', body: 'Props and handmade pieces finished.' },
    { off: -3, title: 'Test fit', body: 'Full wear test: sit, walk, dance, bathroom check.' },
    { off: -1, title: 'Makeup trial + pack', body: 'Run the face once. Pack repair kit.' },
    { off: 0, title: c.eventName || 'Event', body: 'Go haunt something.' },
  ].map((m) => ({ ...m, date: addDays(E, m.off) }))
}

export function Timeline({ c, onToast }: { c: Costume; onToast: (m: string) => void }) {
  const { update } = useStore()
  const [edit, setEdit] = useState<Task | null>(null)
  const today = todayStr()
  const ms = milestones(c)
  type Row = { date: string; kind: 'm'; m: (typeof ms)[number] } | { date: string; kind: 't'; t: Task }
  const rows: Row[] = [
    ...ms.map((m) => ({ date: m.date, kind: 'm' as const, m })),
    ...c.tasks.filter((t) => t.due).map((t) => ({ date: t.due!, kind: 't' as const, t })),
  ].sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'm' ? -1 : 1))
  const undated = c.tasks.filter((t) => !t.due && t.column !== 'done')
  const overdue = c.tasks.filter((t) => t.due && t.due < today && t.column !== 'done')

  const autoPlan = () => {
    const pick = (t: Task) => {
      let d = addDays(c.eventDate, t.kind === 'buy' ? (t.link ? -14 : -10) : t.priority === 'high' ? -7 : -5)
      if (d < today) d = addDays(today, t.priority === 'high' ? 1 : 3)
      return d > c.eventDate ? c.eventDate : d
    }
    update(c.id, (x) => ({ ...x, tasks: x.tasks.map((t) => (!t.due && t.column !== 'done' ? { ...t, due: pick(t) } : t)) }))
    onToast(`Scheduled ${undated.length} task${undated.length === 1 ? '' : 's'} backwards from ${fmtDay(c.eventDate)}`)
  }

  let todayPlaced = false
  return (
    <div className="tl-wrap">
      <div className="tl-summary">
        <div className="pill-stat"><b>{daysUntil(c.eventDate)}</b><small>days to {c.eventName || 'event'}</small></div>
        <div className={`pill-stat ${overdue.length ? 'bad' : ''}`}><b>{overdue.length}</b><small>overdue</small></div>
        <div className="pill-stat"><b>{undated.length}</b><small>unscheduled</small></div>
        {undated.length > 0 && <button className="btn primary" onClick={autoPlan}>⟲ Suggest a backwards plan</button>}
      </div>
      <ol className="timeline">
        {rows.map((r, i) => {
          const past = r.date < today
          const marker = !todayPlaced && r.date >= today ? (todayPlaced = true) : false
          return (
            <li key={i} className="tl-li">
              {marker && <div className="tl-today"><span>Today · {fmtDay(today)}</span></div>}
              {r.kind === 'm' ? (
                <div className={`tl-item ms ${past ? 'past' : ''} ${r.m.off === 0 ? 'event' : ''}`}>
                  <div className="tl-date">{fmtDay(r.date)}<small>{relDay(r.date)}</small></div>
                  <div className="tl-dot" />
                  <div className="tl-body"><h4>{r.m.title}</h4><p>{r.m.body}</p></div>
                </div>
              ) : (
                <div className={`tl-item task-row ${r.t.column === 'done' ? 'done' : past ? 'late' : ''}`} onClick={() => setEdit(r.t)} role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setEdit(r.t)}>
                  <div className="tl-date">{fmtDay(r.date)}<small>{r.t.column === 'done' ? 'done ✓' : past ? 'overdue' : relDay(r.date)}</small></div>
                  <div className="tl-dot" />
                  <div className="tl-body"><h4><span className={`kind k-${r.t.kind}`}>{r.t.kind}</span> {r.t.title}</h4></div>
                </div>
              )}
            </li>
          )
        })}
        {!todayPlaced && <li className="tl-li"><div className="tl-today"><span>Today · {fmtDay(today)}</span></div></li>}
      </ol>
      {edit && <TaskEditor task={edit} onClose={() => setEdit(null)}
        onSave={(t) => update(c.id, (x) => ({ ...x, tasks: x.tasks.map((y) => (y.id === t.id ? t : y)) }))}
        onDelete={() => update(c.id, (x) => ({ ...x, tasks: x.tasks.filter((y) => y.id !== edit.id) }))} />}
    </div>
  )
}
