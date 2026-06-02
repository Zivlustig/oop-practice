import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './context/UserContext'
import LevelSelect from './pages/LevelSelect'
import Level      from './pages/Level'
import Quiz       from './pages/Quiz'
import Login      from './pages/Login'

// ─── Route guard ──────────────────────────────────────────────────────────────
// Blocks access until the session is restored from localStorage/Firestore.
// Redirects to /login when there's no authenticated user.
function ProtectedRoute({ children }) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

// ─── Inner routes (need UserContext in scope) ─────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"     element={<Login />} />
      <Route path="/"          element={<ProtectedRoute><LevelSelect /></ProtectedRoute>} />
      <Route path="/quiz/:id"  element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="/level/:id" element={<ProtectedRoute><Level /></ProtectedRoute>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  )
}
