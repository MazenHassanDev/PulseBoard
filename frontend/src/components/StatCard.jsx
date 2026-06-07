import { ChevronDown } from './icons'

const HINT_TONES = {
  good: 'bg-good/15 text-good',
  bad: 'bg-bad/15 text-bad',
  muted: 'bg-panel-2 text-zinc-400',
}

// A single headline metric tile for the top of the dashboard.
export default function StatCard({ label, value, hint, hintTone = 'muted', Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-panel-2 text-zinc-500">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-white tabular-nums">
        {value}
      </div>
      {hint && (
        <span
          className={`mt-3 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${HINT_TONES[hintTone]}`}
        >
          {hintTone === 'good' && <ChevronDown className="h-3 w-3 rotate-180" />}
          {hint}
        </span>
      )}
    </div>
  )
}
