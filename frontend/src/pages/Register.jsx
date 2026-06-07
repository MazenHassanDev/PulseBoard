import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import AuthAside from '../components/AuthAside'

// Flattens DRF field-error objects into readable lines.
function readErrors(data) {
  if (!data) return ['Something went wrong. Please try again.']
  if (typeof data === 'string') return [data]
  return Object.entries(data).flatMap(([field, msgs]) =>
    (Array.isArray(msgs) ? msgs : [msgs]).map((m) =>
      field === 'detail' ? m : `${field}: ${m}`,
    ),
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)
    try {
      // Register returns JWT tokens, so sign the user straight in.
      const { data } = await api.post('/api/auth/register/', form)
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      localStorage.setItem('username', form.username)
      localStorage.setItem('email', form.email)
      navigate('/dashboard')
    } catch (err) {
      setErrors(readErrors(err.response?.data))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-ink">
      <AuthAside />

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create your workspace
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Start tracking campaign performance in minutes.
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
                placeholder="alex"
                value={form.username}
                onChange={update('username')}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field"
                autoComplete="email"
                placeholder="you@agency.co"
                value={form.email}
                onChange={update('email')}
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
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={update('password')}
                required
              />
            </div>

            {errors.length > 0 && (
              <div className="space-y-1 rounded-xl border border-bad/30 bg-bad/10 px-3.5 py-2.5 text-sm text-bad">
                {errors.map((msg, i) => (
                  <div key={i}>{msg}</div>
                ))}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand hover:text-brand-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
