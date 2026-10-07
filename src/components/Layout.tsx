import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function Layout({
  children,
  actions,
}: {
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <div className="brand-mark" aria-hidden="true">
            🎃
          </div>
          <div className="brand-text">
            <h1>Costume Hub</h1>
            <p>Randy&apos;s Halloween wardrobe</p>
          </div>
        </Link>
        {actions ? <div className="topbar-actions">{actions}</div> : null}
      </header>
      <main>{children}</main>
    </div>
  )
}
