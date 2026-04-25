import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import api from '../utils/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const resetToken = searchParams.get('token')
    if (!resetToken) {
      setError('No reset token provided. Please use the link from your email.')
    } else {
      setToken(resetToken)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.password || !form.confirm) {
      toast.error('Please fill in all fields')
      return
    }

    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: form.password
      })
      toast.success('Password reset successfully! 🎉')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to reset password'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {['✏️', '📝', '🔑', '🎯', '💡', '🔓', '✨', '🖊️'].map((e, i) => (
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
          <span style={{ fontSize: '2.5rem' }}>🔐</span>
        </div>
        <h1>Create New Password</h1>
        <p className="auth-tagline">Enter a new password for your account</p>

        {error ? (
          <div style={{
            background: 'var(--coral-light)',
            border: '2px solid var(--coral)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#8b2500' }}>
              ⚠️ {error}
            </p>
            <Link to="/forgot-password" style={{
              display: 'block',
              marginTop: '12px',
              color: '#8b2500',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              Request a new reset link →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password 🔑</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ width: '100%', paddingRight: 38 }}
                  disabled={loading}
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
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.85' }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password 🔐</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  style={{ width: '100%', paddingRight: 38 }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
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
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.85' }}
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <p style={{
                margin: '6px 0 0 0',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                color: 'var(--ink-faint)'
              }}>
                At least 6 characters
              </p>
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
                  Resetting...
                </>
              ) : 'Reset Password 🔓'}
            </button>
          </form>
        )}

        <div style={{
          borderTop: '2px solid var(--border)',
          marginTop: 20,
          paddingTop: 20,
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink-faint)' }}>
            Back to{' '}
            <Link to="/login" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 700 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
