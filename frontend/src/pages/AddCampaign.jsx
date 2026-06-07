import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { PLATFORMS } from '../lib/platforms'
import { money, percent, roasLabel, roasTone } from '../lib/format'
import { ChevronDown, Plus } from '../components/icons'

const EMPTY = {
  name: '',
  client: '',
  platform: '',
  spend: '',
  revenue: '',
  impressions: '',
  clicks: '',
  conversions: '',
}

const TONE_BAR = { good: 'bg-good', warn: 'bg-warn', bad: 'bg-bad' }

function flattenErrors(data) {
  if (!data) return ['Something went wrong. Please try again.']
  if (typeof data === 'string') return [data]
  return Object.entries(data).flatMap(([field, msgs]) =>
    (Array.isArray(msgs) ? msgs : [msgs]).map((m) =>
      field === 'detail' ? m : `${field}: ${m}`,
    ),
  )
}

// A labelled input with optional $ prefix and helper text.
function Field({ label, hint, prefix, ...props }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
            {prefix}
          </span>
        )}
        <input className={`field ${prefix ? 'pl-8' : ''}`} {...props} />
      </div>
      {hint && <p className="mt-1.5 text-xs text-zinc-600">{hint}</p>}
    </div>
  )
}

function MetricPreview({ label, value, tone }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line-soft bg-surface p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</div>
      {tone && <div className={`absolute inset-x-0 bottom-0 h-1 ${TONE_BAR[tone]}`} />}
    </div>
  )
}

export default function AddCampaign() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState([])
  const [saving, setSaving] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  // Live CTR / CPC / ROAS as the user types.
  const metrics = useMemo(() => {
    const spend = Number(form.spend) || 0
    const revenue = Number(form.revenue) || 0
    const impressions = Number(form.impressions) || 0
    const clicks = Number(form.clicks) || 0
    return {
      ctr: percent(impressions ? (clicks / impressions) * 100 : 0),
      cpc: clicks ? money(spend / clicks, 2) : '—',
      roas: spend ? roasLabel(revenue / spend) : '—',
      roasTone: spend ? roasTone(revenue / spend) : null,
    }
  }, [form])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setSaving(true)
    try {
      // `client` is a display-only field; the API model doesn't store it.
      await api.post('/api/campaigns/', {
        name: form.name,
        platform: form.platform,
        spend: form.spend,
        revenue: form.revenue,
        impressions: form.impressions,
        clicks: form.clicks,
        conversions: form.conversions,
      })
      navigate('/dashboard')
    } catch (err) {
      setErrors(flattenErrors(err.response?.data))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="eyebrow">Data entry</div>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Add campaign</h1>
      <p className="mt-1.5 text-sm text-zinc-400">
        Enter a single campaign manually. CTR, CPC and ROAS are computed automatically.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 p-6">
        {errors.length > 0 && (
          <div className="mb-5 space-y-1 rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
            {errors.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        )}

        <Field
          label="Campaign name"
          placeholder="e.g. Spring Launch — Prospecting"
          value={form.name}
          onChange={update('name')}
          required
        />

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Client"
            hint="Optional"
            placeholder="e.g. Glow Collective"
            value={form.client}
            onChange={update('client')}
          />
          <div>
            <label className="label">Platform</label>
            <div className="relative">
              <select
                className="field cursor-pointer appearance-none pr-9"
                value={form.platform}
                onChange={update('platform')}
                required
              >
                <option value="" disabled>
                  Select platform…
                </option>
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Spend"
            hint="Total amount spent"
            prefix="$"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={form.spend}
            onChange={update('spend')}
            required
          />
          <Field
            label="Revenue"
            hint="Attributed revenue"
            prefix="$"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={form.revenue}
            onChange={update('revenue')}
            required
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Impressions"
            hint="Times shown"
            type="number"
            min="0"
            placeholder="0"
            value={form.impressions}
            onChange={update('impressions')}
            required
          />
          <Field
            label="Clicks"
            hint="Total clicks"
            type="number"
            min="0"
            placeholder="0"
            value={form.clicks}
            onChange={update('clicks')}
            required
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Conversions"
            hint="Completed actions"
            type="number"
            min="0"
            placeholder="0"
            value={form.conversions}
            onChange={update('conversions')}
            required
          />
        </div>

        {/* Live computed metrics */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <MetricPreview label="CTR" value={metrics.ctr} />
          <MetricPreview label="CPC" value={metrics.cpc} />
          <MetricPreview label="ROAS" value={metrics.roas} tone={metrics.roasTone} />
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-line-soft pt-5">
          <span className="text-sm text-zinc-600">Metrics update as you type</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? 'Adding…' : 'Add campaign'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
