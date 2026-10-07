export function ProgressBar({
  done,
  total,
}: {
  done: number
  total: number
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: 1 }}>
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
      <span>
        {done}/{total}
      </span>
    </div>
  )
}
