import { useState } from 'react'
import { PALETTES } from '../lib/content'

export function Palette({ colors, onChange, onPlace }: { colors: string[]; onChange: (c: string[]) => void; onPlace?: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="palette">
      <div className="palette-row">
        {colors.map((c, i) => (
          <div key={i} className="sw">
            <label style={{ background: c }} title={c}>
              <input type="color" value={c} onChange={(e) => onChange(colors.map((x, j) => (j === i ? e.target.value : x)))} aria-label={`Color ${i + 1}`} />
            </label>
            <div className="sw-actions">
              {onPlace && <button title="Place on board" onClick={() => onPlace(c)}>＋</button>}
              <button title="Remove" onClick={() => onChange(colors.filter((_, j) => j !== i))}>✕</button>
            </div>
          </div>
        ))}
        {colors.length < 8 && <button className="sw-add" onClick={() => onChange([...colors, '#f07a3a'])} aria-label="Add color">＋</button>}
        <button className="btn ghost sm" onClick={() => setOpen((o) => !o)}>{open ? 'Hide presets' : 'Presets'}</button>
      </div>
      {open && (
        <div className="presets">
          {PALETTES.map((p) => (
            <button key={p.name} className="preset" onClick={() => { onChange(p.colors); setOpen(false) }}>
              <span className="preset-strip">{p.colors.map((c) => <i key={c} style={{ background: c }} />)}</span>{p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
