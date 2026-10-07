import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { progress, useStore } from '../lib/store'
import { STATUSES, STATUS_LABELS } from '../lib/types'
import { daysUntil } from '../lib/util'
import { Countdown, Empty, Modal, Ring } from '../components/ui'
import { deleteImage } from '../lib/images'
import { Moodboard } from './Moodboard'
import { Brainstorm } from './Brainstorm'
import { Board } from './Board'
import { Timeline } from './Timeline'

const TABS = [
  { id: 'board', label: 'Moodboard', icon: '🖼' },
  { id: 'think', label: 'Brainstorm', icon: '✦' },
  { id: 'tasks', label: 'Tasks & budget', icon: '☰' },
  { id: 'plan', label: 'Timeline', icon: '⏳' },
] as const

export function CostumePage() {
  const { id } = useParams()
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()
  const { state, update, remove } = useStore()
  const c = state.costumes.find((x) => x.id === id)
  const tab = (sp.get('tab') ?? 'board') as (typeof TABS)[number]['id']
  const [toast, setToast] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [details, setDetails] = useState(false)
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t) }, [toast])

  if (!c) return <Empty icon="👻" title="This costume vanished" body="It isn't in the wardrobe anymore." action={<Link className="btn primary" to="/">Back to dashboard</Link>} />
  const p = progress(c)
  const days = daysUntil(c.eventDate)

  return (
    <div className="cp fade-in">
      <header className="cp-head">
        <div className="cp-left">
          <Link to="/" className="back">← Dashboard</Link>
          <input className="cp-name" value={c.name} onChange={(e) => update(c.id, (x) => ({ ...x, name: e.target.value }))} aria-label="Costume name" />
          <div className="cp-meta">
            <select className={`badge-select st-${c.status}`} value={c.status} onChange={(e) => update(c.id, (x) => ({ ...x, status: e.target.value as typeof c.status }))} aria-label="Status">
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <button className="event-chip" onClick={() => setDetails(true)}>📍 {c.eventName || 'Event'} · {days >= 0 ? `${days}d` : 'past'}</button>
            <span className="palette-mini">{c.palette.map((x, i) => <i key={i} style={{ background: x }} />)}</span>
          </div>
        </div>
        <div className="cp-right">
          <Countdown date={c.eventDate} label={`until ${c.eventName || 'the event'}`} />
          <Ring pct={p.pct} size={64} label={<><b>{p.done}</b>/{p.total}</>} />
        </div>
      </header>
      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setSp({ tab: t.id }, { replace: true })}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <button className="tab-more" onClick={() => setDetails(true)}>Details</button>
      </nav>
      <div className="tab-body fade-in" key={tab}>
        {tab === 'board' && <Moodboard c={c} />}
        {tab === 'think' && <Brainstorm c={c} onToast={setToast} />}
        {tab === 'tasks' && <Board c={c} />}
        {tab === 'plan' && <Timeline c={c} onToast={setToast} />}
      </div>
      {toast && <div className="toast">{toast}</div>}
      {details && (
        <Modal title="Costume details" onClose={() => setDetails(false)}>
          <div className="form">
            <label className="f full"><span>Name</span><input value={c.name} onChange={(e) => update(c.id, (x) => ({ ...x, name: e.target.value }))} /></label>
            <label className="f"><span>Event</span><input value={c.eventName} onChange={(e) => update(c.id, (x) => ({ ...x, eventName: e.target.value }))} placeholder="Halloween night, office party…" /></label>
            <label className="f"><span>Event date</span><input type="date" value={c.eventDate} onChange={(e) => e.target.value && update(c.id, (x) => ({ ...x, eventDate: e.target.value }))} /></label>
            <div className="form-actions full">
              <button className="btn danger" onClick={() => setConfirm(true)}>Delete costume</button>
              <span style={{ flex: 1 }} />
              <button className="btn primary" onClick={() => setDetails(false)}>Done</button>
            </div>
          </div>
        </Modal>
      )}
      {confirm && (
        <Modal title="Delete this costume?" onClose={() => setConfirm(false)}>
          <p className="muted">“{c.name}” and its moodboard will be gone for good.</p>
          <div className="form-actions">
            <span style={{ flex: 1 }} />
            <button className="btn ghost" onClick={() => setConfirm(false)}>Keep it</button>
            <button className="btn danger" onClick={() => { c.elements.forEach((e) => deleteImage(e.src)); remove(c.id); nav('/') }}>Delete forever</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
