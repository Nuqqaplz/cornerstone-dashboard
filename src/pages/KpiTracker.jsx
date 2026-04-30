const KPIS = [
  { label: 'Keyword Mentions — "rv storage"',          current: 28,  target: 50,  market: 'National' },
  { label: 'Keyword Mentions — "contractor storage"',  current: 43,  target: 50,  market: 'National' },
  { label: 'Keyword Mentions — "storage units omaha"', current: 9,   target: 50,  market: 'Omaha' },
  { label: 'GBP Calls — Bellevue',                     current: 128, target: 200, market: 'Bellevue' },
  { label: 'GBP Calls — Omaha 192nd',                  current: 62,  target: 100, market: 'Omaha' },
  { label: 'Avg GSC Position — Omaha',                 current: 14,  target: 10,  market: 'Omaha', invert: true },
]

export default function KpiTracker() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">KPI Tracker</h1>
        <p className="text-gray-500 text-sm mt-1">Progress toward marketing KPI targets</p>
      </div>

      <div className="space-y-4">
        {KPIS.map((kpi) => {
          const pct = Math.min(100, Math.round((kpi.current / kpi.target) * 100))
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{kpi.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{kpi.market}</div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{kpi.current}</span>
                  <span className="text-gray-400 text-sm"> / {kpi.target}</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1.5">{pct}% of target</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
