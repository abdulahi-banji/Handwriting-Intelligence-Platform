import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../utils/api'

const SUBJECT_COLORS = {
  Math: 'subject-math', Science: 'subject-science',
  History: 'subject-history', English: 'subject-english',
  General: 'subject-general', CS: 'subject-cs',
}

export default function NoteViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')

  useEffect(() => {
    api.get(`/notes/${id}`)
      .then(res => {
        setNote(res.data)
        setEditTitle(res.data.title)
      })
      .catch(() => {
        toast.error('Note not found')
        navigate('/notes')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const toggleFavorite = async () => {
    try {
      await api.patch(`/notes/${id}`, { is_favorite: !note.is_favorite })
      setNote(prev => ({ ...prev, is_favorite: !prev.is_favorite }))
      toast.success(note.is_favorite ? 'Removed from favorites' : 'Added ⭐')
    } catch {
      toast.error('Failed to update')
    }
  }

  const saveTitle = async () => {
    if (!editTitle.trim()) return
    try {
      await api.patch(`/notes/${id}`, { title: editTitle })
      setNote(prev => ({ ...prev, title: editTitle }))
      setEditing(false)
      toast.success('Title updated!')
    } catch {
      toast.error('Failed to update title')
    }
  }

  const deleteNote = async () => {
    if (!confirm('Delete this note permanently?')) return
    try {
      await api.delete(`/notes/${id}`)
      toast.success('Note deleted')
      navigate('/notes')
    } catch {
      toast.error('Delete failed')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(note.processed_content || '')
    toast.success('Copied to clipboard! 📋')
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <p style={{ fontFamily: 'var(--font-hand)' }}>Loading note...</p>
      </div>
    )
  }

  if (!note) return null

  return (
    <div className="note-view-page">
      {/* Back button */}
      <button
        className="btn btn-outline btn-sm"
        onClick={() => navigate('/notes')}
        style={{ marginBottom: 20 }}
      >
        ← Back to Notes
      </button>

      {/* Note header */}
      <div className="note-view-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          {editing ? (
            <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
              <input
                className="form-input"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveTitle()}
                autoFocus
                style={{ flex: 1, minWidth: 200 }}
              />
              <button className="btn btn-primary btn-sm" onClick={saveTitle}>Save</button>
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <h1 style={{ flex: 1, cursor: 'pointer' }} onClick={() => setEditing(true)} title="Click to edit">
              {note.title}
              <span style={{ fontSize: '0.7em', marginLeft: 10, opacity: 0.4 }}>✏️</span>
            </h1>
          )}
        </div>

        {/* Meta */}
        <div className="note-meta">
          <span className={`note-card-subject ${SUBJECT_COLORS[note.subject] || 'subject-general'}`}
            style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
            {note.subject}
          </span>
          {note.created_at && (
            <span>📅 {format(new Date(note.created_at), 'MMMM d, yyyy')}</span>
          )}
          {note.updated_at && note.updated_at !== note.created_at && (
            <span>✏️ Updated {format(new Date(note.updated_at), 'MMM d')}</span>
          )}
          <span style={{ color: note.is_favorite ? 'var(--coral)' : 'var(--ink-faint)', cursor: 'pointer' }}
            onClick={toggleFavorite}>
            {note.is_favorite ? '⭐ Favorited' : '☆ Favorite'}
          </span>
        </div>

        {/* Tags */}
        {Array.isArray(note.tags) && note.tags.length > 0 && (
          <div className="tags-row" style={{ marginTop: 10 }}>
            {note.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-outline btn-sm" onClick={copyToClipboard}>
          📋 Copy Content
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={toggleFavorite}
          style={{ color: note.is_favorite ? 'var(--coral)' : undefined }}
        >
          {note.is_favorite ? '⭐ Unfavorite' : '☆ Favorite'}
        </button>
        <button
          className="btn btn-sm"
          onClick={deleteNote}
          style={{ background: 'var(--coral-light)', color: '#8b2500', border: '2px solid var(--coral)', marginLeft: 'auto' }}
        >
          🗑️ Delete
        </button>
      </div>

      {/* Note content — rendered as handwritten notebook */}
      <div style={{ position: 'relative' }}>
        {/* Paper holes */}
        <div style={{
          position: 'absolute', left: 24, top: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
          alignItems: 'center', width: 24, pointerEvents: 'none', zIndex: 1
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: 'var(--cream)', border: '2px solid rgba(168, 212, 240, 0.5)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }} />
          ))}
        </div>

        <div className="note-content-area" style={{ paddingLeft: 64 }}>
          {note.processed_content || note.original_content || 'No content available.'}
        </div>
      </div>

      {/* Original content toggle */}
      {note.original_content && note.original_content !== note.processed_content && (
        <details style={{ marginTop: 24 }}>
          <summary style={{
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            fontSize: '0.82rem', color: 'var(--ink-faint)',
            padding: '10px 0', userSelect: 'none'
          }}>
            📄 View Original Content
          </summary>
          <div style={{
            background: 'var(--cream-dark)', borderRadius: 10,
            padding: '16px 20px', marginTop: 10,
            fontFamily: 'var(--font-body)', fontSize: '0.85rem',
            color: 'var(--ink-light)', whiteSpace: 'pre-wrap',
            lineHeight: 1.7, border: '2px dashed var(--border)'
          }}>
            {note.original_content}
          </div>
        </details>
      )}
    </div>
  )
}
