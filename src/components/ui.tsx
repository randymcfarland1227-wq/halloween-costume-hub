import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Costume } from '../lib/types'
import { STATUS_LABELS } from '../lib/types'
import { useImageSrc } from '../lib/images'
import { parseDay } from '../lib/util'

export function Ring({ pct, size = 56, stroke = 5, label }: { pct: number; size?: number; stroke?: number; label?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="rg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#6b2d4a" /><stop offset="1" stopColor="#f07a3a" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(232,223,208,.1)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#rg)" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span>{label ?? `${Math.round(pct * 100)}%`}</span>
    </div>
  )
}

export function Badge({ status }: { status: Costume['status'] }) {
  return <span className={`badge st-${status}`}>{STATUS_LABELS[status]}</span>
}

function Img({ src, className }: { src?: string; className?: string }) {
  const v = useImageSrc(src)
  const [bad, setBad] = useState(false)
  if (!v || bad) return <div className={`${className ?? ''} img-ph`} />
  return <img className={className} src={v} alt="" loading="lazy" draggable={false} onError={() => setBad(true)} />
}
export { Img }

export function Cover({ c }: { c: Costume }) {
  const imgs = c.elements.filter((e) => e.kind === 'image').map((e) => e.src!)
  const srcs = c.coverSrc ? [c.coverSrc] : imgs.slice(0, 4)
  if (srcs.length === 0) {
    return (
      <div className="cover cover-art" style={{ background: `linear-gradient(135deg, ${c.palette.join(', ')})` }}>
        <span className="cover-initial">{c.name.slice(0, 1)}</span>
      </div>
    )
  }
  return (
    <div className={`cover collage n${Math.min(srcs.length, 4)}`}>
      {srcs.map((s, i) => <Img key={i} src={s} />)}
      <div className="cover-palette">{c.palette.map((p, i) => <i key={i} style={{ background: p }} />)}</div>
    </div>
  )
}

export function useNow(ms = 1000) {
  const [n, setN] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setN(new Date()), ms); return () => clearInterval(t) }, [ms])
  return n
}

export function Countdown({ date, label, big }: { date: string; label: string; big?: boolean }) {
  const now = useNow(big ? 1000 : 60000)
  const ms = Math.max(0, parseDay(date).getTime() + 18 * 3600000 - now.getTime()) // 6pm event start
  const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60
  return (
    <div className={`countdown ${big ? 'big' : ''}`}>
      <div className="cd-label">{label}</div>
      <div className="cd-units">
        <div><b>{d}</b><small>days</small></div>
        <div><b>{String(h).padStart(2, '0')}</b><small>hrs</small></div>
        <div><b>{String(m).padStart(2, '0')}</b><small>min</small></div>
        {big && <div><b>{String(s).padStart(2, '0')}</b><small>sec</small></div>}
      </div>
    </div>
  )
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close">✕</button></div>
        {children}
      </div>
    </div>
  )
}

export function Empty({ icon, title, body, action }: { icon: string; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3><p>{body}</p>{action}
    </div>
  )
}
