import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import StatCard from '../components/StatCard'
import CampaignChart from '../components/CampaignChart'
import CampaignTable from '../components/CampaignTable'
import ExplainerModal from '../components/ExplainerModal'
import { Dollar, Receipt, TrendUp, Target, Upload, Plus } from '../components/icons'
import { compactNumber, money, roasLabel } from '../lib/format'

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [explaining, setExplaining] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (campaign) => {
    if (!window.confirm(`Delete "${campaign.name}"? This can't be undone.`)) {
      return
    }
    setDeletingId(campaign.id)
    setError('')
    try {
      await api.delete(`/api/campaigns/${campaign.id}/`)
      setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id))
    } catch {
      setError('Could not delete that campaign. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    api
      .get('/api/campaigns/')
      .then(({ data }) => {
        // The list endpoint is paginated, so unwrap `results` when present.
        setCampaigns(Array.isArray(data) ? data : data.results || [])
      })
      .catch(() => setError('Could not load campaigns. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const totalSpend = campaigns.reduce((s, c) => s + Number(c.spend || 0), 0)
    const totalRevenue = campaigns.reduce((s, c) => s + Number(c.revenue || 0), 0)
    const conversions = campaigns.reduce((s, c) => s + Number(c.conversions || 0), 0)
    const blendedRoas = totalSpend ? totalRevenue / totalSpend : 0
    return { totalSpend, totalRevenue, conversions, blendedRoas }
  }, [campaigns])

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">Overview</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Performance across all active campaigns, ranked by return on ad spend.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/upload" className="btn-ghost">
            <Upload className="h-4 w-4" />
            Upload CSV
          </Link>
          <Link to="/add" className="btn-primary">
            <Plus className="h-4 w-4" />
            Add campaign
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-10 text-sm text-zinc-500">Loading campaigns…</div>
      ) : (
        <>
          {/* Stat tiles */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total spend"
              value={money(stats.totalSpend, 0)}
              hint={`Across ${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'}`}
              Icon={Dollar}
            />
            <StatCard
              label="Total revenue"
              value={money(stats.totalRevenue, 0)}
              hint="Attributed revenue"
              Icon={Receipt}
            />
            <StatCard
              label="Blended ROAS"
              value={roasLabel(stats.blendedRoas)}
              hint={stats.blendedRoas >= 3 ? 'Above target' : 'Below 3× target'}
              hintTone={stats.blendedRoas >= 3 ? 'good' : 'bad'}
              Icon={TrendUp}
            />
            <StatCard
              label="Conversions"
              value={compactNumber(stats.conversions)}
              hint="Completed actions"
              Icon={Target}
            />
          </div>

          {/* Chart */}
          <div className="mt-6">
            <CampaignChart campaigns={campaigns} />
          </div>

          {/* Table */}
          <div className="mt-6">
            <CampaignTable
              campaigns={campaigns}
              onExplain={setExplaining}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          </div>
        </>
      )}

      {explaining && (
        <ExplainerModal campaign={explaining} onClose={() => setExplaining(null)} />
      )}
    </div>
  )
}
