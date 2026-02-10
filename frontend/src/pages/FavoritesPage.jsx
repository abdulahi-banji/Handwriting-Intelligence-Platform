import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../utils/api'

const ACCENTS = ['accent-yellow', 'accent-mint', 'accent-coral', 'accent-sky', 'accent-lavender', 'accent-pink']
const SUBJECT_COLORS = {
  Math: 'subject-math', Science: 'subject-science',
  History: 'subject-history', English: 'subject-english',
  General: 'subject-general', CS: 'subject-cs',
}

export default function FavoritesPage() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch all notes and filter favorites (or ideally backend filters)
    api.get('/notes?limit=100')
      .then(r => setNotes((r.data.notes || []).filter(n => n.is_favorite)))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const unfavorite = async (e, note) => {
    e.stopPropagation()
    try {
      await api.patch(`/notes/${note.id}`, { is_favorite: false })
      setNotes(prev => prev.filter(n => n.id !== note.id))
      toast.success('Removed from favorites')
    } catch { toast.error('Failed to update') }
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div>
          <h2>Favorites ⭐</h2>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>
            {notes.length} starred note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>No favorites yet!</h3>
          <p>Star notes you love to find them quickly here</p>
          <button className="btn btn-yellow" onClick={() => navigate('/notes')} style={{ marginTop: 12 }}>
            Browse Notes →
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note, i) => (
            <div
              key={note.id}
              className={`note-card ${ACCENTS[i % ACCENTS.length]}`}
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              <div className="note-card-header">
                <span className={`note-card-subject ${SUBJECT_COLORS[note.subject] || 'subject-general'}`}>
                  {note.subject}
                </span>
                <button
                  className="icon-btn fav active"
                  onClick={e => unfavorite(e, note)}
                  title="Remove from favorites"
                  style={{ marginLeft: 'auto' }}
                >
                  ⭐
                </button>
              </div>
              <h3 className="note-card-title">{note.title}</h3>
              <p className="note-card-preview">{note.preview || 'No preview'}</p>
              <div className="note-card-footer">
                <span className="note-card-date">
                  {note.created_at ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true }) : 'Recently'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
