import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../utils/api'

const SUBJECT_COLORS = {
  Math: 'subject-math', Science: 'subject-science',
  History: 'subject-history', English: 'subject-english',
  General: 'subject-general', CS: 'subject-cs',
}

export default function TrashPage() {
  const navigate = useNavigate()
  const [deletedNotes, setDeletedNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    loadTrash()
  }, [page])

  const loadTrash = async () => {
    setLoading(true)
    try {
      const res = await api.get('/trash', { params: { page, limit: 12 } })
      setDeletedNotes(res.data.deleted_notes)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch {
      toast.error('Failed to load trash')
      setDeletedNotes([])
    } finally {
      setLoading(false)
    }
  }

  const restoreNote = async (noteId) => {
    try {
      await api.post(`/trash/${noteId}/restore`)
      toast.success('Note restored! ✨')
      setDeletedNotes(deletedNotes.filter(n => n.id !== noteId))
      setTotal(total - 1)
    } catch {
      toast.error('Failed to restore note')
    }
  }

  const permanentlyDelete = async (noteId) => {
    if (!confirm('Permanently delete this note? This cannot be undone.')) return
    try {
      await api.delete(`/trash/${noteId}`)
      toast.success('Note permanently deleted')
      setDeletedNotes(deletedNotes.filter(n => n.id !== noteId))
      setTotal(total - 1)
    } catch {
      toast.error('Failed to delete note')
    }
  }

  return (
    <div className="trash-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/notes')}
        >
          ← Back to Notes
        </button>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-hand)', fontSize: '1.8rem' }}>🗑️ Trash</h1>
        <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--ink-faint)' }}>
          {total} {total === 1 ? 'note' : 'notes'} in trash
        </span>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <p style={{ fontFamily: 'var(--font-hand)' }}>Loading trash...</p>
        </div>
      ) : deletedNotes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--ink-faint)',
          fontFamily: 'var(--font-body)'
        }}>
          <p style={{ fontSize: '3rem', margin: '20px 0' }}>✨</p>
          <p>Your trash is empty!</p>
        </div>
      ) : (
        <>
          {/* Deleted notes grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {deletedNotes.map(note => (
              <div
                key={note.id}
                style={{
                  background: 'var(--cream)',
                  border: '2px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.3s ease',
                  opacity: 0.8
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
              >
                <div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontFamily: 'var(--font-hand)',
                    fontSize: '1rem',
                    color: 'var(--ink)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {note.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: 'var(--ink-faint)',
                    fontFamily: 'var(--font-body)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4
                  }}>
                    {note.preview || 'No content'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                  <span className={`note-card-subject ${SUBJECT_COLORS[note.subject] || 'subject-general'}`}
                    style={{ padding: '2px 8px', borderRadius: 99, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                    {note.subject}
                  </span>
                  {note.deleted_at && (
                    <span style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)' }}>
                      🗑️ {format(new Date(note.deleted_at), 'MMM d')}
                    </span>
                  )}
                </div>

                {Array.isArray(note.tags) && note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {note.tags.map(tag => (
                      <span key={tag} className="tag" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: 'auto',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border)'
                }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => restoreNote(note.id)}
                    style={{ flex: 1, fontSize: '0.75rem' }}
                  >
                    ↩️ Restore
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => permanentlyDelete(note.id)}
                    style={{
                      flex: 1,
                      fontSize: '0.75rem',
                      color: 'var(--coral)',
                      borderColor: 'var(--coral)'
                    }}
                  >
                    🗑️ Permanently delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '24px'
            }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ← Previous
              </button>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem'
              }}>
                Page {page} of {pages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= pages}
                onClick={() => setPage(p => p + 1)}
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
