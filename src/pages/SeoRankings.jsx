const PLACEHOLDER_KW = [
  { keyword: 'storage units omaha',      position: 3.1,  change: 0,   volume: 390 },
  { keyword: 'self storage omaha',       position: 5.4,  change: -1,  volume: 390 },
  { keyword: 'rv storage omaha',         position: 8.2,  change: 2,   volume: 170 },
  { keyword: 'storage units bellevue',   position: 2.0,  change: 1,   volume: null },
  { keyword: 'storage units wahoo',      position: 1.0,  change: 0,   volume: null },
  { keyword: 'cornerstone storage',      position: 1.0,  change: 0,   volume: 320 },
  { keyword: 'storage units bondurant',  position: 4.3,  change: 3,   volume: null },
  { keyword: 'storage units sioux falls',position: 6.1,  change: -2,  volume: 590 },
]

export default function SeoRankings() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SEO Rankings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Keyword position tracking via SEMrush · Apr 27–29, 2026
        </p>
      </div>

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
            {PLACEHOLDER_KW.map((row) => (
              <tr key={row.keyword} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 text-gray-800 font-medium">{row.keyword}</td>
                <td className="px-5 py-3.5 text-right text-gray-700">{row.position.toFixed(1)}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`font-medium ${row.change > 0 ? 'text-emerald-600' : row.change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {row.change > 0 ? `+${row.change}` : row.change === 0 ? '—' : row.change}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right text-gray-500">{row.volume ?? 'n/a'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
