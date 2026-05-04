import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SeoRankings() {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [periodLabel, setPeriodLabel] = useState('')

  useEffect(() => {
    async function fetchRankings() {
      try {
        // Get the latest period_end date from keyword_rankings
        const { data: latestPeriod, error: periodError } = await supabase
          .from('keyword_rankings')
          .select('period_start, period_end')
          .eq('data_source', 'semrush')
          .order('period_end', { ascending: false })
          .limit(1)
          .single()

        if (periodError) throw periodError

        const { period_start, period_end } = latestPeriod

        // Format period label
        const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        setPeriodLabel(`${fmt(period_start)} – ${fmt(period_end)}`)

        // Get all rankings for the latest period
        const { data: currentRankings, error: currentError } = await supabase
          .from('keyword_rankings')
          .select('keyword, rank, search_volume, campaign, location_id')
          .eq('data_source', 'semrush')
          .eq('period_end', period_end)
          .order('rank', { ascending: true })

        if (currentError) throw currentError

        // Get previous period for change calculation
        const { data: prevPeriod } = await supabase
          .from('keyword_rankings')
          .select('period_end')
          .eq('data_source', 'semrush')
          .lt('period_end', period_end)
          .order('period_end', { ascending: false })
          .limit(1)
          .single()

        let prevRankMap = {}
        if (prevPeriod) {
          const { data: prevRankings } = await supabase
            .from('keyword_rankings')
            .select('keyword, rank, campaign')
            .eq('data_source', 'semrush')
            .eq('period_end', prevPeriod.period_end)

          if (prevRankings) {
            prevRankings.forEach(r => {
              prevRankMap[`${r.keyword}-${r.campaign}`] = r.rank
            })
          }
        }

        // Merge with change calculation
        const merged = currentRankings.map(r => {
          const prevRank = prevRankMap[`${r.keyword}-${r.campaign}`]
          const change = prevRank != null ? prevRank - r.rank : null
          return { ...r, change }
        })

        setRankings(merged)
      } catch (err) {
        console.error('Error fetching SEO rankings:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [])

  const campaignLabel = (campaign) => {
    const labels = {
      'omaha-metro': 'Omaha Metro',
      'council-bluffs': 'Council Bluffs',
      'bondurant': 'Bondurant',
      'sioux-falls': 'Sioux Falls',
    }
    return labels[campaign] || campaign
  }

  // Group by campaign
  const byCampaign = rankings.reduce((acc, r) => {
    const key = r.campaign || 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const campaignOrder = ['omaha-metro', 'council-bluffs', 'bondurant', 'sioux-falls']

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SEO Rankings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Keyword position tracking via SEMrush · {periodLabel || 'Loading...'}
        </p>
      </div>

      {loading && (
        <div className="text-gray-400 text-sm">Loading rankings...</div>
      )}

      {error && (
        <div className="text-red-500 text-sm">Error loading rankings: {error}</div>
      )}

      {!loading && !error && campaignOrder.map(campaign => {
        const rows = byCampaign[campaign]
        if (!rows || rows.length === 0) return null
        return (
          <div key={campaign} className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {campaignLabel(campaign)} ({rows.length} keywords)
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Keyword</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Position</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Change</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Search Vol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((row) => (
                    <tr key={`${row.keyword}-${row.campaign}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-800 font-medium">{row.keyword}</td>
                      <td className="px-5 py-3.5 text-right text-gray-700">{row.rank?.toFixed(1) ?? '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        {row.change == null ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <span className={`font-medium ${row.change > 0 ? 'text-emerald-600' : row.change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {row.change > 0 ? `+${row.change}` : row.change === 0 ? '—' : row.change}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-500">
                        {row.search_volume ?? 'n/a'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
