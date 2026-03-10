import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { investmentService, authService } from '../services/investment.service.js'

const DEFAULT_IDM = [0.85, 0.90, 1.00, 1.00, 1.10, 0.95, 1.00, 1.00, 1.15, 1.00, 1.20, 1.30]

export default function NewAnalysisPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [municipios, setMunicipios] = useState([])
  const [form, setForm] = useState({
    business_name: '',
    sector: 'general',
    municipio: 'Libres',
    estado: 'Puebla',
    inversion_inicial: '',
    ingreso_base: '',
    margen_utilidad: '0.30',
    costos_fijos: '',
    densidad_digital: '42',
    validacion_fisica: '55',
    nivel_bancarizacion: '38',
    indice_empleo: '48',
    conectividad: '55',
    poblacion: '15420',
    gasto_promedio: '2400',
  })

  useEffect(() => {
    fetch('/api/v2/municipios')
      .then(r => r.json())
      .then(({ data }) => setMunicipios(data || []))
      .catch(() => {})
  }, [])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleMunicipioChange(e) {
    const id = e.target.value
    const m = municipios.find(x => String(x.id) === id)
    if (!m) return
    setForm(f => ({
      ...f,
      municipio: m.nombre,
      estado: m.estado,
      densidad_digital: String(m.densidad_digital),
      validacion_fisica: String(m.validacion_fisica),
      nivel_bancarizacion: String(m.nivel_bancarizacion),
      indice_empleo: String(m.indice_empleo),
      conectividad: String(m.conectividad),
      poblacion: String(m.poblacion),
      gasto_promedio: String(m.gasto_promedio_mensual),
    }))
  }

  const [socialLoading, setSocialLoading] = useState(false)
  const [socialStatus, setSocialStatus] = useState('')

  async function fetchSocialData() {
    if (!form.municipio) return
    setSocialLoading(true)
    setSocialStatus('')
    try {
      const res = await fetch(
        `/api/engine/social-density?municipio=${encodeURIComponent(form.municipio)}&estado=${encodeURIComponent(form.estado)}&sector=${encodeURIComponent(form.sector)}`
      )
      const data = await res.json()
      if (data.densidad_digital !== undefined) {
        set('densidad_digital', String(data.densidad_digital))
        const isMock = data.fuente === 'mock_inegi'
        setSocialStatus(isMock
          ? `📊 Estimación INEGI: ${data.densidad_digital}/100 (configura APIFY_API_TOKEN para datos reales)`
          : `✅ Datos reales de redes sociales: ${data.densidad_digital}/100`
        )
        if (data.menciones_estimadas_12m) {
          setForm(f => ({ ...f, densidad_digital: String(data.densidad_digital) }))
        }
      }
    } catch {
      setSocialStatus('❌ No se pudo conectar con el motor de análisis')
    } finally {
      setSocialLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        business_name: form.business_name,
        sector: form.sector,
        municipio: form.municipio,
        estado: form.estado,
        factor_competencia: 0.8,
        menciones_mensuales: DEFAULT_IDM.map(v => Math.round(v * 100)),
        irl_params: {
          densidad_digital: +form.densidad_digital,
          validacion_fisica: +form.validacion_fisica,
          nivel_bancarizacion: +form.nivel_bancarizacion,
          indice_empleo: +form.indice_empleo,
          conectividad: +form.conectividad,
        },
        tam_params: {
          poblacion: +form.poblacion,
          gasto_promedio: +form.gasto_promedio,
          sector: form.sector,
          pct_mercado_accesible: 30,
          pct_cuota_capturable: 5,
        },
        roi_params: {
          inversion_inicial: +form.inversion_inicial,
          ingreso_base: +form.ingreso_base,
          margen_utilidad: +form.margen_utilidad,
          costos_fijos: +form.costos_fijos,
          idm_array: DEFAULT_IDM,
        },
        mc_params: {
          ingreso_esperado: +form.ingreso_base,
          costo_esperado: +form.costos_fijos,
          inversion_inicial: +form.inversion_inicial,
          meses: 12,
        },
      }
      const { data } = await investmentService.analyze(payload)
      navigate(`/analysis/${data.analysis_id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el análisis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <header className="border-b border-white/10 px-6 py-4 max-w-7xl mx-auto flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">← Volver</Link>
        <span className="font-bold text-white">Nuevo análisis de inversión</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">{error}</div>}

          {/* Negocio */}
          <section className="card space-y-4">
            <h2 className="font-bold text-white text-lg">Datos del negocio</h2>
            <Field label="Nombre del negocio" required>
              <input className={INPUT} value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Ej: Restaurante La Familia" required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sector">
                <select className={INPUT} value={form.sector} onChange={e => set('sector', e.target.value)}>
                  {['general','restaurante','retail','servicios','salud','educacion','entretenimiento','tecnologia'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Municipio">
                {municipios.length > 0 ? (
                  <select className={INPUT} onChange={handleMunicipioChange} defaultValue="">
                    <option value="" disabled>Selecciona...</option>
                    {municipios.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}, {m.estado}</option>
                    ))}
                  </select>
                ) : (
                  <input className={INPUT} value={form.municipio} onChange={e => set('municipio', e.target.value)} />
                )}
              </Field>
            </div>
          </section>

          {/* Financiero */}
          <section className="card space-y-4">
            <h2 className="font-bold text-white text-lg">Datos financieros</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Inversión inicial ($)">
                <input className={INPUT} type="number" min="1" required value={form.inversion_inicial} onChange={e => set('inversion_inicial', e.target.value)} placeholder="50000" />
              </Field>
              <Field label="Ingreso base mensual ($)">
                <input className={INPUT} type="number" min="1" required value={form.ingreso_base} onChange={e => set('ingreso_base', e.target.value)} placeholder="20000" />
              </Field>
              <Field label="Margen de utilidad (0–1)">
                <input className={INPUT} type="number" step="0.01" min="0.01" max="0.99" required value={form.margen_utilidad} onChange={e => set('margen_utilidad', e.target.value)} />
              </Field>
              <Field label="Costos fijos mensuales ($)">
                <input className={INPUT} type="number" min="0" value={form.costos_fijos} onChange={e => set('costos_fijos', e.target.value)} placeholder="5000" />
              </Field>
            </div>
          </section>

          {/* IRL */}
          <section className="card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-lg">Índice de Realidad Local (IRL)</h2>
                <p className="text-gray-400 text-sm">Valores del 0 al 100 para tu municipio</p>
              </div>
              <button
                type="button"
                onClick={fetchSocialData}
                disabled={socialLoading || !form.municipio}
                className="text-xs bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue px-3 py-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                {socialLoading ? '⏳ Analizando...' : '📡 Auto-rellenar con datos sociales'}
              </button>
            </div>
            {socialStatus && (
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-gray-300">
                {socialStatus}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {[
                ['densidad_digital','Densidad Digital'],['validacion_fisica','Validación Física'],
                ['nivel_bancarizacion','Bancarización'],['indice_empleo','Empleo Formal'],
                ['conectividad','Conectividad 4G/5G'],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input className={INPUT} type="number" min="0" max="100" value={form[key]} onChange={e => set(key, e.target.value)} />
                </Field>
              ))}
            </div>
          </section>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
            {loading ? '⏳ Procesando 10,000 simulaciones...' : '🚀 Generar análisis completo'}
          </button>
        </form>
      </main>
    </div>
  )
}

const INPUT = 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-blue text-sm'

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  )
}
