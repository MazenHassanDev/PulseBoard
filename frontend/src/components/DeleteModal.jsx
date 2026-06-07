import { useEffect } from 'react'
import { Trash, Close } from './icons'

// Confirmation dialog for deleting a campaign.
export default function DeleteModal({ campaign, onConfirm, onClose, deleting }) {
  // Close on Escape (ignored while a delete is in flight).
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !deleting && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, deleting])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => !deleting && onClose()}
    >
      <div
        className="card w-full max-w-lg border-line p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bad/15 text-bad">
              <Trash className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bad">
                Delete campaign
              </div>
              <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-panel-2 hover:text-zinc-200 disabled:opacity-50"
            aria-label="Close"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-zinc-400">
          This removes the campaign and its metrics from your dashboard. This
          can&apos;t be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={deleting} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl bg-bad px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-bad/90 disabled:opacity-60"
          >
            <Trash className="h-4 w-4" />
            {deleting ? 'Deleting…' : 'Delete campaign'}
          </button>
        </div>
      </div>
    </div>
  )
}
