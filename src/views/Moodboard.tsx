import { useCallback, useEffect, useRef, useState } from 'react'
import type { CanvasEl, Costume } from '../lib/types'
import { useStore } from '../lib/store'
import { compress, deleteImage, putImage } from '../lib/images'
import { uid } from '../lib/util'
import { Img } from '../components/ui'

const W = 2400, H = 1600
const NOTE_COLORS = ['#e8dfd0', '#f07a3a', '#e3b04b', '#c99bb0', '#a7b48a']
type Drag = { mode: 'move' | 'resize'; sx: number; sy: number; orig: Map<string, { x: number; y: number; w: number; h: number }> }

export function Moodboard({ c }: { c: Costume }) {
  const { update } = useStore()
  const [sel, setSel] = useState<string[]>([])
  const [draft, setDraft] = useState<CanvasEl[] | null>(null)
  const [zoom, setZoom] = useState(() => (window.innerWidth < 700 ? 0.45 : 0.8))
  const [urlOpen, setUrlOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [dropping, setDropping] = useState(false)
  const [busy, setBusy] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const drag = useRef<Drag | null>(null)
  const draftRef = useRef<CanvasEl[] | null>(null)
  const zoomRef = useRef(zoom); zoomRef.current = zoom
  const els = draft ?? c.elements
  const elsRef = useRef(els); elsRef.current = els

  const commit = useCallback((next: CanvasEl[]) => update(c.id, (x) => ({ ...x, elements: next })), [c.id, update])
  const setD = (d: CanvasEl[] | null) => { draftRef.current = d; setDraft(d) }
  const maxZ = () => Math.max(0, ...elsRef.current.map((e) => e.z))

  const viewCenter = () => {
    const s = scroller.current, z = zoomRef.current
    if (!s) return { x: 200, y: 200 }
    return { x: (s.scrollLeft + s.clientWidth / 2) / z, y: (s.scrollTop + s.clientHeight / 2) / z }
  }
  const addEl = useCallback((p: Omit<CanvasEl, 'id' | 'z' | 'x' | 'y'> & { x?: number; y?: number }) => {
    const ctr = viewCenter()
    const jitter = () => Math.round((Math.random() - 0.5) * 80)
    const el: CanvasEl = {
      ...p, id: uid(), z: maxZ() + 1,
      x: Math.max(0, Math.min(W - p.w, (p.x ?? ctr.x - p.w / 2) + (p.x === undefined ? jitter() : 0))),
      y: Math.max(0, Math.min(H - p.h, (p.y ?? ctr.y - p.h / 2) + (p.y === undefined ? jitter() : 0))),
    }
    update(c.id, (x) => ({ ...x, elements: [...x.elements, el] }))
    setSel([el.id])
  }, [c.id, update])

  const addImageFile = useCallback(async (f: Blob, at?: { x: number; y: number }) => {
    setBusy((b) => b + 1)
    try {
      const { data, w, h } = await compress(f)
      const src = await putImage(data)
      const s = Math.min(1, 340 / w)
      addEl({ kind: 'image', src, w: Math.round(w * s), h: Math.round(h * s), ...(at ? { x: at.x - (w * s) / 2, y: at.y - (h * s) / 2 } : {}) })
    } catch (e) { console.warn(e); alert('Could not read that image.') } finally { setBusy((b) => b - 1) }
  }, [addEl])

  const addImageUrl = useCallback((u: string, at?: { x: number; y: number }) => {
    const img = new Image()
    const place = (w: number, h: number) => { const s = Math.min(1, 320 / w); addEl({ kind: 'image', src: u, w: Math.round(w * s), h: Math.round(h * s), ...(at ? { x: at.x - 160, y: at.y - 160 } : {}) }) }
    img.onload = () => place(img.naturalWidth, img.naturalHeight)
    img.onerror = () => place(320, 320)
    img.src = u
  }, [addEl])

  // pointer drag/resize
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current; if (!d || !draftRef.current) return
      const z = zoomRef.current, dx = (e.clientX - d.sx) / z, dy = (e.clientY - d.sy) / z
      setD(draftRef.current.map((x) => {
        const o = d.orig.get(x.id); if (!o) return x
        if (d.mode === 'move') return { ...x, x: Math.max(0, Math.min(W - x.w, o.x + dx)), y: Math.max(0, Math.min(H - x.h, o.y + dy)) }
        return { ...x, w: Math.max(60, Math.min(W - x.x, o.w + dx)), h: Math.max(50, Math.min(H - x.y, o.h + dy)) }
      }))
    }
    const up = () => {
      if (!drag.current) return
      drag.current = null
      const d = draftRef.current
      setD(null)
      if (d) commit(d.map((x) => ({ ...x, x: Math.round(x.x), y: Math.round(x.y), w: Math.round(x.w), h: Math.round(x.h) })))
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up) }
  }, [commit])

  const onDown = (e: React.PointerEvent, el: CanvasEl, mode: Drag['mode']) => {
    if (e.button !== 0) return
    const t = e.target as HTMLElement
    if (mode === 'move' && t.closest('textarea,input,button,.no-drag')) { setSel([el.id]); return }
    e.stopPropagation(); e.preventDefault()
    let next = sel
    if (e.shiftKey || e.metaKey || e.ctrlKey) next = sel.includes(el.id) ? sel.filter((s) => s !== el.id) : [...sel, el.id]
    else if (!sel.includes(el.id)) next = [el.id]
    setSel(next)
    const ids = new Set(mode === 'resize' ? [el.id] : next.length ? next : [el.id])
    if (mode === 'move') {
      const groups = new Set(els.filter((x) => ids.has(x.id) && x.group).map((x) => x.group))
      els.forEach((x) => x.group && groups.has(x.group) && ids.add(x.id))
    }
    const orig = new Map(els.filter((x) => ids.has(x.id)).map((x) => [x.id, { x: x.x, y: x.y, w: x.w, h: x.h }]))
    drag.current = { mode, sx: e.clientX, sy: e.clientY, orig }
    const z = maxZ()
    setD(els.map((x) => (x.id === el.id && x.z !== z ? { ...x, z: z + 1 } : x)))
  }

  const patchSel = (fn: (e: CanvasEl) => CanvasEl) => commit(els.map((x) => (sel.includes(x.id) ? fn(x) : x)))
  const delSel = useCallback(() => {
    const gone = elsRef.current.filter((x) => sel.includes(x.id))
    gone.forEach((g) => g.src && g.src !== c.coverSrc && deleteImage(g.src))
    commit(elsRef.current.filter((x) => !sel.includes(x.id))); setSel([])
  }, [sel, commit, c.coverSrc])

  // keyboard + paste
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input,textarea,select')) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && sel.length) { e.preventDefault(); delSel() }
      if (e.key === 'Escape') setSel([])
    }
    const paste = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement
      const items = [...(e.clipboardData?.items ?? [])]
      const img = items.find((i) => i.type.startsWith('image/'))
      if (img) { e.preventDefault(); const f = img.getAsFile(); if (f) addImageFile(f); return }
      if (t.closest('input,textarea')) return
      const text = e.clipboardData?.getData('text')?.trim()
      if (text && /^https?:\/\/\S+$/i.test(text)) { e.preventDefault(); addImageUrl(text) }
      else if (text) { e.preventDefault(); addEl({ kind: 'note', w: 240, h: 160, color: NOTE_COLORS[0], text }) }
    }
    window.addEventListener('keydown', key); window.addEventListener('paste', paste)
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('paste', paste) }
  }, [sel, delSel, addImageFile, addImageUrl, addEl])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDropping(false)
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const at = { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom }
    const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'))
    if (files.length) { files.forEach((f, i) => addImageFile(f, { x: at.x + i * 30, y: at.y + i * 30 })); return }
    const u = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain')
    if (u && /^https?:/i.test(u.trim())) addImageUrl(u.trim().split('\n')[0], at)
  }

  const selEls = els.filter((x) => sel.includes(x.id))
  const one = selEls.length === 1 ? selEls[0] : null
  const grouped = selEls.some((x) => x.group)

  return (
    <div className="mb">
      <div className="mb-toolbar">
        <div className="tb-group">
          <button className="tb" onClick={() => fileRef.current?.click()}>🖼 Upload</button>
          <button className="tb" onClick={() => setUrlOpen((o) => !o)}>🔗 Image URL</button>
          <button className="tb" onClick={() => addEl({ kind: 'note', w: 240, h: 170, color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)], text: '' })}>📝 Note</button>
          <button className="tb" onClick={() => addEl({ kind: 'swatch', w: 110, h: 110, color: c.palette[Math.floor(Math.random() * c.palette.length)] ?? '#f07a3a' })}>🎨 Swatch</button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { [...(e.target.files ?? [])].forEach((f) => addImageFile(f)); e.target.value = '' }} />
        </div>
        {sel.length > 0 && (
          <div className="tb-group sel-tools">
            <span className="tb-count">{sel.length} selected</span>
            {sel.length > 1 && !grouped && <button className="tb" onClick={() => { const g = uid(); patchSel((x) => ({ ...x, group: g })) }}>⛓ Group</button>}
            {grouped && <button className="tb" onClick={() => patchSel((x) => ({ ...x, group: undefined }))}>Ungroup</button>}
            {one?.kind === 'image' && <button className="tb" onClick={() => update(c.id, (x) => ({ ...x, coverSrc: one.src }))}>{c.coverSrc === one.src ? '★ Cover' : '☆ Set cover'}</button>}
            {one?.kind === 'note' && NOTE_COLORS.map((nc) => <button key={nc} className="dot" style={{ background: nc }} aria-label="Note color" onClick={() => patchSel((x) => ({ ...x, color: nc }))} />)}
            <button className="tb" onClick={() => { const z = maxZ(); patchSel((x) => ({ ...x, z: z + 1 })) }}>Front</button>
            <button className="tb" onClick={() => { const z = Math.min(...els.map((e) => e.z)); patchSel((x) => ({ ...x, z: z - 1 })) }}>Back</button>
            <button className="tb danger" onClick={delSel}>Delete</button>
          </div>
        )}
        <div className="tb-group zoom">
          <button className="tb" onClick={() => setZoom((z) => Math.max(0.3, +(z - 0.1).toFixed(2)))} aria-label="Zoom out">−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button className="tb" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))} aria-label="Zoom in">＋</button>
        </div>
      </div>
      {urlOpen && (
        <form className="url-pop" onSubmit={(e) => { e.preventDefault(); if (url.trim()) { addImageUrl(url.trim()); setUrl(''); setUrlOpen(false) } }}>
          <input autoFocus type="url" placeholder="Paste an image URL…" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button className="btn primary sm">Add</button>
        </form>
      )}
      <div className={`mb-scroll ${dropping ? 'dropping' : ''}`} ref={scroller}
        onDragOver={(e) => { e.preventDefault(); setDropping(true) }} onDragLeave={() => setDropping(false)} onDrop={onDrop}>
        <div className="mb-sizer" style={{ width: W * zoom, height: H * zoom }}>
          <div className="mb-surface" style={{ width: W, height: H, transform: `scale(${zoom})` }}
            onPointerDown={(e) => { if (e.target === e.currentTarget) setSel([]) }}>
            {els.map((el) => {
              const on = sel.includes(el.id)
              return (
                <div key={el.id} className={`el el-${el.kind} ${on ? 'on' : ''} ${el.group ? 'grouped' : ''}`}
                  style={{ left: el.x, top: el.y, width: el.w, height: el.h, zIndex: el.z, ...(el.kind !== 'image' ? { background: el.color } : {}) }}
                  onPointerDown={(e) => onDown(e, el, 'move')}>
                  {el.kind === 'image' && <Img src={el.src} className="el-img" />}
                  {el.kind === 'image' && c.coverSrc === el.src && <span className="cover-tag">Cover</span>}
                  {el.kind === 'note' && (<>
                    <div className="grip">⋯</div>
                    <textarea value={el.text ?? ''} placeholder="Write a thought…"
                      onChange={(e) => commit(els.map((x) => (x.id === el.id ? { ...x, text: e.target.value } : x)))} />
                  </>)}
                  {el.kind === 'swatch' && (
                    <label className="sw-label no-drag">
                      <span>{el.color}</span>
                      {on && <input type="color" value={el.color} onChange={(e) => commit(els.map((x) => (x.id === el.id ? { ...x, color: e.target.value } : x)))} />}
                    </label>
                  )}
                  {on && <div className="handle" onPointerDown={(e) => onDown(e, el, 'resize')} />}
                </div>
              )
            })}
          </div>
        </div>
        {els.length === 0 && (
          <div className="mb-empty">
            <div className="empty-icon">🕸️</div>
            <h3>A blank wall in a haunted house</h3>
            <p>Drag images here, paste a screenshot (⌘/Ctrl+V), or drop in an image link. Notes and swatches welcome.</p>
            <div className="row">
              <button className="btn primary" onClick={() => fileRef.current?.click()}>Upload images</button>
              <button className="btn" onClick={() => addEl({ kind: 'note', w: 260, h: 170, color: '#e8dfd0', text: '' })}>Add a note</button>
            </div>
          </div>
        )}
        {busy > 0 && <div className="mb-busy">Developing photos…</div>}
      </div>
      <p className="hint">Tip: shift-click to multi-select, then Group so pieces move together. Drag the corner to resize. Delete removes.</p>
    </div>
  )
}
