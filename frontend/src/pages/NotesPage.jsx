import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../utils/api'

const SUBJECTS = ['All', 'General', 'Math', 'Science', 'History', 'English', 'CS']
const ACCENTS = ['accent-yellow', 'accent-mint', 'accent-coral', 'accent-sky', 'accent-lavender', 'accent-pink']

const SUBJECT_COLORS = {
  Math: 'subject-math', Science: 'subject-science',
  History: 'subject-history', English: 'subject-english',
  General: 'subject-general', CS: 'subject-cs',
}

export default function NotesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState(searchParams.get('subject') || 'All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (subject !== 'All') params.set('subject', subject)
      if (search) params.set('search', search)
      const res = await api.get(`/notes?${params}`)
      setNotes(res.data.notes)
      setTotalPages(res.data.pages)
      setTotal(res.data.total)
    } catch {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [page, subject, search])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const toggleFavorite = async (e, note) => {
    e.stopPropagation()
    try {
      await api.patch(`/notes/${note.id}`, { is_favorite: !note.is_favorite })
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_favorite: !n.is_favorite } : n))
      toast.success(note.is_favorite ? 'Removed from favorites' : 'Added to favorites ⭐')
    } catch {
      toast.error('Failed to update note')
    }
  }

  const deleteNote = async (e, noteId) => {
    e.stopPropagation()
    if (!confirm('Delete this note?')) return
    try {
      await api.delete(`/notes/${noteId}`)
      setNotes(prev => prev.filter(n => n.id !== noteId))
      toast.success('Note deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div>
          <h2>My Notes 📝</h2>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>
            {total} note{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button className="btn btn-yellow" onClick={() => navigate('/generate')}>
          ✨ New Note
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div className="search-bar" style={{ borderRadius: 12, maxWidth: 400 }}>
          <span>🔍</span>
          <input
            placeholder="Search notes..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Subject filters */}
      <div className="filter-bar">
        {SUBJECTS.map(s => (
          <button
            key={s}
            className={`filter-chip ${subject === s ? 'active' : ''}`}
            onClick={() => { setSubject(s); setPage(1) }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <p style={{ fontFamily: 'var(--font-hand)' }}>Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>{search ? 'No notes found' : 'No notes yet!'}</h3>
          <p>{search ? `No results for "${search}"` : 'Create your first AI-powered note!'}</p>
          <button className="btn btn-yellow" onClick={() => navigate('/generate')} style={{ marginTop: 12 }}>
            ✨ Generate a Note
          </button>
        </div>
      ) : (
        <>
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
                  <div className="note-card-actions" style={{ marginLeft: 'auto' }}>
                    <button
                      className={`icon-btn fav ${note.is_favorite ? 'active' : ''}`}
                      onClick={e => toggleFavorite(e, note)}
                      title={note.is_favorite ? 'Unfavorite' : 'Favorite'}
                    >
                      {note.is_favorite ? '⭐' : '☆'}
                    </button>
                    <button
                      className="icon-btn"
                      onClick={e => deleteNote(e, note.id)}
                      title="Delete"
                      style={{ color: 'var(--coral)' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h3 className="note-card-title">{note.title}</h3>
                <p className="note-card-preview">{note.preview || 'No preview available...'}</p>

                {Array.isArray(note.tags) && note.tags.length > 0 && (
                  <div className="tags-row" style={{ marginBottom: 10 }}>
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="note-card-footer">
                  <span className="note-card-date">
                    {note.created_at ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true }) : 'Recently'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--sky-dark)', fontFamily: 'var(--font-body)' }}>
                    Open →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span style={{
                padding: '6px 16px', fontFamily: 'var(--font-hand)',
                fontSize: '1rem', color: 'var(--ink)'
              }}>
                {page} / {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
