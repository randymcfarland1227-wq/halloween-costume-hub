import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { StatusBadge } from '../components/StatusBadge'
import { ProgressBar } from '../components/ProgressBar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import type { CostumesApi } from '../hooks/useCostumes'
import { itemProgress } from '../hooks/useCostumes'
import type { CostumeStatus, ItemType } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'

type ItemFilter = 'all' | ItemType

export function CostumeDetailPage({ api }: { api: CostumesApi }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const costume = id ? api.getCostume(id) : undefined

  const [inspTitle, setInspTitle] = useState('')
  const [inspUrl, setInspUrl] = useState('')
  const [inspImage, setInspImage] = useState('')
  const [inspNotes, setInspNotes] = useState('')

  const [itemLabel, setItemLabel] = useState('')
  const [itemType, setItemType] = useState<ItemType>('buy')
  const [itemNotes, setItemNotes] = useState('')
  const [itemFilter, setItemFilter] = useState<ItemFilter>('all')

  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editType, setEditType] = useState<ItemType>('buy')
  const [editNotes, setEditNotes] = useState('')

  const [confirmDelete, setConfirmDelete] = useState(false)

  const filteredItems = useMemo(() => {
    if (!costume) return []
    if (itemFilter === 'all') return costume.items
    return costume.items.filter((i) => i.type === itemFilter)
  }, [costume, itemFilter])

  if (!costume || !id) {
    return (
      <Layout>
        <div className="empty">
          <h2>Costume vanished</h2>
          <p>That look isn&apos;t in the wardrobe anymore.</p>
          <Link to="/" className="btn btn-primary">
            Back to hub
          </Link>
        </div>
      </Layout>
    )
  }

  const progress = itemProgress(costume)

  const submitInspiration = (e: FormEvent) => {
    e.preventDefault()
    if (!inspTitle.trim()) return
    api.addInspiration(id, {
      title: inspTitle.trim(),
      url: inspUrl.trim() || undefined,
      imageUrl: inspImage.trim() || undefined,
      notes: inspNotes.trim() || undefined,
    })
    setInspTitle('')
    setInspUrl('')
    setInspImage('')
    setInspNotes('')
  }

  const submitItem = (e: FormEvent) => {
    e.preventDefault()
    if (!itemLabel.trim()) return
    api.addItem(id, {
      label: itemLabel,
      type: itemType,
      notes: itemNotes || undefined,
    })
    setItemLabel('')
    setItemNotes('')
    setItemType('buy')
  }

  const startEditItem = (itemId: string) => {
    const item = costume.items.find((i) => i.id === itemId)
    if (!item) return
    setEditingItemId(itemId)
    setEditLabel(item.label)
    setEditType(item.type)
    setEditNotes(item.notes ?? '')
  }

  const saveEditItem = (e: FormEvent) => {
    e.preventDefault()
    if (!editingItemId || !editLabel.trim()) return
    api.updateItem(id, editingItemId, {
      label: editLabel.trim(),
      type: editType,
      notes: editNotes.trim() || undefined,
    })
    setEditingItemId(null)
  }

  return (
    <Layout
      actions={
        <Link to="/" className="btn btn-ghost">
          ← All costumes
        </Link>
      }
    >
      <div className="detail-header">
        <div className="detail-nav">
          <StatusBadge status={costume.status} />
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => setConfirmDelete(true)}
          >
            Delete costume
          </button>
        </div>

        <div className="detail-title-row">
          <div className="field">
            <label htmlFor="costume-name">Costume name</label>
            <input
              id="costume-name"
              className="name-input"
              value={costume.name}
              onChange={(e) => api.updateCostume(id, { name: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="costume-status">Status</label>
            <select
              id="costume-status"
              value={costume.status}
              onChange={(e) =>
                api.updateCostume(id, {
                  status: e.target.value as CostumeStatus,
                })
              }
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1rem' }}>
          <div className="card-footer" style={{ margin: 0 }}>
            <span className="meta">Checklist progress</span>
            <ProgressBar done={progress.done} total={progress.total} />
          </div>
        </div>
      </div>

      <div className="sections">
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Ideas & concept</h2>
              <p className="section-sub">
                Sketch the vibe — bullets, notes, whatever sticks.
              </p>
            </div>
          </div>
          <div className="field">
            <label htmlFor="ideas" className="sr-only">
              Ideas
            </label>
            <textarea
              id="ideas"
              value={costume.ideas}
              onChange={(e) => api.updateCostume(id, { ideas: e.target.value })}
              placeholder="• Silhouette&#10;• Color story&#10;• Props & makeup notes"
            />
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>Inspiration</h2>
              <p className="section-sub">
                Links, image URLs, and notes that feed the look.
              </p>
            </div>
          </div>

          <form onSubmit={submitInspiration} className="form-row cols-2">
            <div className="field">
              <label htmlFor="insp-title">Title</label>
              <input
                id="insp-title"
                value={inspTitle}
                onChange={(e) => setInspTitle(e.target.value)}
                placeholder="Moodboard board, coat reference…"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="insp-url">Link (optional)</label>
              <input
                id="insp-url"
                type="url"
                value={inspUrl}
                onChange={(e) => setInspUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="field">
              <label htmlFor="insp-image">Image URL (optional)</label>
              <input
                id="insp-image"
                type="url"
                value={inspImage}
                onChange={(e) => setInspImage(e.target.value)}
                placeholder="https://…/image.jpg"
              />
            </div>
            <div className="field">
              <label htmlFor="insp-notes">Notes (optional)</label>
              <input
                id="insp-notes"
                value={inspNotes}
                onChange={(e) => setInspNotes(e.target.value)}
                placeholder="What to steal from this"
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">
                Add inspiration
              </button>
            </div>
          </form>

          {costume.inspiration.length === 0 ? (
            <p className="muted">No inspiration pinned yet. Drop a link or image.</p>
          ) : (
            <ul className="list">
              {costume.inspiration.map((entry) => (
                <li key={entry.id} className="list-item">
                  <div className="list-item-top">
                    <div>
                      <h3>{entry.title}</h3>
                      {entry.notes ? <p className="meta">{entry.notes}</p> : null}
                      {entry.url ? (
                        <p className="meta" style={{ marginTop: '0.35rem' }}>
                          <a href={entry.url} target="_blank" rel="noreferrer">
                            Open link ↗
                          </a>
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => api.deleteInspiration(id, entry.id)}
                    >
                      Remove
                    </button>
                  </div>
                  {entry.imageUrl ? (
                    <img
                      className="thumb"
                      src={entry.imageUrl}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>Items — buy & make</h2>
              <p className="section-sub">
                Track what you still need. Check things off as you go.
              </p>
            </div>
            <div className="filters" role="group" aria-label="Filter items">
              {(['all', 'buy', 'make'] as ItemFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`chip ${itemFilter === f ? 'active' : ''}`}
                  onClick={() => setItemFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'buy' ? 'Buy' : 'Make'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submitItem} className="form-row item-add">
            <div className="field">
              <label htmlFor="item-label">Item</label>
              <input
                id="item-label"
                value={itemLabel}
                onChange={(e) => setItemLabel(e.target.value)}
                placeholder="Cape, boots, LED collar…"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="item-type">Type</label>
              <select
                id="item-type"
                value={itemType}
                onChange={(e) => setItemType(e.target.value as ItemType)}
              >
                <option value="buy">Buy</option>
                <option value="make">Make</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Add item
            </button>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="item-notes">Notes (optional)</label>
              <input
                id="item-notes"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="Size, thrift tip, materials…"
              />
            </div>
          </form>

          {filteredItems.length === 0 ? (
            <p className="muted">
              {costume.items.length === 0
                ? 'Checklist empty — add something to get or make.'
                : 'No items in this filter.'}
            </p>
          ) : (
            <ul className="list">
              {filteredItems.map((item) => (
                <li key={item.id} className="list-item">
                  {editingItemId === item.id ? (
                    <form onSubmit={saveEditItem} className="edit-inline">
                      <div className="form-row cols-2" style={{ marginBottom: 0 }}>
                        <div className="field">
                          <label htmlFor={`edit-label-${item.id}`}>Label</label>
                          <input
                            id={`edit-label-${item.id}`}
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>
                        <div className="field">
                          <label htmlFor={`edit-type-${item.id}`}>Type</label>
                          <select
                            id={`edit-type-${item.id}`}
                            value={editType}
                            onChange={(e) =>
                              setEditType(e.target.value as ItemType)
                            }
                          >
                            <option value="buy">Buy</option>
                            <option value="make">Make</option>
                          </select>
                        </div>
                        <div className="field" style={{ gridColumn: '1 / -1' }}>
                          <label htmlFor={`edit-notes-${item.id}`}>Notes</label>
                          <input
                            id={`edit-notes-${item.id}`}
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="stack-sm">
                        <button type="submit" className="btn btn-primary btn-sm">
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingItemId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="item-row">
                      <input
                        className="checkbox"
                        type="checkbox"
                        checked={item.done}
                        onChange={(e) =>
                          api.updateItem(id, item.id, { done: e.target.checked })
                        }
                        aria-label={`Mark ${item.label} as ${item.done ? 'not done' : 'done'}`}
                      />
                      <div>
                        <div className="stack-sm" style={{ marginBottom: '0.25rem' }}>
                          <span
                            className={`item-label ${item.done ? 'done' : ''}`}
                            style={{ fontWeight: 600 }}
                          >
                            {item.label}
                          </span>
                          <span
                            className={`type-pill type-${item.type}`}
                          >
                            {item.type}
                          </span>
                        </div>
                        {item.notes ? <p className="meta">{item.notes}</p> : null}
                      </div>
                      <div className="stack-sm">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => startEditItem(item.id)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => api.deleteItem(id, item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete this costume?"
          message={`“${costume.name}” will be removed from your hub. This can’t be undone.`}
          confirmLabel="Delete costume"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            api.deleteCostume(id)
            navigate('/')
          }}
        />
      ) : null}
    </Layout>
  )
}
