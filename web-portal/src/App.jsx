import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import NewAnalysisPage from './pages/NewAnalysisPage.jsx'
import AnalysisResultPage from './pages/AnalysisResultPage.jsx'
import PresentationPage from './pages/PresentationPage.jsx'
import UpgradePage from './pages/UpgradePage.jsx'
import TrashPage from './pages/TrashPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SocialListeningPage from './pages/SocialListeningPage.jsx'
import GeoMapsPage from './pages/GeoMapsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import { authService } from './services/investment.service.js'
import { useAuthStore } from './store/auth.store.js'

export default function App() {
  const { token, user, setUser, logout } = useAuthStore()

  useEffect(() => {
    if (!token || user) return
    authService.me()
      .then(({ data }) => setUser(data))
      .catch(() => logout())
  }, [token, user, setUser, logout])

  return (
    <Routes>
      <Route path="/" element={<UpgradePage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/analysis/new" element={<ProtectedRoute><NewAnalysisPage /></ProtectedRoute>} />
      <Route path="/analysis/:id" element={<ProtectedRoute><AnalysisResultPage /></ProtectedRoute>} />
      <Route path="/presentation" element={<ProtectedRoute><PresentationPage /></ProtectedRoute>} />
      <Route path="/social-listening" element={<ProtectedRoute><SocialListeningPage /></ProtectedRoute>} />
      <Route path="/geo-maps" element={<ProtectedRoute><GeoMapsPage /></ProtectedRoute>} />
      <Route path="/upgrade" element={<UpgradePage />} />
      <Route path="/planes" element={<UpgradePage />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/trash" element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
