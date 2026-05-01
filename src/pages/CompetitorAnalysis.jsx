import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const OWN_DOMAINS = ['cornerstonestorage.com', 'cornerstonecontractorbays.com']

const CAMPAIGNS = ['omaha-metro', 'council-bluffs', 'bondurant', 'sioux-falls']

export default function CompetitorAnalysis() {
  const [campaign, setCampaign] = useState('omaha-metro')
  const [rows, setRows]         = useState([])
  const [ours, setOurs]         = useState(null)
  const [period, setPeriod]     = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)

      // Get latest period for this campaign
      const { data: latest } = await supabase
        .from('semrush_competitor_metrics')
        .select('period_start, period_end')
        .eq('campaign', campaign)
        .order('period_end', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!latest) { setRows([]); setOurs(null); setPeriod(null); setLoading(false); return }
      setPeriod(latest)

      const { data } = await supabase
        .from('semrush_competitor_metrics')
        .select('competitor_url, visibility_level, matches_count, avg_position')
        .eq('campaign', campaign)
        .eq('period_start', latest.period_start)
        .eq('period_end', latest.period_end)
        .order('visibility_level', { ascending: false })

      const all = data ?? []
      setOurs(all.find(r => OWN_DOMAINS.includes(r.competitor_url)) ?? null)
      setRows(all.filter(r => !OWN_DOMAINS.includes(r.competitor_url)))
      setLoading(false)
    }
    fetch()
  }, [campaign])

  // Find our rank among all (including us) sorted by visibility
  const allSorted = ours
    ? [...rows, ours].sort((a, b) => b.visibility_level - a.visibility_level)
    : rows
  const ourRank = ours
    ? allSorted.findIndex(r => OWN_DOMAINS.includes(r.competitor_url)) + 1
    : null

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
          <p className="text-gray-500 text-sm mt-1">
            SEMrush position tracking
            {period ? ` · ${period.period_start} – ${period.period_end}` : ''}
          </p>
        </div>
        <select
          value={campaign}
          onChange={e => setCampaign(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          {CAMPAIGNS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading && <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>}

      {!loading && (
        <>
          {/* Our position summary */}
          {ours && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="text-xs font-medium text-blue-500 uppercase tracking-wide mb-1">Our Rank</div>
                <div className="text-2xl font-bold text-blue-700">#{ourRank}</div>
                <div className="text-xs text-blue-400 mt-0.5">of {allSorted.length} sites</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Our Visibility</div>
                <div className="text-2xl font-bold text-gray-900">{ours.visibility_level?.toFixed(1)}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Our Avg Position</div>
                <div className="text-2xl font-bold text-gray-900">{ours.avg_position?.toFixed(1) ?? '—'}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Keyword Matches</div>
                <div className="text-2xl font-bold text-gray-900">{ours.matches_count ?? '—'}</div>
              </div>
            </div>
          )}

          {/* Competitor table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Domain</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Visibility</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Position</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Matches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => {
                  const isAboveUs = ours && row.visibility_level > ours.visibility_level
                  return (
                    <tr key={row.competitor_url} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-3">
                        <span className={`font-medium ${isAboveUs ? 'text-red-500' : 'text-gray-600'}`}>
                          {row.competitor_url}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isAboveUs ? 'bg-red-400' : 'bg-gray-300'}`}
                              style={{ width: `${Math.min(100, (row.visibility_level / (rows[0]?.visibility_level || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-700 font-medium w-10 text-right">
                            {row.visibility_level?.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500">
                        {row.avg_position?.toFixed(1) ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500">{row.matches_count ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
