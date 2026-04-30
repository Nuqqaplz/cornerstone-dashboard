import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import PortfolioOverview from './pages/PortfolioOverview'
import SeoRankings from './pages/SeoRankings'
import KpiTracker from './pages/KpiTracker'
import LocationDeepDive from './pages/LocationDeepDive'
import CompetitorAnalysis from './pages/CompetitorAnalysis'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/portfolio" replace />} />
            <Route path="portfolio"    element={<PortfolioOverview />} />
            <Route path="seo-rankings" element={<SeoRankings />} />
            <Route path="kpi-tracker"  element={<KpiTracker />} />
            <Route path="location"     element={<LocationDeepDive />} />
            <Route path="competitors"  element={<CompetitorAnalysis />} />
          </Route>
          <Route path="*" element={<Navigate to="/portfolio" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
