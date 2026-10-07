import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import { Dashboard } from './views/Dashboard'
import { CostumePage } from './views/CostumePage'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="shell">
          <header className="topbar">
            <Link to="/" className="brand"><span className="brand-mark">🎃</span><span><b>Costume Hub</b><small>Halloween studio</small></span></Link>
          </header>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/costume/:id" element={<CostumePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </StoreProvider>
  )
}
