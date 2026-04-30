import { useState } from 'react'

const LOCATIONS = [
  'Omaha, S 192nd St', 'Omaha, S 72nd St', 'Omaha, S 56th St', 'Omaha, S 44th St',
  'Bellevue', 'Council Bluffs', 'Bondurant', 'Sioux Falls, W 5th St',
  'Wahoo, Com Park Rd', 'Wahoo, 4th St', 'Wahoo, 5th St', 'Wahoo, Chestnut St',
  'Yutan, Co. Rd M',
]

export default function LocationDeepDive() {
  const [selected, setSelected] = useState(LOCATIONS[0])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Location Deep-Dive</h1>
        <p className="text-gray-500 text-sm mt-1">Per-location GSC, GBP, and SEMrush metrics</p>
      </div>

      {/* Location selector */}
      <div className="mb-6">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { title: 'Google Search Console', items: ['Impressions', 'Clicks', 'Avg Position'] },
          { title: 'Google Business Profile', items: ['Views', 'Clicks', 'Calls', 'Directions', 'Rating'] },
          { title: 'SEMrush Organic', items: ['Avg Position', 'Keyword Count', 'Est. Traffic'] },
          { title: 'SEMrush Keywords', items: ['Top 10', 'Top 20', 'Top 100'] },
        ].map((block) => (
          <div key={block.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="text-sm font-semibold text-gray-700 mb-4">{block.title}</div>
            <div className="space-y-3">
              {block.items.map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item}</span>
                  <span className="text-sm font-medium text-gray-300">—</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
