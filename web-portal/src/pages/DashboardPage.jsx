import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { investmentService } from '../services/investment.service.js'
import api from '../services/api.js'
import { useAuthStore } from '../store/auth.store.js'
import AppNav from '../components/AppNav.jsx'

const PLAN_LIMITS = { basic: 6, pro: null, enterprise: null }

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState([])
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  const planKey = user?.plan_type || 'basic'
  const isAdmin = user?.role === 'admin'
  const limit = PLAN_LIMITS[planKey]
  const used = credits?.used ?? analyses.length
  const atLimit = limit !== null && used >= limit
  const sessionStartedAt = localStorage.getItem('nm_session_started_at')
  const avatarVersion = user?.updated_at ? `?v=${encodeURIComponent(new Date(user.updated_at).getTime())}` : ''

  const profileImageSrc = user?.profile_image_url
    ? (user.profile_image_url.startsWith('http')
      ? user.profile_image_url
      : `${api.defaults.baseURL || ''}${user.profile_image_url}${avatarVersion}`)
    : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}`

  useEffect(() => {
    Promise.all([
      investmentService.getHistory(),
      investmentService.getCredits(),
    ]).then(([h, c]) => {
      setAnalyses(h.data)
      setCredits(c.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    await investmentService.softDelete(id)
    setAnalyses(prev => prev.filter(a => a.id !== id))
  }

  async function handleRename(id, newName) {
    await investmentService.updateName(id, newName)
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, business_name: newName } : a))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Mis analisis</h1>
            <p className="text-gray-500 text-sm">Historial de analisis de viabilidad de inversion</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/trash" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
              🗑 Papelera
            </Link>
          </div>
        </div>

        {user && (
          <Link to="/profile" className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3 hover:border-green-300 transition-colors">
            <img
              src={profileImageSrc}
              alt="Perfil"
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || 'User')}`
              }}
            />
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-gray-400">
                Sesión iniciada {sessionStartedAt ? `· ${new Date(sessionStartedAt).toLocaleString()}` : ''} · Plan {planKey}
              </p>
            </div>
          </Link>
        )}

        {/* Contador de creditos */}
        {limit !== null && !loading && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-gray-900">Creditos de analisis</p>
                <p className="text-xs text-gray-500 mt-0.5">Los creditos usados no se recuperan al eliminar un analisis</p>
              </div>
              <span className={`text-2xl font-black ${atLimit ? 'text-red-500' : 'text-gray-900'}`}>
                {used}<span className="text-gray-400 text-base font-medium">/{limit}</span>
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((used / limit) * 100, 100)}%`,
                  backgroundColor: atLimit ? '#ef4444' : used >= limit * 0.8 ? '#f59e0b' : '#22c55e'
                }}
              />
            </div>
            {atLimit && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-red-500">Has usado todos tus creditos del plan Basic</p>
                <Link to="/upgrade" className="text-xs font-semibold px-3 py-1 rounded-md text-white" style={{ backgroundColor: '#22c55e' }}>
                  Actualizar plan →
                </Link>
              </div>
            )}
          </div>
        )}

        {atLimit && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-amber-800 font-semibold text-sm">Limite de {limit} analisis alcanzado</p>
              <p className="text-amber-600 text-xs mt-1">Actualiza a Pro para analisis ilimitados y exportacion PDF.</p>
            </div>
            <Link to="/upgrade" className="text-sm font-semibold px-4 py-2 rounded-md text-white whitespace-nowrap" style={{ backgroundColor: '#22c55e' }}>
              Ver planes →
            </Link>
          </div>
        )}

        {loading ? (
          <div className="text-gray-400 text-center py-20 text-sm">Cargando...</div>
        ) : analyses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl text-center py-16 px-6 shadow-sm">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-gray-900 font-black text-xl mb-2">Sin analisis aun</h3>
            <p className="text-gray-500 mb-6 text-sm">Crea tu primer analisis de viabilidad de inversion</p>
            <Link to="/analysis/new" className="font-semibold px-6 py-3 rounded-md text-white text-sm" style={{ backgroundColor: '#22c55e' }}>
              Analizar mi negocio →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {analyses.map(a => (
              <AnalysisCard key={a.id} analysis={a} onDelete={handleDelete} onRename={handleRename} />
            ))}
          </div>
        )}

        {isAdmin && (
          <section className="mt-8 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900">Acceso administrador temporal</h2>
            <p className="text-xs text-gray-500 mt-1">Usa este acceso para abrir el panel de usuarios, actividad y cambios de plan.</p>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                to="/admin"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white text-sm font-semibold"
                style={{ backgroundColor: '#22c55e' }}
              >
                Entrar a panel admin →
              </Link>
              <span className="text-xs text-gray-400">Correo temporal: admin@neuromarket.tmp</span>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function AnalysisCard({ analysis, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(analysis.business_name)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const score = analysis.viability_score
  const scoreColor = score >= 85 ? '#16a34a' : score >= 70 ? '#ca8a04' : score >= 50 ? '#ea580c' : '#dc2626'

  async function saveRename() {
    if (!name.trim() || name === analysis.business_name) { setEditing(false); return }
    setSaving(true)
    try { await onRename(analysis.id, name.trim()) }
    finally { setSaving(false); setEditing(false) }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative">
      {/* Acciones */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => { setEditing(true); setConfirmDelete(false) }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          title="Editar nombre"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z"/>
          </svg>
        </button>
        <button
          onClick={() => { setConfirmDelete(true); setEditing(false) }}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title="Mover a papelera"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center gap-3 p-4 z-10">
          <p className="text-sm font-semibold text-gray-900 text-center">Mover a papelera?</p>
          <p className="text-xs text-gray-500 text-center">El credito ya fue usado. Puedes restaurarlo despues.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={() => onDelete(analysis.id)} className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold">Eliminar</button>
          </div>
        </div>
      )}

      {/* Nombre editable */}
      {editing ? (
        <div className="mb-3">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditing(false) }}
            className="w-full border border-green-400 rounded-lg px-2 py-1 text-sm font-bold text-gray-900 focus:outline-none"
          />
          <div className="flex gap-2 mt-1.5">
            <button onClick={saveRename} disabled={saving} className="text-xs px-2 py-1 rounded text-white font-semibold" style={{ backgroundColor: '#22c55e' }}>
              {saving ? '...' : 'Guardar'}
            </button>
            <button onClick={() => { setEditing(false); setName(analysis.business_name) }} className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600">Cancelar</button>
          </div>
        </div>
      ) : (
        <Link to={`/analysis/${analysis.id}`} className="block mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-8">
              <h3 className="font-black text-gray-900 truncate hover:text-green-600 transition-colors">{analysis.business_name}</h3>
              <p className="text-gray-500 text-sm mt-0.5">{analysis.municipio}, {analysis.estado}</p>
            </div>
            <span className="text-2xl font-black flex-shrink-0" style={{ color: scoreColor }}>{score}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 mb-3">
            <div className="h-1.5 rounded-full" style={{ width: `${score}%`, backgroundColor: scoreColor }}/>
          </div>
          <div className="flex gap-3 text-xs text-gray-400">
            <span className="capitalize">{analysis.sector}</span>
            <span>·</span>
            <span className="capitalize">{analysis.status}</span>
          </div>
        </Link>
      )}
    </div>
  )
}
