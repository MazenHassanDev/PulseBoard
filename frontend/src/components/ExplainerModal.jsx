import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Sparkle, Close } from './icons'
import { platformMeta } from '../lib/platforms'

// Fetches and displays the AI performance explanation for one campaign.
export default function ExplainerModal({ campaign, onClose }) {
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api
      .get(`/api/campaigns/${campaign.id}/explain/`)
      .then(({ data }) => {
        if (active) setExplanation(data.explanation)
      })
      .catch((err) => {
        if (active)
          setError(
            err.response?.data?.detail ||
              'Couldn’t generate an explanation right now. Please try again.',
          )
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [campaign.id])

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const meta = platformMeta(campaign.platform)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg border-line p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Sparkle className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                AI explainer
              </div>
              <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: meta.dot }}
                />
                {meta.label}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-panel-2 hover:text-zinc-200"
            aria-label="Close"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 min-h-[8rem]">
          {loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
                Analysing this campaign&apos;s numbers…
              </div>
              <div className="space-y-2.5">
                <div className="h-3 w-full animate-pulse rounded bg-panel-2" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-panel-2" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-panel-2" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-panel-2" />
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
              {error}
            </div>
          )}

          {!loading && !error && (
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-zinc-300">
              {explanation}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
