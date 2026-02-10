import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import api from '../utils/api'

const SUBJECTS = ['General', 'Math', 'Science', 'History', 'English', 'CS', 'Other']

export default function GeneratePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'text' ? 'text' : 'upload')
  const [samples, setSamples] = useState([])
  const [selectedSample, setSelectedSample] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState(0) // 0=idle, 1=uploading, 2=ocr, 3=ai, 4=saving

  // Form fields
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('General')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    api.get('/samples').then(r => setSamples(r.data)).catch(() => {})
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md'],
    },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) {
        setFile(accepted[0])
        if (!title) setTitle(accepted[0].name.replace(/\.[^.]+$/, ''))
      }
    }
  })

  const steps = [
    { icon: '📤', label: 'Uploading file...' },
    { icon: '🔍', label: 'OCR — extracting text...' },
    { icon: '🤖', label: 'Gemini AI restructuring...' },
    { icon: '💾', label: 'Saving your note...' },
  ]

  const handleGenerate = async () => {
    if (tab === 'upload' && !file) {
      toast.error('Please select a file first!')
      return
    }
    if (tab === 'text' && !content.trim()) {
      toast.error('Please enter some content!')
      return
    }
    if (!title.trim()) {
      toast.error('Please enter a title!')
      return
    }

    setLoading(true)
    setProcessingStep(1)

    try {
      const tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean)

      let noteData
      if (tab === 'upload') {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('title', title)
        fd.append('subject', subject)
        fd.append('tags', JSON.stringify(tagsArr))
        if (selectedSample) fd.append('sample_id', selectedSample)

        setProcessingStep(2)
        await new Promise(r => setTimeout(r, 600))
        setProcessingStep(3)

        const res = await api.post('/notes/generate', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        noteData = res.data
      } else {
        setProcessingStep(3)
        const res = await api.post('/notes/create', {
          title, subject, tags: tagsArr, content
        })
        noteData = res.data
      }

      setProcessingStep(4)
      await new Promise(r => setTimeout(r, 400))

      toast.success('Note generated! ✨')
      navigate(`/notes/${noteData.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Generation failed')
      setProcessingStep(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 740 }}>
      <div className="page-header">
        <div>
          <h2>Generate Note ✨</h2>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>
            Transform any content into beautiful AI-structured notes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>
          📄 Upload File
        </button>
        <button className={`tab ${tab === 'text' ? 'active' : ''}`} onClick={() => setTab('text')}>
          ✏️ Type Content
        </button>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label">Note Title 📌</label>
          <input
            className="form-input"
            placeholder="e.g. Big O Notation — CS201"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Subject + Tags row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject 📚</label>
            <select className="form-select" value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tags 🏷️</label>
            <input
              className="form-input"
              placeholder="algorithms, sorting, ..."
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>
        </div>

        {/* Content input */}
        {tab === 'upload' ? (
          <div className="form-group">
            <label className="form-label">Upload File 📎</label>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <span className="dropzone-icon">✅</span>
                  <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.1rem', color: 'var(--mint-dark)' }}>
                    {file.name}
                  </p>
                  <span>{(file.size / 1024).toFixed(1)} KB — click to change</span>
                </div>
              ) : (
                <div>
                  <span className="dropzone-icon">{isDragActive ? '🎯' : '📂'}</span>
                  <p>{isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}</p>
                  <span>JPG, PNG, PDF, TXT, MD supported</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">Your Content ✍️</label>
            <textarea
              className="form-textarea"
              placeholder="Paste or type your notes, lecture content, textbook excerpts..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 4 }}>
              {content.length} characters
            </span>
          </div>
        )}

        {/* Handwriting sample selector */}
        {samples.length > 0 && (
          <div className="form-group">
            <label className="form-label">Apply Handwriting Style 🖊️ <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 400, color: 'var(--ink-faint)' }}>(optional)</span></label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className={`filter-chip ${!selectedSample ? 'active' : ''}`}
                onClick={() => setSelectedSample(null)}
              >
                Default
              </button>
              {samples.map(s => (
                <button
                  key={s.id}
                  className={`filter-chip ${selectedSample === s.id ? 'active' : ''}`}
                  onClick={() => setSelectedSample(s.id)}
                >
                  🖊️ {s.sample_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {loading && (
          <div className="card" style={{ padding: '20px 24px', border: '2px solid var(--mint-dark)' }}>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.1rem', marginBottom: 14 }}>
              🤖 AI is working its magic...
            </div>
            {steps.map((step, i) => (
              <div key={i} className={`processing-step ${
                i + 1 < processingStep ? 'done' : i + 1 === processingStep ? 'active' : 'pending'
              }`}>
                <span>{i + 1 < processingStep ? '✅' : i + 1 === processingStep ? '⏳' : '○'}</span>
                {step.icon} {step.label}
              </div>
            ))}
            <div className="progress-bar-wrap" style={{ marginTop: 16 }}>
              <div className="progress-bar" style={{ width: `${(processingStep / 4) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          className="btn btn-yellow"
          onClick={handleGenerate}
          disabled={loading}
          style={{ justifyContent: 'center', fontSize: '1rem', padding: '13px 28px' }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Processing...
            </>
          ) : '✨ Generate Note'}
        </button>
      </div>
    </div>
  )
}
