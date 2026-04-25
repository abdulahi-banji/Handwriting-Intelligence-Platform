import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setSent(true)
      
      // In development, show the reset link
      if (res.data.reset_token) {
        toast.success('Reset link generated! Check console or use link below.')
        console.log('Reset Link:', res.data.reset_url)
      } else {
        toast.success('If this email exists, you\'ll receive a reset link')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send reset link')
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
          <span style={{ fontSize: '2.5rem' }}>🔑</span>
        </div>
        <h1>Forgot Password?</h1>
        <p className="auth-tagline">
          {sent
            ? 'Check your email for the reset link'
            : 'Enter your email to receive a password reset link'
          }
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email ✉️</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
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
                  Sending...
                </>
              ) : 'Send Reset Link 📧'}
            </button>
          </form>
        ) : (
          <div style={{
            background: 'var(--yellow-light)',
            border: '2px solid var(--yellow)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 12px 0', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
              ✅ If an account with this email exists, you'll receive a password reset link.
            </p>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--ink-faint)' }}>
              Reset link expires in 24 hours for security.
            </p>
          </div>
        )}

        <div style={{
          borderTop: '2px solid var(--border)',
          marginTop: 20,
          paddingTop: 20,
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink-faint)' }}>
            Remember your password?
            {' '}
            <Link to="/login" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 700 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
