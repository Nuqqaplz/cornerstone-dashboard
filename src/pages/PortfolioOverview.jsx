const STATS = [
  { label: 'Total Impressions',  value: '89,268', change: '+12%', up: true },
  { label: 'Total GSC Clicks',   value: '747',    change: '+8%',  up: true },
  { label: 'Avg Position',       value: '14.2',   change: '-1.3', up: true },
  { label: 'GBP Views',          value: '21,878', change: '+5%',  up: true },
  { label: 'GBP Calls',          value: '754',    change: '+18%', up: true },
  { label: 'Avg Rating',         value: '4.6',    change: '—',    up: null },
]

export default function PortfolioOverview() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Aggregate metrics across all 13 Cornerstone Storage locations · Jan–Apr 2026
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {s.label}
            </div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            {s.up !== null && (
              <div className={`text-xs mt-1 font-medium ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {s.change} vs prior period
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-700 mb-4">Impressions by Location</div>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-sm">Chart — coming soon</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-700 mb-4">GBP Performance</div>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-sm">Chart — coming soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
