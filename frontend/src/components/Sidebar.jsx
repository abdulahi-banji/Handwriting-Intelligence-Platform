import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { to: '/dashboard', icon: '📋', label: 'Dashboard' },
  { to: '/notes', icon: '📝', label: 'My Notes' },
  { to: '/generate', icon: '✨', label: 'Generate Note' },
  { to: '/samples', icon: '🖊️', label: 'Handwriting' },
  { to: '/favorites', icon: '⭐', label: 'Favorites' },
]

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || '?'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>
          ✏️ Scribble
          <span className="logo-dot" />
        </h1>
        <p>Handwriting Intelligence</p>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Quick Add</div>
        <NavLink
          to="/generate"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
          style={{ background: 'var(--yellow-light)', borderColor: 'var(--yellow)' }}
        >
          <span className="nav-icon">🎯</span>
          New Note
          <span className="nav-badge">+</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" onClick={handleLogout} title="Click to logout">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <p>{user?.username || 'User'}</p>
            <span>Logout →</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
