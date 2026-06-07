import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { roasBarColor, roasLabel } from '../lib/format'

const TARGET = 3

function truncate(name, n = 10) {
  return name.length > n ? `${name.slice(0, n)}…` : name
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs shadow-xl">
      <div className="font-medium text-zinc-100">{row.name}</div>
      <div className="mt-0.5 text-zinc-400">
        ROAS <span className="font-semibold text-zinc-100">{roasLabel(row.roas)}</span>
      </div>
    </div>
  )
}

const barLabel = (v) => `${Number(v).toFixed(1)}×`

export default function CampaignChart({ campaigns }) {
  // Highest ROAS first, left → right.
  const data = [...campaigns]
    .sort((a, b) => (Number(b.roas) || 0) - (Number(a.roas) || 0))
    .map((c) => ({
      name: c.name,
      short: truncate(c.name),
      roas: Number(c.roas) || 0,
    }))

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-white">ROAS by campaign</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Higher is better · dashed line marks the 3× target
          </p>
        </div>
        <span className="text-xs text-zinc-500">
          {campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-4 h-72">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            No campaigns to chart yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 24, right: 12, left: -8, bottom: 4 }}>
              <XAxis
                dataKey="short"
                tickLine={false}
                axisLine={{ stroke: '#232430' }}
                tick={{ fill: '#71717a', fontSize: 11 }}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#52525b', fontSize: 11 }}
                tickFormatter={(v) => `${v.toFixed(1)}×`}
                width={44}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={<ChartTooltip />}
              />
              <ReferenceLine
                y={TARGET}
                stroke="#52525b"
                strokeDasharray="4 4"
                label={{
                  value: '3× target',
                  position: 'right',
                  fill: '#71717a',
                  fontSize: 10,
                }}
              />
              <Bar dataKey="roas" radius={[5, 5, 0, 0]} maxBarSize={48}>
                <LabelList
                  dataKey="roas"
                  position="top"
                  formatter={barLabel}
                  fill="#a1a1aa"
                  fontSize={11}
                />
                {data.map((entry, i) => (
                  <Cell key={i} fill={roasBarColor(entry.roas)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
