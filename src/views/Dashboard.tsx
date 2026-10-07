import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { newCostume, progress, spend, useStore } from '../lib/store'
import type { Status, Task } from '../lib/types'
import { STATUSES, STATUS_LABELS } from '../lib/types'
import { daysUntil, fmtDay, halloween, money, relDay, todayStr } from '../lib/util'
import { Badge, Countdown, Cover, Empty, Ring } from '../components/ui'

export function Dashboard() {
  const { state, add, clearDemos, keepDemos, exportJson, importJson } = useStore()
  const nav = useNavigate()
  const file = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState<'all' | Status>('all')
  const cs = state.costumes
  const today = todayStr()
  const weekOut = new Date(); weekOut.setDate(weekOut.getDate() + 7)
  const week = todayStr(weekOut)

  const all = cs.flatMap((c) => c.tasks.map((t) => ({ t, c })))
  const open = all.filter(({ t }) => t.column !== 'done')
  const dueSoon = open.filter(({ t }) => t.due && t.due <= week).sort((a, b) => a.t.due!.localeCompare(b.t.due!))
  const prio = { high: 0, med: 1, low: 2 }
  const next = [...open].sort((a, b) => (a.t.column === 'doing' ? -1 : 0) - (b.t.column === 'doing' ? -1 : 0) || prio[a.t.priority] - prio[b.t.priority] || (a.t.due ?? '9').localeCompare(b.t.due ?? '9')).slice(0, 5)
  const tot = cs.reduce((a, c) => { const s = spend(c); return { b: a.b + s.budget, s: a.s + s.actual, e: a.e + s.est } }, { b: 0, s: 0, e: 0 })
  const doneAll = all.length - open.length
  const hasDemo = cs.some((c) => c.demo)
  const shown = cs.filter((c) => filter === 'all' || c.status === filter)

  const create = () => { const c = newCostume(); add(c); nav(`/costume/${c.id}?tab=think`) }
  const doExport = async () => {
    const blob = new Blob([await exportJson()], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `costume-hub-${today}.json`; a.click(); URL.revokeObjectURL(a.href)
  }
  const TaskLine = ({ t, c }: { t: Task; c: (typeof cs)[number] }) => {
    const late = t.due && t.due < today
    return (
      <Link to={`/costume/${c.id}?tab=tasks`} className={`tline ${late ? 'late' : ''}`}>
        <span className={`kind k-${t.kind}`}>{t.kind}</span>
        <span className="tline-title">{t.title}<small>{c.name}</small></span>
        <span className="tline-due">{t.due ? (late ? `overdue · ${fmtDay(t.due)}` : relDay(t.due)) : t.column === 'doing' ? 'in progress' : ''}</span>
      </Link>
    )
  }

  return (
    <div className="dash fade-in">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Randy's costume studio</p>
          <h1>The night is coming.<br /><em>Dress for it.</em></h1>
          <div className="row">
            <button className="btn primary lg" onClick={create}>＋ New costume</button>
            <button className="btn ghost sm" onClick={doExport}>Export</button>
            <button className="btn ghost sm" onClick={() => file.current?.click()}>Import</button>
            <input ref={file} type="file" accept=".json,application/json" hidden onChange={async (e) => {
              const f = e.target.files?.[0]; e.target.value = ''
              if (f) try { await importJson(await f.text()) } catch { alert('That file isn\'t a Costume Hub backup.') }
            }} />
          </div>
        </div>
        <Countdown date={halloween()} label="until Halloween" big />
      </section>

      {hasDemo && (
        <div className="banner">
          <span><b>Demo costumes</b> are loaded so you can poke around.</span>
          <span className="row"><button className="btn sm" onClick={keepDemos}>Keep them</button><button className="btn ghost sm" onClick={clearDemos}>Clear demos</button></span>
        </div>
      )}

      <section className="stats">
        <div className="stat"><small>Costumes</small><b>{cs.length}</b><span>{cs.filter((c) => c.status === 'ready').length} ready</span></div>
        <div className="stat"><small>Tasks done</small><b>{doneAll}<em>/{all.length}</em></b><span>{open.length} open</span></div>
        <div className="stat"><small>Spent vs budget</small><b>{money(tot.s)}<em>/{money(tot.b)}</em></b>
          <div className="bar thin"><span className={tot.s > tot.b ? 'over' : ''} style={{ width: `${tot.b ? Math.min(100, (tot.s / tot.b) * 100) : 0}%` }} /></div></div>
        <div className="stat"><small>Due this week</small><b className={dueSoon.some(({ t }) => t.due! < today) ? 'bad' : ''}>{dueSoon.length}</b><span>{dueSoon.filter(({ t }) => t.due! < today).length} overdue</span></div>
      </section>

      <div className="dash-grid">
        <section className="dash-costumes">
          <div className="section-head">
            <h2>Wardrobe</h2>
            {cs.length > 1 && <div className="chips">
              <button className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>All</button>
              {STATUSES.map((s) => <button key={s} className={`chip ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>{STATUS_LABELS[s]}</button>)}
            </div>}
          </div>
          {cs.length === 0 ? (
            <Empty icon="🕯️" title="The wardrobe is empty" body="No costumes yet — just candlelight and ambition. Start one and we'll think it through together." action={<button className="btn primary" onClick={create}>Start your first costume</button>} />
          ) : (
            <div className="cards">
              {shown.map((c, i) => {
                const p = progress(c), d = daysUntil(c.eventDate), s = spend(c)
                return (
                  <Link key={c.id} to={`/costume/${c.id}`} className="ccard" style={{ animationDelay: `${i * 60}ms` }}>
                    <Cover c={c} />
                    <div className="ccard-body">
                      <div className="ccard-top"><Badge status={c.status} /><span className="muted small">{d >= 0 ? `${d}d · ${c.eventName}` : 'event passed'}</span></div>
                      <div className="ccard-row">
                        <h3>{c.name}</h3>
                        <Ring pct={p.pct} size={46} stroke={4} />
                      </div>
                      <div className="ccard-foot muted small"><span>{p.done}/{p.total} tasks</span><span>{money(s.actual)}{s.budget ? ` of ${money(s.budget)}` : ''}</span></div>
                    </div>
                  </Link>
                )
              })}
              <button className="ccard ccard-new" onClick={create}><span>＋</span>New costume</button>
            </div>
          )}
        </section>
        <aside className="dash-side">
          <div className="panel">
            <div className="panel-head"><h3>Due this week</h3></div>
            {dueSoon.length ? dueSoon.map(({ t, c }) => <TaskLine key={t.id} t={t} c={c} />) : <p className="muted small">Nothing due in the next 7 days. Enjoy the calm before the fright.</p>}
          </div>
          <div className="panel">
            <div className="panel-head"><h3>Next actions</h3></div>
            {next.length ? next.map(({ t, c }) => <TaskLine key={t.id} t={t} c={c} />) : <p className="muted small">No open tasks. Brainstorm a costume to generate some.</p>}
          </div>
        </aside>
      </div>
    </div>
  )
}
