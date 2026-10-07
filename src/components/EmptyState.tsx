export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty">
      <div className="emoji" aria-hidden="true">
        🕯️
      </div>
      <h2>The wardrobe is empty</h2>
      <p>
        No costumes yet — just candlelight and ambition. Sketch your first look
        before the night claims the calendar.
      </p>
      <button type="button" className="btn btn-primary" onClick={onAdd}>
        New costume
      </button>
    </div>
  )
}
