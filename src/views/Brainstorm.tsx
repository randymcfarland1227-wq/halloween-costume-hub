import { useState } from 'react'
import type { Costume } from '../lib/types'
import { useStore } from '../lib/store'
import { PROMPTS, SPARKS } from '../lib/content'
import { nowIso, pick, uid } from '../lib/util'
import { Palette } from '../components/Palette'

export function Brainstorm({ c, onToast }: { c: Costume; onToast: (m: string) => void }) {
  const { update } = useStore()
  const [sparks, setSparks] = useState(() => pick(SPARKS, 3))
  const [spin, setSpin] = useState(0)
  const answered = PROMPTS.filter((p) => c.brainstorm[p.key]?.trim()).length

  const toNote = (text: string, color = '#e8dfd0') => {
    update(c.id, (x) => {
      const n = x.elements.length
      return { ...x, elements: [...x.elements, { id: uid(), kind: 'note', x: 80 + (n % 6) * 270, y: 560 + Math.floor(n / 6) * 200, w: 250, h: 170, z: n + 100, color, text }] }
    })
    onToast('Pinned to the moodboard')
  }
  const toTask = (title: string, kind: 'buy' | 'make') => {
    const lines = title.split(/\n|,|;/).map((s) => s.trim()).filter(Boolean)
    update(c.id, (x) => ({ ...x, tasks: [...x.tasks, ...lines.map((l) => ({ id: uid(), title: l, kind, column: 'todo' as const, priority: 'med' as const, createdAt: nowIso() }))] }))
    onToast(`${lines.length} task${lines.length > 1 ? 's' : ''} added to the board`)
  }

  return (
    <div className="bs">
      <div className="bs-main">
        <div className="bs-head">
          <div><h2>Think it through</h2><p className="muted">{answered}/{PROMPTS.length} prompts answered. Short answers are fine — then send them where they belong.</p></div>
        </div>
        <div className="prompts">
          {PROMPTS.map((p, i) => {
            const v = c.brainstorm[p.key] ?? ''
            return (
              <div key={p.key} className={`prompt ${v.trim() ? 'done' : ''}`} style={{ animationDelay: `${i * 30}ms` }}>
                <div className="prompt-head"><span className="prompt-n">{String(i + 1).padStart(2, '0')}</span><h3>{p.title}</h3></div>
                <p className="prompt-q">{p.q}</p>
                <textarea rows={2} value={v} placeholder={p.hint}
                  onChange={(e) => update(c.id, (x) => ({ ...x, brainstorm: { ...x.brainstorm, [p.key]: e.target.value } }))} />
                <div className="prompt-actions">
                  <button className="chip" disabled={!v.trim()} onClick={() => toNote(`${p.title}: ${v.trim()}`)}>→ Note on board</button>
                  <button className="chip" disabled={!v.trim()} onClick={() => toTask(v, 'make')}>→ Make task</button>
                  <button className="chip" disabled={!v.trim()} onClick={() => toTask(v, 'buy')}>→ Buy task</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <aside className="bs-side">
        <div className="panel spark">
          <div className="panel-head"><h3>Spark</h3>
            <button className="btn primary sm" onClick={() => { setSparks(pick(SPARKS, 3)); setSpin((s) => s + 1) }}>✦ Shuffle</button></div>
          <p className="muted small">Random twists from a curated deck — no AI, just mischief.</p>
          <ul className="spark-list" key={spin}>
            {sparks.map((s, i) => (
              <li key={s} style={{ animationDelay: `${i * 70}ms` }}>
                <span>{s}</span>
                <button className="chip" onClick={() => toNote(`✦ ${s}`, '#f07a3a')}>Pin</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <div className="panel-head"><h3>Palette</h3></div>
          <Palette colors={c.palette} onChange={(p) => update(c.id, (x) => ({ ...x, palette: p }))}
            onPlace={(col) => { update(c.id, (x) => ({ ...x, elements: [...x.elements, { id: uid(), kind: 'swatch', x: 1000 + Math.random() * 300, y: 80 + Math.random() * 200, w: 110, h: 110, z: x.elements.length + 100, color: col }] })); onToast('Swatch placed on the board') }} />
        </div>
      </aside>
    </div>
  )
}
