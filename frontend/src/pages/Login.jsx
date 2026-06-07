import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import AuthAside from '../components/AuthAside'
import { Lock } from '../components/icons'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // SimpleJWT's token endpoint authenticates against the username field.
      const { data } = await api.post('/api/auth/login/', { username, password })
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      localStorage.setItem('username', username)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'We couldn’t sign you in. Check your credentials and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-ink">
      <AuthAside />

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to your PulseBoard workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                className="field"
                autoComplete="username"
                placeholder="testuser"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="field"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-bad/30 bg-bad/10 px-3.5 py-2.5 text-sm text-bad">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line-soft bg-panel px-3.5 py-3 text-sm text-zinc-400">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <span>Your data is private — each workspace only sees its own campaigns.</span>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            New to PulseBoard?{' '}
            <Link to="/register" className="font-semibold text-brand hover:text-brand-600">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
