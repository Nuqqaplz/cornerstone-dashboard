import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

// Shorten "Cornerstone Storage - 192nd St" → "192nd St"
function shortName(name) {
  const dash = name.indexOf(' - ')
  return dash !== -1 ? name.slice(dash + 3) : name
}

async function fetchAggregateStats(locationMap) {
  const { data } = await supabase
    .from('location_audits')
    .select('location_id, data_source, impressions, clicks_gsc, avg_pos, gbp_views, gbp_calls, rating, period_end')
    .order('period_end', { ascending: false })

  if (!data) return {}

  // Keep latest row per location+source
  const seen = {}
  const latest = []
  for (const row of data) {
    const key = `${row.location_id}__${row.data_source}`
    if (!seen[key]) { seen[key] = true; latest.push(row) }
  }

  const gscRows = latest.filter(r => r.data_source === 'gsc')
  const gbpRows = latest.filter(r => r.data_source === 'gbp')

  const totalImpressions = gscRows.reduce((s, r) => s + (r.impressions ?? 0), 0)
  const totalClicks = gscRows.reduce((s, r) => s + (r.clicks_gsc ?? 0), 0)
  const avgPos = gscRows.length
    ? (gscRows.reduce((s, r) => s + (r.avg_pos ?? 0), 0) / gscRows.length).toFixed(1)
    : '—'
  const totalGbpViews = gbpRows.reduce((s, r) => s + (r.gbp_views ?? 0), 0)
  const totalGbpCalls = gbpRows.reduce((s, r) => s + (r.gbp_calls ?? 0), 0)
  const ratedRows = gbpRows.filter(r => r.rating != null)
  const avgRating = ratedRows.length
    ? (ratedRows.reduce((s, r) => s + r.rating, 0) / ratedRows.length).toFixed(1)
    : '—'

  return { totalImpressions, totalClicks, avgPos, totalGbpViews, totalGbpCalls, avgRating }
}

export default function PortfolioOverview() {
  const [gscData, setGscData] = useState([])
  const [gbpData, setGbpData] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [latestPeriod, setLatestPeriod] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)

      // Step 1: fetch all locations to build id→name map
      const { data: locations } = await supabase
        .from('locations')
        .select('id, name')

      const locationMap = {}
      for (const loc of (locations ?? [])) {
        locationMap[loc.id] = loc.name
      }

      // Step 2: fetch all audit rows (no join needed)
      const { data: audits } = await supabase
        .from('location_audits')
        .select('location_id, data_source, impressions, clicks_gsc, avg_pos, gbp_views, gbp_calls, gbp_directions, rating, reviews, period_end')
        .order('period_end', { ascending: false })

      if (!audits) { setLoading(false); return }
      if (audits.length > 0) setLatestPeriod(audits[0].period_end)

      // Keep latest row per location+source
      const seen = {}
      const latest = []
      for (const row of audits) {
        const key = `${row.location_id}__${row.data_source}`
        if (!seen[key]) { seen[key] = true; latest.push(row) }
      }

      // Build GSC chart data
      const gscRows = latest
        .filter(r => r.data_source === 'gsc' && locationMap[r.location_id])
        .map(r => ({
          name: shortName(locationMap[r.location_id]),
          Impressions: r.impressions ?? 0,
        }))
        .sort((a, b) => b.Impressions - a.Impressions)

      // Build GBP chart data
      const gbpRows = latest
        .filter(r => r.data_source === 'gbp' && locationMap[r.location_id])
        .map(r => ({
          name: shortName(locationMap[r.location_id]),
          Views: r.gbp_views ?? 0,
          Calls: r.gbp_calls ?? 0,
        }))
        .sort((a, b) => b.Views - a.Views)

      // Aggregate stats
      const gscAll = latest.filter(r => r.data_source === 'gsc')
      const gbpAll = latest.filter(r => r.data_source === 'gbp')
      const totalImpressions = gscAll.reduce((s, r) => s + (r.impressions ?? 0), 0)
      const totalClicks = gscAll.reduce((s, r) => s + (r.clicks_gsc ?? 0), 0)
      const avgPos = gscAll.length
        ? (gscAll.reduce((s, r) => s + (r.avg_pos ?? 0), 0) / gscAll.length).toFixed(1)
        : '—'
      const totalGbpViews = gbpAll.reduce((s, r) => s + (r.gbp_views ?? 0), 0)
      const totalGbpCalls = gbpAll.reduce((s, r) => s + (r.gbp_calls ?? 0), 0)
      const ratedRows = gbpAll.filter(r => r.rating != null)
      const avgRating = ratedRows.length
        ? (ratedRows.reduce((s, r) => s + r.rating, 0) / ratedRows.length).toFixed(1)
        : '—'

      setStats({ totalImpressions, totalClicks, avgPos, totalGbpViews, totalGbpCalls, avgRating })
      setGscData(gscRows)
      setGbpData(gbpRows)
      setLoading(false)
    }

    fetchAll()
  }, [])

  const STATS = stats ? [
    { label: 'Total Impressions', value: stats.totalImpressions.toLocaleString() },
    { label: 'Total GSC Clicks',  value: stats.totalClicks.toLocaleString() },
    { label: 'Avg Position',      value: stats.avgPos },
    { label: 'GBP Views',         value: stats.totalGbpViews.toLocaleString() },
    { label: 'GBP Calls',         value: stats.totalGbpCalls.toLocaleString() },
    { label: 'Avg Rating',        value: stats.avgRating },
  ] : []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Aggregate metrics across all 13 Cornerstone Storage locations · Last updated: {latestPeriod ? new Date(latestPeriod + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "..."}
        </p>
      </div>

      {loading && (
        <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
      )}

      {!loading && (
        <>
          {/* KPI cards — now live from DB */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  {s.label}
                </div>
                <div className="text-3xl font-bold text-gray-900">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-5">
            {/* Impressions by Location */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="text-sm font-semibold text-gray-700 mb-4">Impressions by Location</div>
              {gscData.length === 0 ? (
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No GSC data</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart
                    data={gscData}
                    layout="vertical"
                    margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(v) => [v.toLocaleString(), 'Impressions']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="Impressions" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* GBP Performance */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="text-sm font-semibold text-gray-700 mb-4">GBP Performance</div>
              {gbpData.length === 0 ? (
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No GBP data</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart
                    data={gbpData}
                    layout="vertical"
                    margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Views" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={12} />
                    <Bar dataKey="Calls" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
