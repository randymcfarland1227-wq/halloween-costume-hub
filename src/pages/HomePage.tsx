import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { EmptyState } from '../components/EmptyState'
import { StatusBadge } from '../components/StatusBadge'
import { ProgressBar } from '../components/ProgressBar'
import type { CostumesApi } from '../hooks/useCostumes'
import { itemProgress } from '../hooks/useCostumes'
import type { CostumeStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'

function previewIdeas(ideas: string): string {
  const line = ideas
    .split('\n')
    .map((l) => l.replace(/^•\s*/, '').trim())
    .find(Boolean)
  return line || 'No concept notes yet — open to start sketching.'
}

export function HomePage({ api }: { api: CostumesApi }) {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState<'all' | CostumeStatus>('all')
  const [importError, setImportError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return api.costumes
    return api.costumes.filter((c) => c.status === filter)
  }, [api.costumes, filter])

  const handleNew = () => {
    const id = api.addCostume('New costume')
    navigate(`/costume/${id}`)
  }

  const handleExport = () => {
    const blob = new Blob([api.exportBackup()], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `costume-hub-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (file: File | null) => {
    if (!file) return
    setImportError(null)
    try {
      const text = await file.text()
      api.importBackup(text)
    } catch {
      setImportError('Could not import that file. Use a Costume Hub JSON backup.')
    }
  }

  return (
    <Layout
      actions={
        <>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleExport}>
            Export
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fileRef.current?.click()}
          >
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden-file"
            onChange={(e) => {
              void handleImport(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
          <button type="button" className="btn btn-primary" onClick={handleNew}>
            New costume
          </button>
        </>
      }
    >
      {api.showingSeed ? (
        <div className="seed-banner">
          <p>
            <strong>Demo costumes loaded</strong> — keep them as a starting point, or
            clear the stage for your own looks.
          </p>
          <div className="stack-sm">
            <button type="button" className="btn btn-sm" onClick={api.keepSeed}>
              Keep demos
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={api.dismissSeed}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {importError ? (
        <p className="meta" style={{ color: '#f0b4b4', marginBottom: '1rem' }}>
          {importError}
        </p>
      ) : null}

      {api.costumes.length === 0 ? (
        <EmptyState onAdd={handleNew} />
      ) : (
        <>
          <div className="toolbar">
            <div className="filters" role="group" aria-label="Filter by status">
              <button
                type="button"
                className={`chip ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${filter === s ? 'active' : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <p className="meta" style={{ margin: 0 }}>
              {filtered.length} costume{filtered.length === 1 ? '' : 's'}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <h2>Nothing in this act</h2>
              <p>No costumes match that status. Try another filter or add a new look.</p>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((c) => {
                const { done, total } = itemProgress(c)
                return (
                  <Link
                    key={c.id}
                    to={`/costume/${c.id}`}
                    className="card card-link"
                  >
                    <div className="card-header">
                      <h2 className="card-title">{c.name}</h2>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="card-preview">{previewIdeas(c.ideas)}</p>
                    <div className="card-footer">
                      <ProgressBar done={done} total={total} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
