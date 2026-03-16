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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UpgradePage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/analysis/new" element={<NewAnalysisPage />} />
      <Route path="/analysis/:id" element={<AnalysisResultPage />} />
      <Route path="/presentation" element={<PresentationPage />} />
      <Route path="/upgrade" element={<UpgradePage />} />
      <Route path="/trash" element={<TrashPage />} />
    </Routes>
  )
}
