import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LevelSelect from './pages/LevelSelect'
import Level from './pages/Level'
import Quiz from './pages/Quiz'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LevelSelect />} />
        <Route path="/quiz/:id"   element={<Quiz />} />
        <Route path="/level/:id"  element={<Level />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
