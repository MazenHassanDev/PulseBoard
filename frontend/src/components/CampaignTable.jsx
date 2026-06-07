import { useMemo, useState } from 'react'
import { PLATFORMS, platformMeta } from '../lib/platforms'
import {
  compactNumber,
  money,
  percent,
  roasLabel,
  roasTone,
} from '../lib/format'
import { Search, ChevronDown, ArrowDown, Sparkle, Trash } from './icons'

const TONE_CLASSES = {
  good: 'bg-good/15 text-good',
  warn: 'bg-warn/15 text-warn',
  bad: 'bg-bad/15 text-bad',
}

function PlatformBadge({ platform }) {
  const meta = platformMeta(platform)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-panel-2 px-2.5 py-1 text-xs font-medium text-zinc-300">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
      {meta.label}
    </span>
  )
}

function RoasBadge({ value }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${TONE_CLASSES[roasTone(value)]}`}
    >
      {roasLabel(value)}
    </span>
  )
}

// key: campaign field · label: header · numeric: right-align + numeric sort
const COLUMNS = [
  { key: 'name', label: 'Campaign', numeric: false },
  { key: 'platform', label: 'Platform', numeric: false },
  { key: 'spend', label: 'Spend', numeric: true },
  { key: 'impressions', label: 'Impr.', numeric: true },
  { key: 'clicks', label: 'Clicks', numeric: true },
  { key: 'conversions', label: 'Conv.', numeric: true },
  { key: 'revenue', label: 'Revenue', numeric: true },
  { key: 'ctr', label: 'CTR', numeric: true },
  { key: 'cpc', label: 'CPC', numeric: true },
  { key: 'roas', label: 'ROAS', numeric: true },
]

export default function CampaignTable({ campaigns, onExplain, onDelete, deletingId }) {
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('all')
  const [sort, setSort] = useState({ key: 'roas', dir: 'desc' })

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = campaigns.filter((c) => {
      const matchesQuery = !q || c.name.toLowerCase().includes(q)
      const matchesPlatform = platform === 'all' || c.platform === platform
      return matchesQuery && matchesPlatform
    })

    const { key, dir } = sort
    const col = COLUMNS.find((c) => c.key === key)
    list = [...list].sort((a, b) => {
      let cmp
      if (col?.numeric) {
        cmp = (Number(a[key]) || 0) - (Number(b[key]) || 0)
      } else {
        cmp = String(a[key]).localeCompare(String(b[key]))
      }
      return dir === 'asc' ? cmp : -cmp
    })
    return list
  }, [campaigns, query, platform, sort])

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' },
    )
  }

  const formatCell = (c, key) => {
    switch (key) {
      case 'spend':
      case 'revenue':
        return money(c[key], 0)
      case 'impressions':
      case 'clicks':
      case 'conversions':
        return compactNumber(c[key])
      case 'ctr':
        return percent(c.ctr)
      case 'cpc':
        return money(c.cpc, 2)
      default:
        return c[key]
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* Header: title + search + platform filter */}
      <div className="flex flex-col gap-3 border-b border-line-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Campaigns</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {rows.length} of {campaigns.length} shown
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              className="field w-52 pl-9"
              placeholder="Search campaigns…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="field w-40 cursor-pointer appearance-none pr-9"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="all">All platforms</option>
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-line-soft text-[11px] uppercase tracking-wider text-zinc-500">
              {COLUMNS.map((col) => {
                const active = sort.key === col.key
                return (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`cursor-pointer select-none px-4 py-3 font-medium hover:text-zinc-300 ${
                      col.numeric ? 'text-right' : 'text-left'
                    } ${active ? 'text-zinc-200' : ''}`}
                  >
                    <span
                      className={`inline-flex items-center gap-1 ${
                        col.numeric ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {col.label}
                      {active && (
                        <ArrowDown
                          className={`h-3 w-3 transition-transform ${
                            sort.dir === 'asc' ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </span>
                  </th>
                )
              })}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-4 py-12 text-center text-sm text-zinc-600"
                >
                  No campaigns match your filters.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-line-soft/60 transition last:border-0 hover:bg-panel-2/50"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-zinc-100">{c.name}</div>
                    {c.created_at && (
                      <div className="text-xs text-zinc-600">
                        Added{' '}
                        {new Date(c.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <PlatformBadge platform={c.platform} />
                  </td>
                  {['spend', 'impressions', 'clicks', 'conversions', 'revenue', 'ctr', 'cpc'].map(
                    (key) => (
                      <td
                        key={key}
                        className="px-4 py-3.5 text-right tabular-nums text-zinc-300"
                      >
                        {formatCell(c, key)}
                      </td>
                    ),
                  )}
                  <td className="px-4 py-3.5 text-right">
                    <RoasBadge value={c.roas} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onExplain(c)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand/15 px-2.5 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/25"
                      >
                        <Sparkle className="h-3.5 w-3.5" />
                        Explain
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(c)}
                          disabled={deletingId === c.id}
                          title="Delete campaign"
                          aria-label={`Delete ${c.name}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-bad/15 px-2.5 py-1.5 text-xs font-semibold text-bad transition hover:bg-bad/25 disabled:opacity-50"
                        >
                          <Trash className="h-3.5 w-3.5" />
                          {deletingId === c.id ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
