import { NavLink, useNavigate } from 'react-router-dom'
import { Grid, Plus, Upload, Pulse, Logout } from './icons'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: Grid },
  { to: '/add', label: 'Add Campaign', Icon: Plus },
  { to: '/upload', label: 'Upload CSV', Icon: Upload },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Account'
  const email = localStorage.getItem('email') || ''
  const initial = username.charAt(0).toUpperCase()

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    [
      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
      isActive
        ? 'bg-brand/15 text-white ring-1 ring-brand/30'
        : 'text-zinc-400 hover:bg-panel-2 hover:text-zinc-200',
    ].join(' ')

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line-soft bg-ink px-4 py-6">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-[0_8px_20px_-6px_rgba(124,92,251,0.8)]">
          <Pulse className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold text-white">PulseBoard</div>
          <div className="text-xs text-zinc-500">Campaign Performance</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-8 flex flex-col gap-1">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          Workspace
        </div>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Account + logout pinned to the bottom */}
      <div className="mt-auto">
        <div className="flex items-center gap-3 rounded-xl border border-line-soft bg-panel px-3 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 text-sm font-semibold text-brand">
            {initial}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-medium text-zinc-100">{username}</div>
            {email && <div className="truncate text-xs text-zinc-500">{email}</div>}
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-panel-2 hover:text-zinc-200"
        >
          <Logout className="h-[18px] w-[18px]" />
          Log out
        </button>
      </div>
    </aside>
  )
}
