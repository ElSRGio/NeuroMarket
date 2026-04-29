import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, CartesianGrid } from 'recharts'
import { investmentService } from '../services/investment.service.js'
import { useAuthStore } from '../store/auth.store.js'
import AppNav from '../components/AppNav.jsx'

const scoreColor = s => s >= 85 ? '#34d399' : s >= 70 ? '#fbbf24' : s >= 50 ? '#fb923c' : '#f43f5e'
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      {/* Orbes de luz de fondo (Spatial Computing) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <AppNav showNewAnalysis={false}/>

        {/* Sub-header */}
        <div className="bg-white/5 border-b border-white/10 backdrop-blur-md px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">← Dashboard</Link>
              <span className="text-slate-600">/</span>
              <span className="text-sm font-semibold text-white">Resultado del analisis</span>
            </div>
            {isPro ? (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                style={{ backgroundColor: downloadingPdf ? '#059669' : '#10b981' }}
              >
                {downloadingPdf ? 'Exportando...' : 'Exportar PDF'}
              </button>
            ) : (
              <Link to="/upgrade"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Exportar PDF (Pro)
              </Link>
            )}
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Tier de Viabilidad (Reemplaza al Score mágico) */}
          <div className={`border rounded-[2rem] p-8 text-center backdrop-blur-2xl shadow-2xl transition-all duration-1000 ${roi.tier_viabilidad?.includes('Óptimo') ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.15)]' : roi.tier_viabilidad?.includes('Ajustado') ? 'bg-amber-400/10 border-amber-400/20 text-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.15)]' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.15)]'}`}>
            <div className="font-black text-3xl sm:text-4xl mb-3">{roi.tier_viabilidad || 'Análisis Completado'}</div>
            <p className="text-base font-medium max-w-2xl mx-auto opacity-80">{roi.diagnostico_alcance || 'Resultados de la proyección calculados.'}</p>
          </div>

          {/* XAZIA Market Radar (Powered by Apify) */}
          {roi.radar_apify && (
            <div className="rounded-[2rem] bg-white/5 border border-blue-500/20 backdrop-blur-2xl shadow-[0_0_30px_rgba(59,130,246,0.1)] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500/20 border-b border-l border-blue-500/20 text-blue-300 text-xs font-bold px-4 py-2 rounded-bl-2xl">Powered by Apify</div>
              <h2 className="font-black text-white text-lg mb-5 flex items-center gap-2">📡 XAZIA Market Radar</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-center">
                  <p className="text-sm text-slate-300 mb-4">{roi.radar_apify.mensaje}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saturación:</span>
                    <span className={`px-3 py-1 text-xs font-black rounded-md ${roi.radar_apify.saturacion === 'ALTA' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : roi.radar_apify.saturacion === 'MEDIA' ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'}`}>
                      {roi.radar_apify.saturacion}
                    </span>
                  </div>
                </div>
                <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                  <p className="text-xs text-blue-400 uppercase tracking-wider font-bold mb-2">Impacto en tu Presupuesto</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{roi.radar_apify.impacto}</p>
                </div>
              </div>
            </div>
          )}

          {/* Módulo de Alternativas (PIVOTEO) */}
          {roi.alternativas_pivote?.length > 0 && (
            <div className="rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl p-8 text-white">
              <h2 className="font-black text-white text-lg mb-3 flex items-center gap-2">💡 Estrategia de Pivoteo Recomendada</h2>
              <p className="text-slate-400 text-sm mb-6">Tu presupuesto es insuficiente para el modelo físico tradicional. XAZIA te recomienda estas alternativas viables:</p>
              <div className="grid sm:grid-cols-3 gap-5">
                {roi.alternativas_pivote.map((piv, i) => (
                  <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors">
                    <div className="text-emerald-400 font-black text-sm mb-2">Opción {i + 1}</div>
                    <div className="text-sm font-medium text-slate-200">{piv}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Runway (Meses de vida)', value: roi.runway_meses !== undefined ? `${roi.runway_meses} meses` : '—', color: roi.runway_meses >= 6 ? '#34d399' : roi.runway_meses >= 3 ? '#fbbf24' : '#f43f5e' },
              { label: 'Break-even (Clientes/mes)', value: roi.clientes_equilibrio !== undefined ? `${roi.clientes_equilibrio}` : '—', color: '#60a5fa' },
              { label: 'Prob. exito', value: `${mc.prob_positivo ?? 0}%`, color: '#fbbf24' },
              { label: 'IRL Score', value: irl.irl_score ?? 0, color: '#94a3b8' },
            ].map(kpi => (
              <div key={kpi.label} className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center backdrop-blur-sm shadow-xl">
                <div className="text-3xl font-light mb-2 drop-shadow-md" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Alerta de Supervivencia */}
          {roi.viabilidad && (
            <div className={`rounded-2xl p-6 border backdrop-blur-md ${roi.viabilidad.includes('Peligro') ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.1)]' : 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.1)]'}`}>
              <div className="font-black text-sm mb-2 flex items-center gap-2 uppercase tracking-wider">{roi.viabilidad.includes('Peligro') ? '⚠️' : '✅'} Diagnóstico de Supervivencia</div>
              <div className="text-sm font-medium opacity-90">{roi.viabilidad}. Tienes un Capital de Trabajo de <strong className="text-white">${Number(roi.capital_trabajo || 0).toLocaleString()} MXN</strong> en efectivo real.</div>
            </div>
          )}

          {/* Monte Carlo */}
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
            <h2 className="font-black text-white text-lg mb-6">Simulador de Crisis — 3 Escenarios</h2>
            <div className="grid grid-cols-3 gap-5 text-center">
              {[
                { label: 'Escenario Pesimista', roi: mc.escenarios?.pesimista?.roi, color: '#f43f5e', bg: 'bg-black/40 border-rose-500/20' },
                { label: 'Escenario Realista', roi: mc.escenarios?.realista?.roi, color: '#fbbf24', bg: 'bg-black/40 border-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]' },
                { label: 'Escenario Optimista', roi: mc.escenarios?.optimista?.roi, color: '#34d399', bg: 'bg-black/40 border-emerald-400/20' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-5 border ${s.bg}`}>
                  <div className="text-3xl font-light mb-2 drop-shadow-md" style={{ color: s.color }}>{s.roi ?? '—'}%</div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold text-balance">{s.label}</div>
                </div>
              ))}
            </div>
            {mc.interpretacion && <p className="text-slate-400 text-sm mt-6 text-center">{mc.interpretacion}</p>}
          </div>

          {/* Flujo mensual */}
          {roi.flujo_mensual?.length > 0 && (
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
              <h2 className="font-black text-white text-lg mb-6">Proyección de Flujo Mensual</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={roi.flujo_mensual}>
                  <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 12 }} stroke="#334155"/>
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} stroke="#334155"/>
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#f8fafc' }} itemStyle={{ color: '#34d399' }}/>
                  <Bar dataKey="utilidad_neta" fill="#34d399" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* TAM/SAM/SOM + SVEE */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
              <h2 className="font-black text-white text-base mb-5">Tamaño de Mercado</h2>
              {[
                { label: 'Mercado Total (TAM)', value: tam.tam_personas ? `${Number(tam.tam_personas).toLocaleString()} personas` : `$${Number(tam.tam || 0).toLocaleString()}` },
                { label: 'Clientes con Poder Adquisitivo (SAM)', value: tam.sam_personas ? `${Number(tam.sam_personas).toLocaleString()} personas` : `$${Number(tam.sam || 0).toLocaleString()}` },
                { label: 'Tu Meta de Ventas (SOM)', value: tam.som_personas ? `${Number(tam.som_personas).toLocaleString()} clientes` : `$${Number(tam.som || 0).toLocaleString()}` },
              ].map(m => (
                <div key={m.label} className="flex justify-between items-center py-3.5 border-b border-white/5 last:border-0">
                  <span className="text-slate-400 text-sm font-medium">{m.label}</span>
                  <span className="text-white font-semibold text-sm">{m.value}</span>
                </div>
              ))}
              {tam.interpretation && <p className="text-slate-500 text-xs mt-4">{tam.interpretation}</p>}
            </div>

            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col justify-center text-center">
              <h2 className="font-black text-white text-base mb-2">Ventana Óptima de Entrada</h2>
              <div className="py-4">
                <div className="text-5xl font-light mb-3 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{svee.best_month}</div>
                <div className="text-slate-400 text-xs mb-3 uppercase tracking-wider">Mejor mes para abrir · Prepara desde <strong className="text-white">{svee.prep_start_month}</strong></div>
                {svee.recommendation && <p className="text-slate-500 text-sm">{svee.recommendation}</p>}
              </div>
            </div>
          </div>

          {/* SVEE: Gráfico mensual de oportunidad */}
          {svee.monthly_data?.length > 0 && (
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
              <h2 className="font-black text-white text-lg mb-1">Mejor Mes para Abrir</h2>
              <p className="text-slate-400 text-xs mb-6 uppercase tracking-wider">Oportunidad estacional — mayor barra = mejor momento</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={svee.monthly_data}>
                  <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} stroke="#334155"/>
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 'auto']} stroke="#334155"/>
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#f8fafc' }}
                    formatter={(v, _n, p) => [`${v} (IDM: ${p.payload.idm})`, 'SVEE Score']}
                  />
                  <Bar
                    dataKey="svee_score"
                    radius={[4,4,0,0]}
                    fill="#34d399"
                    isAnimationActive={true}
                    label={false}
                  />
                </BarChart>
              </ResponsiveContainer>
              {/* Top 3 meses */}
              {svee.ranking?.length > 0 && (
                <div className="flex gap-3 mt-6 flex-wrap">
                  {svee.ranking.slice(0, 3).map((r, i) => (
                    <span key={r.mes} className={`text-xs font-semibold px-4 py-1.5 rounded-full border backdrop-blur-md ${i === 0 ? 'bg-emerald-400/20 border-emerald-400/30 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.1)]' : 'bg-black/40 border-white/10 text-slate-300'}`}>
                      {i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉'} {r.mes}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* IRL */}
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
            <h2 className="font-black text-white text-base mb-2">Índice de Realidad Local — {irl.irl_score}/100</h2>
            <p className="text-slate-400 text-sm mb-6">{irl.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {irl.contribution && Object.entries(irl.contribution).map(([k, v]) => (
                <div key={k} className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                  <div className="font-black text-2xl text-emerald-400 drop-shadow-sm">{v}</div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-widest mt-2 font-semibold">{k.replace(/_/g, ' ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulador de Capital */}
          <CapitalSimulator roi={roi} simInversion={simInversion} setSimInversion={setSimInversion}/>
        </main>
      </div>
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
    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
      <h2 className="font-black text-white text-lg mb-1">Simulador de Capital Espacial</h2>
      <p className="text-slate-400 text-xs mb-6 uppercase tracking-wider">Ajusta tu inversión inicial para proyectar a 24 meses</p>

      {/* Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-300">Inversión Inicial</label>
          <span className="text-2xl font-light text-emerald-400 drop-shadow-sm">${Number(inv).toLocaleString()}</span>
        </div>
        <input
          type="range" min="10000" max="500000" step="5000"
          value={inv}
          onChange={e => setSimInversion(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#34d399', background: 'rgba(255,255,255,0.1)' }}
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
          <span>$10,000</span><span>$500,000</span>
        </div>
      </div>

      {/* KPIs simulados */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-5 text-center shadow-[0_0_15px_rgba(52,211,153,0.1)]">
          <div className="text-2xl font-light text-emerald-400">{roiSimulado}%</div>
          <div className="text-slate-400 text-[10px] uppercase tracking-widest mt-1 font-semibold">ROI 24 meses</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 text-center">
          <div className="text-2xl font-light text-blue-400">
            {breakEvenMes >= 0 ? `Mes ${breakEvenMes + 1}` : '+24m'}
          </div>
          <div className="text-slate-400 text-[10px] uppercase tracking-widest mt-1 font-semibold">Break-even</div>
        </div>
        <div className={`rounded-2xl p-5 text-center border backdrop-blur-md ${acumulado >= 0 ? 'bg-emerald-400/10 border-emerald-400/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
          <div className={`text-2xl font-light ${acumulado >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${Math.abs(Math.round(acumulado / 1000))}k
          </div>
          <div className="text-slate-400 text-[10px] uppercase tracking-widest mt-1 font-semibold">{acumulado >= 0 ? 'Ganancia neta' : 'Pérdida neta'}</div>
        </div>
      </div>

      {/* Gráfica acumulado */}
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={flujo}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10"/>
          <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#334155"/>
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} stroke="#334155" tickFormatter={v => `$${Math.round(v/1000)}k`}/>
          <Tooltip
            contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: 12, color: '#f8fafc' }}
            itemStyle={{ color: '#34d399' }}
            formatter={v => [`$${Number(v).toLocaleString()}`, 'Flujo acumulado']}
          />
          <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Break-even', fill: '#f43f5e', fontSize: 10, position: 'insideTopLeft' }}/>
          <Line type="monotone" dataKey="acumulado" stroke="#34d399" strokeWidth={3} dot={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
