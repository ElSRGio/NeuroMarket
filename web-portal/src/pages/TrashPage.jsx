import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { investmentService } from '../services/investment.service.js'
import AppNav from '../components/AppNav.jsx'

const DAYS_TO_EXPIRE = 30

function daysLeft(deletedAt) {
  const diff = new Date(deletedAt).getTime() + DAYS_TO_EXPIRE * 86400000 - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

export default function TrashPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    investmentService.getTrash()
      .then(({ data }) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleRestore(id) {
    await investmentService.restore(id)
    setItems(prev => prev.filter(a => a.id !== id))
  }

  async function handlePermanentDelete(id) {
    if (!confirm('Eliminar permanentemente? Esta accion no se puede deshacer.')) return
    await investmentService.permanentDelete(id)
    setItems(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav showNewAnalysis={false}/>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-700 text-sm transition-colors">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-black text-gray-900">🗑 Papelera</h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700">
          Los analisis eliminados se borran automaticamente despues de <strong>{DAYS_TO_EXPIRE} dias</strong>.
          Los creditos usados no se recuperan al restaurar o eliminar.
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-20 text-sm">Cargando papelera...</p>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl text-center py-16 shadow-sm">
            <div className="text-5xl mb-3">🗑</div>
            <p className="text-gray-500 text-sm">La papelera esta vacia</p>
            <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold" style={{ color: '#22c55e' }}>
              Volver al dashboard →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(a => {
              const days = daysLeft(a.deleted_at)
              const score = a.viability_score
              const scoreColor = score >= 85 ? '#16a34a' : score >= 70 ? '#ca8a04' : score >= 50 ? '#ea580c' : '#dc2626'

              return (
                <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-gray-900 truncate">{a.business_name}</h3>
                      <span className="text-lg font-black flex-shrink-0" style={{ color: scoreColor }}>{score}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>{a.municipio}, {a.estado}</span>
                      <span>·</span>
                      <span className="capitalize">{a.sector}</span>
                      <span>·</span>
                      <span className={days <= 5 ? 'text-red-500 font-semibold' : 'text-gray-400'}>
                        {days > 0 ? `Se borra en ${days} dias` : 'Se borra hoy'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRestore(a.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                    >
                      Restaurar
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(a.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
