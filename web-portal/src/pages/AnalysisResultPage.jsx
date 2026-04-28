import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, CartesianGrid } from 'recharts'
import { investmentService } from '../services/investment.service.js'
import { useAuthStore } from '../store/auth.store.js'
import AppNav from '../components/AppNav.jsx'

const scoreColor = s => s >= 85 ? '#16a34a' : s >= 70 ? '#ca8a04' : s >= 50 ? '#ea580c' : '#dc2626'
const scoreLabel = s => s >= 85 ? 'Excelente' : s >= 70 ? 'Bueno' : s >= 50 ? 'Regular' : 'Riesgo Alto'

export default function AnalysisResultPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const { user } = useAuthStore()
  const isPro = user?.plan_type === 'pro' || user?.plan_type === 'enterprise'
  const [simInversion, setSimInversion] = useState(null)

  useEffect(() => {
    investmentService.getOne(id)
      .then(({ data }) => {
        const d = data.result || data
        setData(d)
        setSimInversion(d.roi?.inversion_inicial || 50000)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true)
      const response = await investmentService.downloadReportPdf(id)
      const contentType = response.headers?.['content-type'] || ''
      if (!contentType.includes('application/pdf')) {
        throw new Error('El servidor no devolvió un PDF válido')
      }

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const disposition = response.headers?.['content-disposition'] || ''
      const match = disposition.match(/filename=\"?([^\";]+)\"?/i)
      const fileName = match?.[1] || `xaiza_${id}.pdf`

      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      let msg = error?.message || 'No se pudo exportar el PDF'

      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text()
          const parsed = JSON.parse(text)
          msg = parsed?.error || msg
        } catch {
          msg = error?.message || msg
        }
      } else if (error?.response?.data?.error) {
        msg = error.response.data.error
      }

      alert(msg)
    } finally {
      setDownloadingPdf(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">Cargando resultado...</div>
  )
  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">No se pudo cargar el analisis</p>
        <Link to="/dashboard" className="font-semibold px-4 py-2 rounded-md text-white" style={{ backgroundColor: '#22c55e' }}>Volver al dashboard</Link>
      </div>
    </div>
  )

  const score = data.viability_score
  const rating = data.rating || {}
  const roi = data.roi || {}
  const mc = data.monte_carlo || {}
  const svee = data.svee || {}
  const irl = data.irl || {}
  const tam = data.tam_som || {}
  const color = scoreColor(score)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav showNewAnalysis={false}/>

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-700 text-sm transition-colors">← Dashboard</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-900">Resultado del analisis</span>
          </div>
          {isPro ? (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
              style={{ backgroundColor: downloadingPdf ? '#86efac' : '#22c55e' }}
            >
              {downloadingPdf ? 'Exportando...' : 'Exportar PDF'}
            </button>
          ) : (
            <Link to="/upgrade"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-medium rounded-lg transition-colors"
            >
              Exportar PDF (Pro)
            </Link>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Score principal */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <div className="text-7xl font-black mb-2" style={{ color }}>{score}</div>
          <div className="text-gray-900 font-black text-2xl mb-1">{rating.icon} {scoreLabel(score)}</div>
          <p className="text-gray-500 text-sm">Score de Viabilidad Global</p>
          <div className="mt-6 max-w-md mx-auto bg-gray-100 rounded-full h-3">
            <div className="h-3 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }}/>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'ROI Realista', value: `${mc.escenarios?.realista?.roi ?? roi.roi_porcentaje}%`, color: '#16a34a' },
            { label: 'Break-even', value: roi.break_even_meses ? `${roi.break_even_meses} meses` : '—', color: '#2563eb' },
            { label: 'Prob. exito', value: `${mc.prob_positivo ?? 0}%`, color: '#ca8a04' },
            { label: 'IRL Score', value: irl.irl_score ?? 0, color: '#6b7280' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
              <div className="text-2xl font-black mb-1" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="text-gray-500 text-xs">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Monte Carlo */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-black text-gray-900 text-lg mb-5">Simulacion Monte Carlo — 3 Escenarios</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Pesimista (P10)', roi: mc.escenarios?.pesimista?.roi, color: '#dc2626', bg: 'bg-red-50 border-red-200' },
              { label: 'Realista (P50)', roi: mc.escenarios?.realista?.roi, color: '#ca8a04', bg: 'bg-amber-50 border-amber-200 ring-2 ring-amber-300' },
              { label: 'Optimista (P90)', roi: mc.escenarios?.optimista?.roi, color: '#16a34a', bg: 'bg-green-50 border-green-200' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
                <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.roi ?? '—'}%</div>
                <div className="text-gray-500 text-xs">ROI {s.label}</div>
              </div>
            ))}
          </div>
          {mc.interpretacion && <p className="text-gray-500 text-sm mt-4 text-center">{mc.interpretacion}</p>}
        </div>

        {/* Flujo mensual */}
        {roi.flujo_mensual?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-black text-gray-900 text-lg mb-5">Proyeccion de Flujo Mensual</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={roi.flujo_mensual}>
                <XAxis dataKey="mes" tick={{ fill: '#9ca3af', fontSize: 12 }}/>
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }}/>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#111' }}/>
                <Bar dataKey="utilidad_neta" fill="#22c55e" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* TAM/SAM/SOM + SVEE */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-black text-gray-900 text-base mb-4">Tamano de Mercado</h2>
            {[
              { label: 'TAM (Total)', value: tam.tam },
              { label: 'SAM (Disponible)', value: tam.sam },
              { label: 'SOM (Capturable ano 1)', value: tam.som },
            ].map(m => (
              <div key={m.label} className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-500 text-sm">{m.label}</span>
                <span className="text-gray-900 font-semibold text-sm">${Number(m.value || 0).toLocaleString()}</span>
              </div>
            ))}
            {tam.interpretation && <p className="text-gray-400 text-xs mt-3">{tam.interpretation}</p>}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-black text-gray-900 text-base mb-1">Ventana Optima de Entrada</h2>
            <div className="text-center py-3">
              <div className="text-4xl font-black mb-1" style={{ color: '#22c55e' }}>{svee.best_month}</div>
              <div className="text-gray-500 text-xs mb-2">Mejor mes para abrir · Prepara desde <strong>{svee.prep_start_month}</strong></div>
              {svee.recommendation && <p className="text-gray-500 text-xs">{svee.recommendation}</p>}
            </div>
          </div>
        </div>

        {/* SVEE: Gráfico mensual de oportunidad */}
        {svee.monthly_data?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-black text-gray-900 text-lg mb-1">Mapa de Ventanas Estratégicas (SVEE)</h2>
            <p className="text-gray-400 text-xs mb-5">Score de oportunidad por mes — mayor barra = mejor momento para abrir</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={svee.monthly_data}>
                <XAxis dataKey="mes" tick={{ fill: '#9ca3af', fontSize: 11 }}/>
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 'auto']}/>
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                  formatter={(v, _n, p) => [`${v} (IDM: ${p.payload.idm})`, 'SVEE Score']}
                />
                <Bar
                  dataKey="svee_score"
                  radius={[4,4,0,0]}
                  fill="#22c55e"
                  isAnimationActive={true}
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
            {/* Top 3 meses */}
            {svee.ranking?.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {svee.ranking.slice(0, 3).map((r, i) => (
                  <span key={r.mes} className={`text-xs font-semibold px-3 py-1 rounded-full border ${i === 0 ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    {i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉'} {r.mes}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* IRL */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-black text-gray-900 text-base mb-1">Indice de Realidad Local — {irl.irl_score}/100</h2>
          <p className="text-gray-500 text-sm mb-4">{irl.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {irl.contribution && Object.entries(irl.contribution).map(([k, v]) => (
              <div key={k} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <div className="font-black text-gray-900" style={{ color: '#22c55e' }}>{v}</div>
                <div className="text-gray-500 text-xs mt-1 capitalize">{k.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulador de Capital */}
        <CapitalSimulator roi={roi} simInversion={simInversion} setSimInversion={setSimInversion}/>
      </main>
    </div>
  )
}

function CapitalSimulator({ roi, simInversion, setSimInversion }) {
  if (!roi || !roi.ingreso_base || !roi.margen_utilidad) return null

  const margen = roi.margen_utilidad || 0.30
  const ingresoBase = roi.ingreso_base || 20000
  const costosFijos = roi.costos_fijos || 0
  const inv = simInversion || 50000

  // Proyección de 24 meses con la inversión del slider
  const meses = 24
  const IDM = [0.85,0.90,1.00,1.00,1.10,0.95,1.00,1.00,1.15,1.00,1.20,1.30,0.85,0.90,1.00,1.00,1.10,0.95,1.00,1.00,1.15,1.00,1.20,1.30]
  const MESES_NOMBRES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

  let acumulado = -inv
  const flujo = IDM.slice(0, meses).map((idm, i) => {
    const ingreso = ingresoBase * idm
    const utilidad = ingreso * margen - costosFijos
    acumulado += utilidad
    return { mes: MESES_NOMBRES[i], utilidad: Math.round(utilidad), acumulado: Math.round(acumulado) }
  })

  const breakEvenMes = flujo.findIndex(f => f.acumulado >= 0)
  const roiSimulado = acumulado > 0 ? Math.round((acumulado / inv) * 100) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="font-black text-gray-900 text-lg mb-1">Simulador de Capital</h2>
      <p className="text-gray-400 text-xs mb-5">Ajusta tu inversion inicial y ve como cambia el break-even y ROI a 24 meses</p>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">Inversion Inicial</label>
          <span className="text-xl font-black text-gray-900">${Number(inv).toLocaleString()}</span>
        </div>
        <input
          type="range" min="10000" max="500000" step="5000"
          value={inv}
          onChange={e => setSimInversion(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#22c55e' }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$10,000</span><span>$500,000</span>
        </div>
      </div>

      {/* KPIs simulados */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-xl font-black" style={{ color: '#16a34a' }}>{roiSimulado}%</div>
          <div className="text-gray-500 text-xs mt-0.5">ROI 24 meses</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-xl font-black text-blue-700">
            {breakEvenMes >= 0 ? `Mes ${breakEvenMes + 1}` : '+24m'}
          </div>
          <div className="text-gray-500 text-xs mt-0.5">Break-even</div>
        </div>
        <div className={`rounded-xl p-4 text-center border ${acumulado >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`text-xl font-black ${acumulado >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            ${Math.abs(Math.round(acumulado / 1000))}k
          </div>
          <div className="text-gray-500 text-xs mt-0.5">{acumulado >= 0 ? 'Ganancia neta' : 'Pérdida neta'}</div>
        </div>
      </div>

      {/* Gráfica acumulado */}
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={flujo}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
          <XAxis dataKey="mes" tick={{ fill: '#9ca3af', fontSize: 10 }}/>
          <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={v => `$${Math.round(v/1000)}k`}/>
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
            formatter={v => [`$${Number(v).toLocaleString()}`, 'Flujo acumulado']}
          />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Break-even', fill: '#ef4444', fontSize: 10 }}/>
          <Line type="monotone" dataKey="acumulado" stroke="#22c55e" strokeWidth={2} dot={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
