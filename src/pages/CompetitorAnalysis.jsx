const COMPETITORS = [
  { url: 'armorstorages.com',     visibility: 16.93, traffic: 4.76,  avgPos: 23.8, matches: 60 },
  { url: 'lockbox-storage.com',   visibility: 15.96, traffic: 16.19, avgPos: 47.2, matches: 42 },
  { url: 'thestorageloft.com',    visibility: 14.13, traffic: 43.45, avgPos: 72.9, matches: 26 },
  { url: 'cornerstonestorage.com',visibility: 13.33, traffic: 7.21,  avgPos: 29.7, matches: 56, ours: true },
  { url: 'dinosstorage.com',      visibility: 13.25, traffic: 15.68, avgPos: 27.5, matches: 55 },
  { url: 'extraspace.com',        visibility: 10.98, traffic: 16.23, avgPos: 23.99,matches: 63 },
  { url: 'publicstorage.com',     visibility: 10.71, traffic: 10.42, avgPos: 29.8, matches: 60 },
]

export default function CompetitorAnalysis() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
        <p className="text-gray-500 text-sm mt-1">
          SEMrush position tracking · Omaha Metro campaign · Apr 27–29, 2026
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Domain</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Visibility</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Est. Traffic</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Pos</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Matches</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {COMPETITORS.map((row) => (
              <tr
                key={row.url}
                className={row.ours ? 'bg-brand-50' : 'hover:bg-gray-50 transition-colors'}
              >
                <td className="px-5 py-3.5">
                  <span className={`font-medium ${row.ours ? 'text-brand-700' : 'text-gray-800'}`}>
                    {row.url}
                  </span>
                  {row.ours && (
                    <span className="ml-2 text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-medium">us</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right text-gray-700">{row.visibility.toFixed(2)}</td>
                <td className="px-5 py-3.5 text-right text-gray-700">{row.traffic.toFixed(2)}</td>
                <td className="px-5 py-3.5 text-right text-gray-700">{row.avgPos.toFixed(1)}</td>
                <td className="px-5 py-3.5 text-right text-gray-700">{row.matches}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
