import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { Upload, Download } from '../components/icons'

const COLUMNS = 'campaign_name, platform, spend, impressions, clicks, conversions, revenue'

const SAMPLE_CSV = `campaign_name,platform,spend,impressions,clicks,conversions,revenue
Spring Launch — Prospecting,google,3600,268000,9100,540,22400
Always-On Retargeting,meta,5200,410000,14200,880,31400
Summer Escapes,tiktok,11200,3120000,41600,520,24600
`

export default function UploadCSV() {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const pickFile = (f) => {
    setError('')
    setResult(null)
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file.')
      return
    }
    setFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files?.[0])
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/api/campaigns/upload/', formData)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pulseboard-sample.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Data entry</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Upload CSV</h1>
          <p className="mt-1.5 max-w-xl text-sm text-zinc-400">
            Bulk-import campaigns. Each row is validated — invalid rows are skipped and
            reported with a reason.
          </p>
        </div>
        <button onClick={downloadSample} className="btn-ghost shrink-0">
          <Download className="h-4 w-4" />
          Sample CSV
        </button>
      </div>

      {/* Drop zone */}
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition ${
          dragging
            ? 'border-brand/70 bg-brand/5'
            : 'border-line bg-panel hover:border-zinc-600'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-panel-2 text-zinc-400">
          <Upload className="h-6 w-6" />
        </span>
        <div className="mt-4 text-[15px] font-medium text-zinc-200">
          {file ? file.name : 'Drop your CSV here, or click to browse'}
        </div>
        <div className="mt-1 text-xs text-zinc-600">Columns: {COLUMNS}</div>
      </label>

      {file && (
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setFile(null)
              setResult(null)
              setError('')
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            Clear
          </button>
          <button onClick={upload} className="btn-primary" disabled={uploading}>
            <Upload className="h-4 w-4" />
            {uploading ? 'Importing…' : 'Import campaigns'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
          {error}
        </div>
      )}

      {/* Import results */}
      {result && (
        <div className="card mt-6 p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-good/15 px-2.5 py-1 text-sm font-semibold text-good">
              {result.imported} imported
            </span>
            <span
              className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${
                result.skipped ? 'bg-warn/15 text-warn' : 'bg-panel-2 text-zinc-400'
              }`}
            >
              {result.skipped} skipped
            </span>
          </div>

          {result.errors?.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-sm font-medium text-zinc-300">Skipped rows</div>
              <div className="overflow-hidden rounded-xl border border-line-soft">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line-soft bg-panel-2 text-[11px] uppercase tracking-wider text-zinc-500">
                      <th className="w-16 px-4 py-2.5 text-left font-medium">Row</th>
                      <th className="px-4 py-2.5 text-left font-medium">Campaign</th>
                      <th className="px-4 py-2.5 text-left font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err, i) => (
                      <tr key={i} className="border-b border-line-soft/60 last:border-0">
                        <td className="px-4 py-2.5 tabular-nums text-zinc-500">{err.row}</td>
                        <td className="px-4 py-2.5 text-zinc-300">{err.campaign || '—'}</td>
                        <td className="px-4 py-2.5 text-zinc-400">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.imported > 0 && (
            <Link
              to="/dashboard"
              className="mt-5 inline-flex text-sm font-semibold text-brand hover:text-brand-600"
            >
              View campaigns on the dashboard →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
