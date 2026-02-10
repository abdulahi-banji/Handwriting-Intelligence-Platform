import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function SamplesPage() {
  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [sampleName, setSampleName] = useState('')
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) setFile(accepted[0])
    }
  })

  const fetchSamples = () => {
    api.get('/samples')
      .then(r => setSamples(r.data))
      .catch(() => toast.error('Failed to load samples'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSamples() }, [])

  const handleUpload = async () => {
    if (!file) { toast.error('Please select an image first'); return }
    const name = sampleName.trim() || 'My Handwriting'
    setUploading(true)
    setUploadProgress(20)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('sample_name', name)

      setUploadProgress(60)
      const res = await api.post('/samples/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadProgress(100)

      setSamples(prev => [res.data, ...prev])
      setFile(null)
      setSampleName('')
      setUploadProgress(0)
      toast.success('Handwriting sample uploaded & analyzed! 🖊️')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <div>
          <h2>Handwriting Samples 🖊️</h2>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>
            Upload samples of your writing — we'll learn your style
          </p>
        </div>
      </div>

      {/* How it works */}
      <div style={{
        background: 'var(--sky)', border: '2px dashed var(--sky-dark)',
        borderRadius: 'var(--radius)', padding: '18px 22px', marginBottom: 28
      }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>✨ How it works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { n: '1', t: 'Upload', d: 'Photo of your handwritten notes', i: '📸' },
            { n: '2', t: 'OCR Scan', d: 'We extract your writing patterns', i: '🔍' },
            { n: '3', t: 'AI Analysis', d: 'Gemini learns your style', i: '🤖' },
            { n: '4', t: 'Apply', d: 'Choose your style when generating', i: '✅' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--sky-dark)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-hand)', fontSize: '0.9rem', fontWeight: 700, flexShrink: 0
              }}>{s.n}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.82rem' }}>{s.i} {s.t}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-light)' }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload form */}
      <div className="card" style={{ padding: 28, marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: 20 }}>📤 Upload New Sample</h3>

        <div className="form-group">
          <label className="form-label">Sample Name</label>
          <input
            className="form-input"
            placeholder="e.g. My Print Writing, Cursive Style..."
            value={sampleName}
            onChange={e => setSampleName(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>

        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}
          style={{ maxWidth: 480 }}>
          <input {...getInputProps()} />
          {file ? (
            <div>
              <span className="dropzone-icon">🖼️</span>
              <p style={{ fontFamily: 'var(--font-hand)', color: 'var(--mint-dark)', fontSize: '1.1rem' }}>
                {file.name}
              </p>
              <span>{(file.size / 1024).toFixed(1)} KB — click to change</span>
            </div>
          ) : (
            <div>
              <span className="dropzone-icon">{isDragActive ? '📸' : '🖊️'}</span>
              <p>{isDragActive ? 'Drop your handwriting sample!' : 'Upload a photo of your handwriting'}</p>
              <span>Clear, well-lit photos work best (JPG, PNG)</span>
            </div>
          )}
        </div>

        {uploading && (
          <div style={{ maxWidth: 480, marginTop: 12 }}>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginTop: 6, fontFamily: 'var(--font-note)' }}>
              {uploadProgress < 50 ? '📤 Uploading...' : uploadProgress < 90 ? '🔍 Analyzing handwriting...' : '✅ Almost done!'}
            </p>
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading || !file}
          style={{ marginTop: 20 }}
        >
          {uploading ? (
            <>
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Processing...
            </>
          ) : '🖊️ Upload & Analyze Sample'}
        </button>
      </div>

      {/* Samples list */}
      <h3 style={{ fontSize: '1.4rem', marginBottom: 18 }}>
        Your Samples ({samples.length})
      </h3>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : samples.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🖊️</div>
          <h3>No samples yet</h3>
          <p>Upload your first handwriting sample to personalize your notes!</p>
        </div>
      ) : (
        <div className="samples-grid">
          {samples.map(s => (
            <div key={s.id} className="sample-card">
              <div style={{
                width: '100%', height: 80, borderRadius: 8,
                background: 'var(--cream-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12, overflow: 'hidden', border: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '2rem' }}>🖊️</span>
              </div>
              <h4>{s.sample_name}</h4>
              <p style={{ marginBottom: 8 }}>
                {s.created_at ? formatDistanceToNow(new Date(s.created_at), { addSuffix: true }) : 'Recently'}
              </p>

              {s.style_data && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {s.style_data.font_style && (
                    <span className="tag">{s.style_data.font_style}</span>
                  )}
                  {s.style_data.slant && (
                    <span className="tag">slant: {s.style_data.slant}</span>
                  )}
                </div>
              )}

              {s.ocr_text && (
                <details style={{ marginTop: 10 }}>
                  <summary style={{
                    fontSize: '0.72rem', color: 'var(--sky-dark)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)'
                  }}>
                    View extracted text
                  </summary>
                  <p style={{
                    fontSize: '0.75rem', fontFamily: 'var(--font-note)',
                    color: 'var(--ink-light)', marginTop: 6, lineHeight: 1.6,
                    background: 'var(--cream)', padding: '8px', borderRadius: 6
                  }}>
                    {s.ocr_text.slice(0, 200)}{s.ocr_text.length > 200 ? '...' : ''}
                  </p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
