import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NotesPage from './pages/NotesPage'
import NoteViewPage from './pages/NoteViewPage'
import GeneratePage from './pages/GeneratePage'
import SamplesPage from './pages/SamplesPage'
import FavoritesPage from './pages/FavoritesPage'

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.2rem' }}>Loading your notes...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(45,36,22,0.3)',
            zIndex: 99, display: 'none'
          }}
        />
      )}

      <Sidebar onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* Mobile top bar */}
        <div className="top-bar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="icon-btn"
            style={{ display: 'none', fontSize: '1.2rem' }}
          >
            ☰
          </button>
          <div className="spacer" />
        </div>

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/notes" element={<ProtectedLayout><NotesPage /></ProtectedLayout>} />
      <Route path="/notes/:id" element={<ProtectedLayout><NoteViewPage /></ProtectedLayout>} />
      <Route path="/generate" element={<ProtectedLayout><GeneratePage /></ProtectedLayout>} />
      <Route path="/samples" element={<ProtectedLayout><SamplesPage /></ProtectedLayout>} />
      <Route path="/favorites" element={<ProtectedLayout><FavoritesPage /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.88rem',
              background: 'var(--paper)',
              color: 'var(--ink)',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(45,36,22,0.12)',
            },
            success: {
              iconTheme: { primary: '#6ecfaa', secondary: 'white' }
            },
            error: {
              iconTheme: { primary: '#f4876a', secondary: 'white' }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
