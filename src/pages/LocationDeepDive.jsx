import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function fmt(val, decimals = 0) {
  if (val == null) return '—'
  const n = Number(val)
  return isNaN(n) ? '—' : decimals > 0 ? n.toFixed(decimals) : n.toLocaleString()
}

function fmtDate(d) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function MetricRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${value === '—' ? 'text-gray-300' : highlight ? 'text-blue-600' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}

function Card({ title, subtitle, children, empty }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="mb-3 pb-3 border-b border-gray-50">
        <div className="text-sm font-semibold text-gray-700">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
      </div>
      {empty ? (
        <div className="py-4 text-center text-xs text-gray-300">No data available</div>
      ) : (
        <div className="divide-y divide-gray-50">{children}</div>
      )}
    </div>
  )
}

export default function LocationDeepDive() {
  const [locations, setLocations]   = useState([])
  const [locationId, setLocationId] = useState(null)
  const [gsc, setGsc]               = useState(null)
  const [gbp, setGbp]               = useState(null)
  const [semrush, setSemrush]       = useState(null)
  const [topKeywords, setTopKeywords] = useState([])
  const [loading, setLoading]       = useState(false)

  // Load all locations for the dropdown
  useEffect(() => {
    supabase
      .from('locations')
      .select('id, name, city, state')
      .order('name')
      .then(({ data }) => {
        if (data?.length) {
          setLocations(data)
          setLocationId(data[0].id)
        }
      })
  }, [])

  // Fetch all data for selected location
  useEffect(() => {
    if (!locationId) return

    async function fetchAll() {
      setLoading(true)
      setGsc(null)
      setGbp(null)
      setSemrush(null)
      setTopKeywords([])

      const [gscRes, gbpRes, semRes, kwRes] = await Promise.all([
        supabase
          .from('location_audits')
          .select('impressions, clicks_gsc, avg_pos, period_start, period_end')
          .eq('location_id', locationId)
          .eq('data_source', 'gsc')
          .order('period_end', { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from('location_audits')
          .select('gbp_views, gbp_clicks, gbp_calls, gbp_directions, reviews, rating, period_start, period_end')
          .eq('location_id', locationId)
          .eq('data_source', 'gbp')
          .order('period_end', { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from('location_audits')
          .select('avg_pos, organic_rank, maps_rank, keywords_count, estimated_traffic, visibility, period_start, period_end')
          .eq('location_id', locationId)
          .eq('data_source', 'semrush')
          .order('period_end', { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from('keyword_rankings')
          .select('keyword, rank, search_volume, period_end')
          .eq('location_id', locationId)
          .order('period_end', { ascending: false })
          .order('rank', { ascending: true })
          .limit(10),
      ])

      setGsc(gscRes.data)
      setGbp(gbpRes.data)
      setSemrush(semRes.data)

      // Dedupe to top keyword per phrase (latest period only)
      const kwMap = {}
      for (const row of (kwRes.data ?? [])) {
        if (!kwMap[row.keyword]) kwMap[row.keyword] = row
      }
      setTopKeywords(Object.values(kwMap).slice(0, 10))
      setLoading(false)
    }

    fetchAll()
  }, [locationId])

  const selectedLoc = locations.find((l) => l.id === locationId)

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Location Deep-Dive</h1>
          <p className="text-gray-500 text-sm mt-1">
            {selectedLoc ? `${selectedLoc.city}, ${selectedLoc.state}` : 'GSC, GBP, and SEMrush metrics per location'}
          </p>
        </div>

        <select
          value={locationId ?? ''}
          onChange={(e) => setLocationId(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-w-64"
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 gap-5">
          {/* GSC */}
          <Card
            title="Google Search Console"
            subtitle={gsc ? `${fmtDate(gsc.period_start)} – ${fmtDate(gsc.period_end)}` : null}
            empty={!gsc}
          >
            <MetricRow label="Impressions"  value={fmt(gsc?.impressions)} />
            <MetricRow label="Clicks"       value={fmt(gsc?.clicks_gsc)} />
            <MetricRow label="Avg Position" value={fmt(gsc?.avg_pos, 1)} />
          </Card>

          {/* GBP */}
          <Card
            title="Google Business Profile"
            subtitle={gbp ? `${fmtDate(gbp.period_start)} – ${fmtDate(gbp.period_end)}` : null}
            empty={!gbp}
          >
            <MetricRow label="Views"      value={fmt(gbp?.gbp_views)} />
            <MetricRow label="Clicks"     value={fmt(gbp?.gbp_clicks)} />
            <MetricRow label="Calls"      value={fmt(gbp?.gbp_calls)} />
            <MetricRow label="Directions" value={fmt(gbp?.gbp_directions)} />
            <MetricRow label="Reviews"    value={fmt(gbp?.reviews)} />
            <MetricRow label="Rating"     value={fmt(gbp?.rating, 1)} />
          </Card>

          {/* SEMrush */}
          <Card
            title="SEMrush Organic"
            subtitle={semrush ? `${fmtDate(semrush.period_start)} – ${fmtDate(semrush.period_end)}` : null}
            empty={!semrush}
          >
            <MetricRow label="Visibility %"    value={semrush?.visibility != null ? `${semrush.visibility}%` : '—'} />
            <MetricRow label="Organic Rank"    value={fmt(semrush?.organic_rank)} />
            <MetricRow label="Maps Rank"       value={fmt(semrush?.maps_rank)} />
            <MetricRow label="Keywords Tracked" value={fmt(semrush?.keywords_count)} />
            <MetricRow label="Est. Traffic"    value={fmt(semrush?.estimated_traffic, 0)} />
          </Card>

          {/* Top Keywords */}
          <Card
            title="Top Ranking Keywords"
            subtitle="Latest period · sorted by rank"
            empty={topKeywords.length === 0}
          >
            {topKeywords.map((kw, i) => (
              <div key={kw.keyword} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-300 w-4 flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-gray-700 truncate capitalize">{kw.keyword}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {kw.search_volume != null && (
                    <span className="text-xs text-gray-400">{kw.search_volume.toLocaleString()} vol</span>
                  )}
                  <span className={`text-sm font-bold ${kw.rank <= 3 ? 'text-emerald-600' : kw.rank <= 10 ? 'text-amber-500' : 'text-gray-400'}`}>
                    #{kw.rank}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}
