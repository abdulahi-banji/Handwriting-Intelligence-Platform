import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
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
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={{ width: '100%', paddingRight: 38 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  padding: 4,
                  cursor: 'pointer',
                  color: 'var(--ink-dark)',
                  opacity: 0.85,
                  fontSize: '1.1rem'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type = "submit"
            className = "btn btn-primary"
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

          <div style={{
            textAlign: 'right',
            marginTop: '12px'
          }}>
            <Link to="/forgot-password" style={{
              fontSize: '0.85rem',
              color: 'var(--ink-faint)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)'
            }}>
              Forgot password? 🔑
            </Link>
          </div>
        </form>

        <hr className="divider" />

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-faint)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--sky-dark)', fontWeight: 700, textDecoration: 'none' }}>
            Create one →
          </Link>
        </p>

        {/* For the guest user */}
        <button
          type="button"
          className="btn btn-outline"
          onClick={async () => {
            setLoading(true)
            try {
              await login('guest@test.com', 'guest')
              toast.success('Welcome, Guest! 👋 Explore without account')
              navigate('/dashboard')
            } catch {
              // Mock localStorage directly if API fails
              localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2E4NmNlYi1kYWJjLTQ1NmYtOGU1YS0zMjcyZTViN2JjY2MiLCJlbWFpbCI6ImRlbW9AdGVzdC5jb20iLCJleHAiOjE5OTk5OTk5OTk5fQ.dummy_guest')
              localStorage.setItem('user', JSON.stringify({id:'93a86ceb-dabc-456f-8e5a-3272e5b7bccc', email:'guest@test.com', username:'Guest'}))
              toast.success('Welcome, Guest! 👋 Explore dashboard')
              navigate('/dashboard')
            } finally {
              setLoading(false)
            }
          }}
          disabled={loading}
          style={{ width: '100%', marginTop: 12 }}
        >
          👋 Continue as Guest
        </button>

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
