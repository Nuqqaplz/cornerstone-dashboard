import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const MARKET_LABELS = {
  national:          'National',
  omaha:             'Omaha',
  sioux_falls:       'Sioux Falls',
  council_bluffs:    'Council Bluffs',
  bondurant_altoona: 'Bondurant / Altoona',
  wahoo_yutan:       'Wahoo / Yutan',
  bellevue:          'Bellevue',
}

const MARKET_ORDER = ['national', 'omaha', 'sioux_falls', 'council_bluffs', 'bondurant_altoona', 'wahoo_yutan', 'bellevue']

function parseRank(text) {
  if (!text) return null
  const t = text.trim().toLowerCase()
  if (t === '1st' || t === '#1') return 1
  if (t === '2nd' || t === '#2') return 2
  if (t === '3rd' || t === '#3') return 3
  if (t === 'maintain') return 1
  if (t.includes('not') || t === 'na' || t === 'n/a') return 999
  const pageMatch = t.match(/page\s*(\d+)/)
  if (pageMatch) return parseInt(pageMatch[1], 10) * 10
  const numMatch = t.match(/\d+/)
  if (numMatch) return parseInt(numMatch[0], 10)
  return null
}

function StatusBadge({ current, target }) {
  const c = parseRank(current)
  const tgt = parseRank(target)
  if (c == null || tgt == null) return <span className="text-gray-300 text-xs">—</span>
  if (c <= tgt) return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
      ✓ Achieved
    </span>
  )
  if (c - tgt <= 3) return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
      Close
    </span>
  )
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-500">
      Needs Work
    </span>
  )
}

function rankColor(current, target) {
  const c = parseRank(current)
  const tgt = parseRank(target)
  if (c == null) return 'text-gray-400'
  if (tgt != null && c <= tgt) return 'text-emerald-600'
  if (c <= 5) return 'text-emerald-600'
  if (c <= 15) return 'text-amber-500'
  return 'text-red-500'
}

function MilestoneBar({ id, phrase, current, tier1, tier2, tier3, tier4 }) {
  const milestones = [tier1 ?? 100, tier2 ?? 250, tier3 ?? 500, tier4 ?? 1000]
  const maxVal = milestones[3]
  const pct = Math.min(100, (current / maxVal) * 100)
  const reached = milestones.filter(m => current >= m).length
  const nextMilestone = milestones.find(m => current < m)

  const barColor = reached >= 4 ? 'bg-emerald-500'
    : reached >= 2 ? 'bg-blue-500'
    : reached >= 1 ? 'bg-amber-400'
    : 'bg-gray-200'

  return (
    <div className="flex items-center gap-5 py-3 border-b border-gray-50 last:border-0">
      {/* Phrase */}
      <div className="w-64 flex-shrink-0">
        <div className="text-sm font-medium text-gray-800">{phrase}</div>
      </div>

      {/* Count */}
      <div className="w-24 flex-shrink-0 text-right">
        <span className="text-sm font-bold text-gray-900">{current.toLocaleString()}</span>
        <span className="text-xs text-gray-400 ml-1">mentions</span>
      </div>

      {/* Bar */}
      <div className="flex-1 min-w-0">
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
          {milestones.slice(0, 3).map(m => (
            <div key={m} className="absolute top-0 bottom-0 w-px bg-white opacity-70"
              style={{ left: `${(m / maxVal) * 100}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {milestones.map(m => (
            <span key={m} className={`text-xs ${current >= m ? 'text-emerald-500 font-semibold' : 'text-gray-300'}`}>
              {m >= 1000 ? '1k' : m}
            </span>
          ))}
        </div>
      </div>

      {/* Next milestone hint */}
      <div className="w-32 flex-shrink-0 text-right text-xs text-gray-400">
        {reached >= 4
          ? <span className="text-emerald-600 font-semibold">All milestones ✓</span>
          : nextMilestone != null
            ? <span>{(nextMilestone - current).toLocaleString()} to next</span>
            : null
        }
      </div>
    </div>
  )
}

function RankingTable({ title, rows }) {
  if (!rows.length) return null
  const achieved = rows.filter(r => {
    const c = parseRank(r.current_rank)
    const t = parseRank(r.target_rank)
    return c != null && t != null && c <= t
  }).length

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-700">{title}</h2>
        <span className="text-sm text-gray-400">
          <span className="text-emerald-600 font-semibold">{achieved}</span> / {rows.length} achieved
        </span>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Keyword</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Market</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Current</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-400 text-xs">{row.kpi_number}</td>
                <td className="px-5 py-3 text-gray-800 font-medium capitalize">{row.keyword}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{row.market}</td>
                <td className={`px-5 py-3 text-center font-bold ${rankColor(row.current_rank, row.target_rank)}`}>
                  {row.current_rank ?? '—'}
                </td>
                <td className="px-5 py-3 text-center text-gray-400">{row.target_rank ?? '—'}</td>
                <td className="px-5 py-3 text-center">
                  <StatusBadge current={row.current_rank} target={row.target_rank} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function KpiTracker() {
  const [mentionKpis, setMentionKpis] = useState({})
  const [organicKpis, setOrganicKpis] = useState([])
  const [mapsKpis, setMapsKpis]       = useState([])
  const [crawledAt, setCrawledAt]     = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)

      const { data: phrases } = await supabase
        .from('keyword_mention_phrases')
        .select('id, phrase, market, milestone_tier_1, milestone_tier_2, milestone_tier_3, milestone_tier_4')
        .eq('is_kpi_target', true)
        .order('phrase')

      const { data: latestRow } = await supabase
        .from('keyword_mentions')
        .select('crawled_at')
        .order('crawled_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const latestDate = latestRow?.crawled_at ?? null
      setCrawledAt(latestDate)

      let totalsMap = {}
      if (latestDate && phrases?.length) {
        const { data: mentions } = await supabase
          .from('keyword_mentions')
          .select('phrase_id, mention_count')
          .eq('crawled_at', latestDate)
        for (const m of (mentions ?? [])) {
          totalsMap[m.phrase_id] = (totalsMap[m.phrase_id] ?? 0) + m.mention_count
        }
      }

      // Group by market
      const byMarket = {}
      for (const p of (phrases ?? [])) {
        const mkt = p.market ?? 'national'
        if (!byMarket[mkt]) byMarket[mkt] = []
        byMarket[mkt].push({
          id:      p.id,
          phrase:  p.phrase,
          market:  mkt,
          current: totalsMap[p.id] ?? 0,
          tier1:   p.milestone_tier_1,
          tier2:   p.milestone_tier_2,
          tier3:   p.milestone_tier_3,
          tier4:   p.milestone_tier_4,
        })
      }
      setMentionKpis(byMarket)

      const { data: kpis } = await supabase
        .from('marketing_kpis')
        .select('id, kpi_number, category, keyword, market, current_rank, target_rank')
        .eq('is_active', true)
        .order('kpi_number')

      setOrganicKpis((kpis ?? []).filter(k => k.category === 'organic_ranking'))
      setMapsKpis((kpis ?? []).filter(k => k.category === 'maps_ranking'))
      setLoading(false)
    }
    fetchAll()
  }, [])

  const allMentions = Object.values(mentionKpis).flat()
  const mentionAchieved = allMentions.filter(k => k.current >= (k.tier1 ?? 100)).length
  const countAchieved = rows => rows.filter(r => {
    const c = parseRank(r.current_rank), t = parseRank(r.target_rank)
    return c != null && t != null && c <= t
  }).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">KPI Tracker</h1>
        <p className="text-gray-500 text-sm mt-1">
          Progress toward marketing targets
          {crawledAt ? ` · keyword crawl ${new Date(crawledAt).toLocaleDateString()}` : ' · keyword crawl pending'}
        </p>
      </div>

      {loading && <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>}

      {!loading && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Keyword Mentions</div>
              <div className="text-3xl font-bold text-gray-900">
                {mentionAchieved} <span className="text-lg text-gray-400">/ {allMentions.length}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">phrases at tier-1 target (100)</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Organic Rankings</div>
              <div className="text-3xl font-bold text-gray-900">
                {countAchieved(organicKpis)} <span className="text-lg text-gray-400">/ {organicKpis.length}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">KPIs achieved</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Maps Rankings</div>
              <div className="text-3xl font-bold text-gray-900">
                {countAchieved(mapsKpis)} <span className="text-lg text-gray-400">/ {mapsKpis.length}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">KPIs achieved</div>
            </div>
          </div>

          {/* Keyword Mentions grouped by market */}
          {allMentions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-700">Keyword Mentions</h2>
                <span className="text-xs text-gray-400">Milestones: 100 → 250 → 500 → 1,000</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {MARKET_ORDER.filter(m => mentionKpis[m]?.length).map((mkt, mktIdx) => (
                  <div key={mkt}>
                    <div className={`px-6 py-2.5 bg-gray-50 border-b border-gray-100 ${mktIdx > 0 ? 'border-t border-gray-100' : ''}`}>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {MARKET_LABELS[mkt] ?? mkt}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({mentionKpis[mkt].length} phrases)
                      </span>
                    </div>
                    <div className="px-6">
                      {mentionKpis[mkt].map(kpi => (
                        <MilestoneBar key={kpi.id} {...kpi} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <RankingTable title="Organic Rankings" rows={organicKpis} />
          <RankingTable title="Maps Rankings"    rows={mapsKpis} />
        </>
      )}
    </div>
  )
}
