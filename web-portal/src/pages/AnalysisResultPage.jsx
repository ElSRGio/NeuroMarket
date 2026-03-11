import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { investmentService } from '../services/investment.service.js'

export default function AnalysisResultPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    investmentService.getOne(id)
      .then(({ data }) => setData(data.result || data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading />
  if (!data) return <Error />

  const score = data.viability_score
  const rating = data.rating || {}
  const roi = data.roi || {}
  const mc = data.monte_carlo || {}
  const svee = data.svee || {}
  const irl = data.irl || {}
  const tam = data.tam_som || {}

  return (
    <div className="min-h-screen bg-brand-darker">
      <header className="border-b border-white/10 px-6 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="font-bold text-white">Resultado del análisis</span>
        </div>
        <a
          href={`/api/v2/reports/${id}/pdf`}
          download
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          📄 Exportar PDF
        </a>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Score principal */}
        <div className="card text-center py-10">
          <div className={`text-8xl font-black mb-2 ${scoreColor(score)}`}>{score}</div>
          <div className="text-white font-bold text-2xl mb-1">{rating.icon} {rating.label}</div>
          <div className="text-gray-400">Score de Viabilidad Global</div>
        </div>

        {/* KPIs rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="ROI Realista" value={`${mc.escenarios?.realista?.roi ?? roi.roi_porcentaje}%`} color="text-brand-green" />
          <KPI label="Break-even" value={roi.break_even_meses ? `${roi.break_even_meses} meses` : '—'} color="text-brand-blue" />
          <KPI label="Prob. éxito" value={`${mc.prob_positivo ?? 0}%`} color="text-yellow-400" />
          <KPI label="IRL Score" value={irl.irl_score ?? 0} color="text-white" />
        </div>

        {/* Monte Carlo escenarios */}
        <div className="card">
          <h2 className="font-bold text-white text-lg mb-6">Simulación Monte Carlo — 3 Escenarios</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <Scenario label="Pesimista (P10)" roi={mc.escenarios?.pesimista?.roi} color="text-red-400" />
            <Scenario label="Realista (P50)" roi={mc.escenarios?.realista?.roi} color="text-yellow-400" highlight />
            <Scenario label="Optimista (P90)" roi={mc.escenarios?.optimista?.roi} color="text-brand-green" />
          </div>
          {mc.interpretacion && (
            <p className="text-gray-400 text-sm mt-4 text-center">{mc.interpretacion}</p>
          )}
        </div>

        {/* Flujo mensual */}
        {roi.flujo_mensual?.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-white text-lg mb-6">Proyección de Flujo Mensual</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={roi.flujo_mensual}>
                <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0b1f3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Bar dataKey="utilidad_neta" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* TAM/SAM/SOM + SVEE */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-bold text-white text-lg mb-4">Tamaño de Mercado</h2>
            {[
              { label: 'TAM (Total)', value: tam.tam },
              { label: 'SAM (Disponible)', value: tam.sam },
              { label: 'SOM (Capturable año 1)', value: tam.som },
            ].map(m => (
              <div key={m.label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-gray-400 text-sm">{m.label}</span>
                <span className="text-white font-semibold text-sm">${Number(m.value || 0).toLocaleString()}</span>
              </div>
            ))}
            {tam.interpretation && <p className="text-gray-500 text-xs mt-3">{tam.interpretation}</p>}
          </div>

          <div className="card">
            <h2 className="font-bold text-white text-lg mb-4">Ventana Óptima de Entrada</h2>
            <div className="text-center py-4">
              <div className="text-4xl font-black text-brand-green mb-1">{svee.best_month}</div>
              <div className="text-gray-400 text-sm mb-4">Mejor mes para abrir</div>
              {svee.recommendation && (
                <p className="text-gray-400 text-sm">{svee.recommendation}</p>
              )}
            </div>
          </div>
        </div>

        {/* IRL Desglose */}
        <div className="card">
          <h2 className="font-bold text-white text-lg mb-2">Índice de Realidad Local — {irl.irl_score}/100</h2>
          <p className="text-gray-400 text-sm mb-4">{irl.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {irl.contribution && Object.entries(irl.contribution).map(([k, v]) => (
              <div key={k} className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-brand-blue font-bold">{v}</div>
                <div className="text-gray-500 text-xs mt-1">{k.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

const scoreColor = s => s >= 85 ? 'text-brand-green' : s >= 70 ? 'text-yellow-400' : s >= 50 ? 'text-orange-400' : 'text-red-400'

function KPI({ label, value, color }) {
  return (
    <div className="card text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-gray-500 text-xs mt-1">{label}</div>
    </div>
  )
}

function Scenario({ label, roi, color, highlight }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5'}`}>
      <div className={`text-3xl font-black mb-1 ${color}`}>{roi ?? '—'}%</div>
      <div className="text-gray-400 text-xs">ROI {label}</div>
    </div>
  )
}

function Loading() {
  return <div className="min-h-screen bg-brand-darker flex items-center justify-center text-gray-400">Cargando resultado...</div>
}

function Error() {
  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">No se pudo cargar el análisis</p>
        <Link to="/dashboard" className="btn-primary">Volver al dashboard</Link>
      </div>
    </div>
  )
}
