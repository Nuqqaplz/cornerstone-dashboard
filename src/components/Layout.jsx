import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  MapPin,
  Users,
  LogOut,
  Building2,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/portfolio',    label: 'Portfolio Overview',   icon: LayoutDashboard },
  { to: '/seo-rankings', label: 'SEO Rankings',         icon: TrendingUp },
  { to: '/kpi-tracker',  label: 'KPI Tracker',          icon: Target },
  { to: '/location',     label: 'Location Deep-Dive',   icon: MapPin },
  { to: '/competitors',  label: 'Competitor Analysis',  icon: Users },
]

export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col z-10">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">CORNERSTONE</div>
              <div className="text-slate-400 text-xs">Storage Analytics</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800',
                ].join(' ')
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User / Sign out */}
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="px-3 py-2 mb-1">
            <div className="text-slate-400 text-xs truncate">{user?.email}</div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
