import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Decorative doodles */}
        {['✏️','📝','⭐','🎯','💡','📚','✨','🖊️'].map((e, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${10 + i * 11}%`,
            left: i % 2 === 0 ? `${3 + i * 2}%` : `${85 - i * 2}%`,
            fontSize: '1.6rem',
            opacity: 0.1,
            transform: `rotate(${i * 25}deg)`,
            animation: `wiggle ${2 + i * 0.3}s ease-in-out infinite alternate`
          }}>
            {e}
          </div>
        ))}
      </div>

      <div className="auth-card" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '2.5rem' }}>✏️</span>
        </div>
        <h1>Welcome back!</h1>
        <p className="auth-tagline">Sign in to your note-taking studio</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email ✉️</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password 🔑</label>
            <input
              className="form-input"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Signing in...
              </>
            ) : 'Sign In ✨'}
          </button>
        </form>

        <hr className="divider" />

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-faint)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--sky-dark)', fontWeight: 700, textDecoration: 'none' }}>
            Create one →
          </Link>
        </p>

        {/* Demo hint */}
        <div style={{
          marginTop: 16, padding: '10px 14px',
          background: 'var(--yellow-light)', borderRadius: 10,
          border: '1.5px dashed var(--yellow)', fontSize: '0.78rem',
          color: 'var(--ink-light)', fontFamily: 'var(--font-note)'
        }}>
          💡 <strong>First time?</strong> Register an account above!!
        </div>
      </div>
    </div>
  )
}
