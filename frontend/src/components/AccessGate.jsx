import { useState } from 'react'
import { Lock } from './icons'

// A simple site-wide access gate. When VITE_ACCESS_PASSWORD is set (production),
// the whole app sits behind a single shared password. Once entered correctly the
// unlock is remembered for the browser session. The per-user login still protects
// each workspace's data behind this gate. When no password is configured (local
// dev) the gate is bypassed entirely.
const ACCESS_PASSWORD = import.meta.env.VITE_ACCESS_PASSWORD
const STORAGE_KEY = 'site_unlocked'

export default function AccessGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    !ACCESS_PASSWORD || sessionStorage.getItem(STORAGE_KEY) === 'true',
  )
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value === ACCESS_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError('Incorrect password.')
    }
  }

  if (unlocked) {
    return children
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <Lock className="h-5 w-5 text-brand" />
          <h1 className="text-2xl font-bold tracking-tight text-white">PulseBoard</h1>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          This site is password protected. Enter the access password to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="label" htmlFor="access-password">
              Access password
            </label>
            <input
              id="access-password"
              type="password"
              className="field"
              autoFocus
              placeholder="••••••••"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError('')
              }}
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-bad/30 bg-bad/10 px-3.5 py-2.5 text-sm text-bad">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full">
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}
