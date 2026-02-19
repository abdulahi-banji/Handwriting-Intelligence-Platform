import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'
import { useAuth } from '../hooks/useAuth'

const SUBJECT_COLORS = {
  Math: 'subject-math', Science: 'subject-science',
  History: 'subject-history', English: 'subject-english',
  General: 'subject-general', CS: 'subject-cs',
}

function getSubjectClass(subject) {
  return SUBJECT_COLORS[subject] || 'subject-general'
}

const ACCENTS = ['accent-yellow', 'accent-mint', 'accent-coral', 'accent-sky', 'accent-lavender', 'accent-pink']

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentNotes, setRecentNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/notes/stats/summary'),
      api.get('/notes?limit=6')
    ])
      .then(([s, n]) => {
        setStats(s.data)
        setRecentNotes(n.data.notes || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      const newGreeting = hour < 12 ? 'Good Morning..' : hour < 17 ? 'Good Afternoon..' : 'Good Evening..'
      setGreeting(newGreeting)
      setCurrentTime(new Date())
    }
    
    updateGreeting()
    const interval = setInterval(updateGreeting, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.1rem' }}>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: '2.4rem' }}>
            {greeting}, <span className="hero-doodle">{user?.username || 'friend'}!</span> 👋
          </h2>
          <p style={{ marginTop: 6, fontSize: '0.9rem', color: 'var(--ink-faint)' }}>
            Your personal handwriting intelligence studio
          </p>
        </div>
        <Link to="/generate" className="btn btn-yellow">
          ✨ Generate New Note
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card yellow">
          <div className="stat-label">Total Notes</div>
          <div className="stat-value">{stats?.total_notes ?? 0}</div>
          <div className="stat-icon">📝</div>
        </div>
        <div className="stat-card mint">
          <div className="stat-label">Favorites</div>
          <div className="stat-value">{stats?.favorites ?? 0}</div>
          <div className="stat-icon">⭐</div>
        </div>
        <div className="stat-card sky">
          <div className="stat-label">Writing Samples</div>
          <div className="stat-value">{stats?.samples ?? 0}</div>
          <div className="stat-icon">🖊️</div>
        </div>
        <div className="stat-card coral">
          <div className="stat-label">Subjects</div>
          <div className="stat-value">{stats?.subjects?.length ?? 0}</div>
          <div className="stat-icon">📚</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { icon: '📄', label: 'Upload & Convert', sub: 'Image, PDF, text', to: '/generate', bg: 'var(--sky)', border: 'var(--sky-dark)' },
          { icon: '✏️', label: 'Write a Note', sub: 'Type or paste content', to: '/generate?tab=text', bg: 'var(--yellow-light)', border: 'var(--yellow)' },
          { icon: '🖊️', label: 'Add Handwriting', sub: 'Upload a sample', to: '/samples', bg: 'var(--mint)', border: 'var(--mint-dark)' },
          { icon: '⭐', label: 'Favorites', sub: 'Starred notes', to: '/favorites', bg: 'var(--coral-light)', border: 'var(--coral)' },
        ].map(q => (
          <Link
            key={q.to}
            to={q.to}
            style={{
              background: q.bg, border: `2px dashed ${q.border}`,
              borderRadius: 'var(--radius)', padding: '18px 20px',
              textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 12
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            <span style={{ fontSize: '1.8rem' }}>{q.icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)' }}>{q.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>{q.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Notes */}
      <div className="page-header">
        <h2 style={{ fontSize: '1.7rem' }}>Recent Notes 📋</h2>
        <Link to="/notes" className="btn btn-outline btn-sm">View all →</Link>
      </div>

      {recentNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No notes yet!</h3>
          <p>Generate your first AI-powered note in seconds</p>
          <Link to="/generate" className="btn btn-yellow" style={{ marginTop: 12 }}>
            ✨ Create your first note
          </Link>
        </div>
      ) : (
        <div className="notes-grid">
          {recentNotes.map((note, i) => (
            <div
              key={note.id}
              className={`note-card ${ACCENTS[i % ACCENTS.length]}`}
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              <div className="note-card-header">
                <span className={`note-card-subject ${getSubjectClass(note.subject)}`}>
                  {note.subject}
                </span>
                {note.is_favorite && <span style={{ marginLeft: 'auto', fontSize: '0.9rem' }}>⭐</span>}
              </div>
              <h3 className="note-card-title">{note.title}</h3>
              <p className="note-card-preview">{note.preview || 'No preview available'}</p>
              <div className="note-card-footer">
                <span className="note-card-date">
                  {note.created_at ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true }) : 'Recently'}
                </span>
                {Array.isArray(note.tags) && note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subjects breakdown */}
      {stats?.subjects?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>By Subject 📚</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {stats.subjects.map(s => (
              <Link
                key={s.subject}
                to={`/notes?subject=${s.subject}`}
                className="filter-chip"
                style={{ textDecoration: 'none' }}
              >
                {s.subject} — {s.count}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
