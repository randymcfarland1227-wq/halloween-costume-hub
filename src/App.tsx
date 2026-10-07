import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useCostumes } from './hooks/useCostumes'
import { HomePage } from './pages/HomePage'
import { CostumeDetailPage } from './pages/CostumeDetailPage'

export default function App() {
  const api = useCostumes()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage api={api} />} />
        <Route path="/costume/:id" element={<CostumeDetailPage api={api} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
