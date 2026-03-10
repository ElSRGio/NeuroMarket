import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { investmentService } from '../services/investment.service.js'
import { useAuthStore } from '../store/auth.store.js'

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    investmentService.getHistory()
      .then(({ data }) => setAnalyses(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-brand-green font-bold text-xl">⬡</span>
          <span className="font-bold text-white">NeuroMarket <span className="text-brand-blue">2.0</span></span>
        </div>
        <div className="flex gap-3 items-center">
          <Link to="/analysis/new" className="btn-primary py-2 text-sm">+ Nuevo análisis</Link>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition-colors">
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Mis análisis</h1>
        <p className="text-gray-400 mb-8">Historial de análisis de viabilidad de inversión</p>

        {loading ? (
          <div className="text-gray-500 text-center py-20">Cargando...</div>
        ) : analyses.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-white font-bold text-xl mb-2">Sin análisis aún</h3>
            <p className="text-gray-400 mb-6">Crea tu primer análisis de viabilidad de inversión</p>
            <Link to="/analysis/new" className="btn-primary">Analizar mi negocio →</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map(a => (
              <AnalysisCard key={a.id} analysis={a} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function AnalysisCard({ analysis }) {
  const score = analysis.viability_score
  const color = score >= 85 ? 'text-brand-green' : score >= 70 ? 'text-yellow-400' : score >= 50 ? 'text-orange-400' : 'text-red-400'

  return (
    <Link to={`/analysis/${analysis.id}`} className="card hover:border-white/30 transition-colors block">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white">{analysis.business_name}</h3>
          <p className="text-gray-500 text-sm">{analysis.municipio}, {analysis.estado}</p>
        </div>
        <span className={`text-2xl font-black ${color}`}>{score}</span>
      </div>
      <div className="flex gap-3 text-xs text-gray-500">
        <span className="capitalize">{analysis.sector}</span>
        <span>·</span>
        <span className="capitalize">{analysis.status}</span>
      </div>
    </Link>
  )
}
