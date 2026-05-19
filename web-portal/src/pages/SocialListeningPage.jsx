import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppNav from '../components/AppNav.jsx'
import { engineUrl } from '../services/api.js'

const SECTORS = [
  ['restaurante', 'Restaurantes y comida'],
  ['retail', 'Comercio minorista'],
  ['servicios', 'Servicios profesionales'],
  ['salud', 'Salud y bienestar'],
  ['educacion', 'Educacion'],
]

const FALLBACK_DENSITY = {
  libres: 42,
  oriental: 45,
  serdan: 52,
  acajete: 55,
  tehuacan: 72,
  cholula: 78,
  puebla: 85,
}

function localEstimate(municipio, sector) {
  const key = municipio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '')
  const base = FALLBACK_DENSITY[key] ?? 50
  const sectorBoost = sector === 'restaurante' ? 7 : sector === 'retail' ? 4 : sector === 'servicios' ? 2 : 0
  const density = Math.min(95, base + sectorBoost)
  return {
    densidad_digital: density,
    fuente: 'estimacion_local',
    senales: {
      facebook_score: Math.max(20, density - 6),
      google_maps_score: Math.min(98, density + 8),
    },
  }
}

export default function SocialListeningPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ municipio: 'Libres', estado: 'Puebla', sector: 'restaurante' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setData(null)

    try {
      const params = new URLSearchParams(form)
      const response = await fetch(engineUrl(`/api/engine/social-density?${params.toString()}`))
      if (!response.ok) throw new Error(`status ${response.status}`)
      const result = await response.json()
      setData({
        ...result,
        senales: result.senales || {
          facebook_score: Math.max(20, Number(result.densidad_digital || 0) - 6),
          google_maps_score: Math.min(98, Number(result.densidad_digital || 0) + 8),
        },
      })
    } catch {
      setError('No se pudo consultar el motor en tiempo real. Se activo una estimacion local para continuar el flujo.')
      setData(localEstimate(form.municipio, form.sector))
    } finally {
      setLoading(false)
    }
  }

  function useForAnalysis() {
    if (!data) return
    navigate('/analysis/new', {
      state: {
        municipio: form.municipio,
        estado: form.estado,
        sector: form.sector,
        densidad_digital: data.densidad_digital,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">← Dashboard</Link>
            <h1 className="mt-2 text-2xl font-black text-gray-900">Social Listening</h1>
            <p className="text-gray-500 text-sm">Pulso digital por municipio, sector y canal de descubrimiento.</p>
          </div>
          <Link to="/geo-maps" className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100">
            Ver mapas
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-black text-gray-900">Configurar escucha</h2>
            <Field label="Municipio">
              <input className="input-light" value={form.municipio} onChange={e => set('municipio', e.target.value)} required />
            </Field>
            <Field label="Estado">
              <input className="input-light" value={form.estado} onChange={e => set('estado', e.target.value)} required />
            </Field>
            <Field label="Sector">
              <select className="input-light" value={form.sector} onChange={e => set('sector', e.target.value)}>
                {SECTORS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <button disabled={loading} className="w-full py-3 rounded-lg text-white font-black disabled:opacity-60" style={{ backgroundColor: '#22c55e' }}>
              {loading ? 'Escaneando senales...' : 'Escanear pulso digital'}
            </button>
            {error && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{error}</p>}
          </form>

          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[420px]">
            {!data && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-gray-900">Listo para medir demanda digital</h2>
                <p className="text-gray-500 text-sm mt-2 max-w-md">El resultado se puede enviar directo al formulario de inversion para alimentar el IRL.</p>
              </div>
            )}

            {loading && <div className="text-center text-gray-400 py-24 text-sm">Conectando con el motor de analisis...</div>}

            {data && !loading && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-green-600">Densidad digital</p>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-6xl font-black text-gray-900">{Math.round(data.densidad_digital)}</span>
                      <span className="text-xl font-bold text-gray-400 mb-2">/100</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{form.municipio}, {form.estado} · {form.sector}</p>
                  </div>
                  <button onClick={useForAnalysis} className="px-5 py-3 rounded-lg text-white font-black" style={{ backgroundColor: '#22c55e' }}>
                    Usar en nuevo analisis →
                  </button>
                </div>

                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(100, data.densidad_digital)}%` }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SignalCard label="Facebook y comunidad" value={data.senales.facebook_score} color="#1877F2" />
                  <SignalCard label="Google Maps y busqueda local" value={data.senales.google_maps_score} color="#ef4444" />
                </div>

                <div className="bg-gray-900 rounded-xl p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3">Lectura estrategica</p>
                  <p className="text-sm text-gray-300">
                    La actividad detectada es {data.densidad_digital >= 70 ? 'alta' : data.densidad_digital >= 45 ? 'moderada' : 'baja'}.
                    Conviene validar este dato con la ubicacion fisica, competencia cercana y ticket promedio antes de invertir.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function SignalCard({ label, value, color }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-gray-900 text-sm">{label}</p>
        <span className="font-black" style={{ color }}>{Math.round(value)}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
