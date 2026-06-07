import { Pulse, Grid, TrendUp, Sparkle } from './icons'

const FEATURES = [
  { Icon: Grid, text: 'Sortable, filterable campaign table' },
  { Icon: TrendUp, text: 'ROAS visualised across every campaign' },
  { Icon: Sparkle, text: 'Plain-English AI performance explainer' },
]

// The dark marketing panel shown beside the auth forms.
export default function AuthAside() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
      {/* Layered violet glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1230] via-[#120f22] to-[#0a0a0d]" />
      <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-brand/25 blur-[120px]" />
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="relative z-10 p-10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-[0_8px_20px_-6px_rgba(124,92,251,0.8)]">
            <Pulse className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold text-white">PulseBoard</span>
        </div>
      </div>

      <div className="relative z-10 p-10">
        <h1 className="max-w-md text-4xl font-bold leading-[1.1] tracking-tight text-white">
          Every client campaign, ranked by what actually performs.
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-zinc-400">
          Import spend, track CTR, CPC and ROAS, and let AI explain what&apos;s
          working — in one calm dashboard.
        </p>

        <ul className="mt-9 space-y-4">
          {FEATURES.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white/5 text-brand">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
