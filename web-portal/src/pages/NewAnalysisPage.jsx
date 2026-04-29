import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { investmentService } from '../services/investment.service.js'
import api, { engineUrl } from '../services/api.js'
import AppNav from '../components/AppNav.jsx'

const DEFAULT_IDM = [0.85, 0.90, 1.00, 1.00, 1.10, 0.95, 1.00, 1.00, 1.15, 1.00, 1.20, 1.30]

const SOCIAL_DENSITY_FALLBACK = {
  libres: 42,
  oriental: 45,
  serdan: 52,
  acajete: 55,
  tehuacan: 72,
  cholula: 78,
  puebla: 85,
}

const INPUT = 'w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors'
const INPUT_DARK = 'w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-green-500 transition-colors'

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function NewAnalysisPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [municipios, setMunicipios] = useState([])
  const [giros, setGiros] = useState([])
  const [selectedClasificacion, setSelectedClasificacion] = useState('')
  const [socialLoading, setSocialLoading] = useState(false)
  const [socialStatus, setSocialStatus] = useState('')
  const [form, setForm] = useState({
    business_name: location.state?.business_name || '', sector: 'general', municipio: 'Libres', estado: 'Puebla',
    presupuesto_inversion: '', costos_fijos: '',
    gasto_promedio: '150', margen_contribucion: '0.40', regimen_fiscal: 'RESICO',
    densidad_digital: '42', validacion_fisica: '55', nivel_bancarizacion: '38',
    indice_empleo: '48', conectividad: '55', poblacion: '15420',
  })

  useEffect(() => {
    api.get('/api/v2/municipios').then(({ data }) => setMunicipios(data?.data || [])).catch(() => {})
    api.get('/api/v2/municipios/data/giros').then(({ data }) => setGiros(data?.data || [])).catch(() => {})
  }, [])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleMunicipioChange(e) {
    const m = municipios.find(x => String(x.id) === e.target.value)
    if (!m) return
    setForm(f => ({
      ...f, municipio: m.nombre, estado: m.estado,
      densidad_digital: String(m.densidad_digital), validacion_fisica: String(m.validacion_fisica),
      nivel_bancarizacion: String(m.nivel_bancarizacion), indice_empleo: String(m.indice_empleo),
      conectividad: String(m.conectividad), poblacion: String(m.poblacion),
    }))
  }

  function handleGiroChange(e) {
    const g = giros.find(x => x.nombre_giro === e.target.value)
    if (!g) return

    // Cálculos reales de la región basados en PostgreSQL
    const gasto = Number(g.gasto_promedio_cliente) || 0;
    const costos_fijos = Number(g.costos_indirectos_mensuales) || 0;
    const ventas_diarias = Number(g.ventas_diarias_estimadas) || 0;
    const clientes_mensuales = ventas_diarias * 30;
    
    const costos_directos = Number(g.costos_directos_mensuales) || 0;
    const ingresos_estimados = clientes_mensuales * gasto;
    
    let margen_contribucion = 0.40;
    if (ingresos_estimados > 0) {
       margen_contribucion = (ingresos_estimados - costos_directos) / ingresos_estimados;
    }
    
    // Auto-detectamos el Régimen Fiscal que le espera
    let regimen = 'RESICO';
    if (g.regimen_fiscal && g.regimen_fiscal.includes('GENERAL')) regimen = 'GENERAL';
    else if (g.regimen_fiscal && g.regimen_fiscal.includes('ACTIVIDADES EMPRESARIALES')) regimen = 'PFAE';

    setForm(f => ({
      ...f,
      business_name: f.business_name || `Mi ${g.nombre_giro}`,
      gasto_promedio: String(gasto),
      costos_fijos: String(costos_fijos),
      margen_contribucion: String(Math.max(0.01, Math.min(0.99, margen_contribucion)).toFixed(2)),
      regimen_fiscal: regimen
    }))
  }

  async function fetchSocialData() {
    setSocialLoading(true)
    setSocialStatus('')
    try {
      const res = await fetch(engineUrl(`/api/engine/social-density?municipio=${encodeURIComponent(form.municipio)}&estado=${encodeURIComponent(form.estado)}&sector=${encodeURIComponent(form.sector)}`))
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      if (data.densidad_digital !== undefined) {
        set('densidad_digital', String(data.densidad_digital))
        setSocialStatus(data.fuente === 'mock_inegi'
          ? `Estimacion INEGI: ${data.densidad_digital}/100`
          : `Datos reales de redes sociales: ${data.densidad_digital}/100`
        )
      }
    } catch {
      const municipioKey = form.municipio.toLowerCase().replace(/\s+/g, '')
      const estimatedDensity = SOCIAL_DENSITY_FALLBACK[municipioKey] ?? 50
      set('densidad_digital', String(estimatedDensity))
      setSocialStatus(`Estimación local activada: ${estimatedDensity}/100`)
    }
    finally { setSocialLoading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (+form.presupuesto_inversion <= 0) {
      setError('El Presupuesto a Invertir debe ser mayor a 0.')
      setLoading(false)
      return
    }
    
    const irlSum = +form.densidad_digital + +form.validacion_fisica + +form.nivel_bancarizacion + +form.indice_empleo + +form.conectividad
    if (irlSum === 0) {
      setError('El Índice de Realidad Local (IRL) no puede estar en 0. Usa el botón "Auto-rellenar datos" o ingrésalos manualmente.')
      setLoading(false)
      return
    }

    try {
      const clientes_calc = 0; // El motor de Python proyectará esto basado en el TAM y SVEE
      const payload = {
        business_name: form.business_name, sector: form.sector,
        municipio: form.municipio, estado: form.estado, factor_competencia: 0.8,
        menciones_mensuales: DEFAULT_IDM.map(v => Math.round(v * 100)),
        irl_params: {
          densidad_digital: +form.densidad_digital, validacion_fisica: +form.validacion_fisica,
          nivel_bancarizacion: +form.nivel_bancarizacion, indice_empleo: +form.indice_empleo, conectividad: +form.conectividad,
        },
        tam_params: { poblacion: +form.poblacion, gasto_promedio: +form.gasto_promedio, sector: form.sector, pct_mercado_accesible: 30, pct_cuota_capturable: 5 },
        roi_params: { 
          presupuesto_inversion: +form.presupuesto_inversion, 
          costos_fijos: +form.costos_fijos, 
          gasto_promedio: +form.gasto_promedio,
          margen_contribucion: +form.margen_contribucion,
          clientes_estimados: clientes_calc,
          regimen_fiscal: form.regimen_fiscal,
          idm_array: DEFAULT_IDM,
          sector: form.sector,
          validacion_fisica: +form.validacion_fisica
        },
        mc_params: { 
          ingreso_esperado: 0, // Removido, el motor debe calcularlo
          costo_esperado: +form.costos_fijos, 
          inversion_inicial: +form.presupuesto_inversion * 0.6, meses: 12,
          margen_contribucion: +form.margen_contribucion,
          regimen_fiscal: form.regimen_fiscal,
          capital_total: +form.presupuesto_inversion
        },
      }
      const { data } = await investmentService.analyze(payload)
      navigate(`/analysis/${data.analysis_id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el analisis')
    } finally { setLoading(false) }
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: 'linear-gradient(to bottom, rgba(249,250,251,0.50), rgba(249,250,251,0.85)), url("/img/image_desktoop2.jpeg")' }}
    >
      <AppNav showNewAnalysis={false}/>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-700 text-sm transition-colors">← Volver</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-black text-gray-900">Nuevo analisis de inversion</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>}

          {/* Negocio */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-black text-gray-900 text-base">Datos del negocio</h2>
            <Field label="Nombre del negocio">
              <input className={INPUT} value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Ej: Restaurante La Familia" required />
            </Field>
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
          <h3 className="text-sm font-bold text-emerald-900 mb-3">💡 Inteligencia de Mercado (Auto-Rellenado)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="1. Sector de Mercado" hint="Las 13 categorías principales">
              <select className={INPUT} value={selectedClasificacion} onChange={e => { setSelectedClasificacion(e.target.value); setForm(f => ({...f, sector: e.target.value})) }}>
                <option value="">Selecciona un sector...</option>
                {[...new Set(giros.map(g => g.clasificacion))].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="2. Giro Específico" hint="Auto-carga costos, ticket y márgenes">
              <select className={INPUT} onChange={handleGiroChange} disabled={!selectedClasificacion} defaultValue="">
                <option value="" disabled>Selecciona un negocio...</option>
                {giros.filter(g => g.clasificacion === selectedClasificacion).map((g, i) => (
                  <option key={i} value={g.nombre_giro}>{g.nombre_giro}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

            <div className="mt-4">
              <Field label="Municipio" hint="Región donde se ubicará el negocio">
                {municipios.length > 0 ? (
                  <select className={INPUT} onChange={handleMunicipioChange} defaultValue="">
                    <option value="" disabled>Selecciona...</option>
                    {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}, {m.estado}</option>)}
                  </select>
                ) : (
                  <input className={INPUT} value={form.municipio} onChange={e => set('municipio', e.target.value)} />
                )}
              </Field>
            </div>
          </div>

          {/* Financiero */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-black text-gray-900 text-base">Economía de Supervivencia</h2>
            <p className="text-xs text-gray-500 -mt-3 mb-2">Datos reales para calcular tu Runway y Punto de Equilibrio</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Presupuesto a Invertir ($)" hint="Capital total disponible para este proyecto">
                <input className={INPUT} type="number" min="1" required value={form.presupuesto_inversion} onChange={e => set('presupuesto_inversion', e.target.value)} placeholder="150000"/>
              </Field>
              <Field label="Costos Fijos / Indirectos ($)">
                <input className={INPUT} type="number" min="0" required value={form.costos_fijos} onChange={e => set('costos_fijos', e.target.value)} placeholder="15000" hint="Renta, luz, salarios base (Burn Rate)"/>
              </Field>
              <Field label="Régimen Fiscal">
                <select className={INPUT} value={form.regimen_fiscal} onChange={e => set('regimen_fiscal', e.target.value)}>
                  <option value="RESICO">RESICO (Física/Moral)</option>
                  <option value="PFAE">Actividad Empresarial</option>
                  <option value="GENERAL">Régimen General (Moral)</option>
                </select>
              </Field>
              <Field label="Ticket Promedio por Cliente ($)">
                <input className={INPUT} type="number" min="1" required value={form.gasto_promedio} onChange={e => set('gasto_promedio', e.target.value)} placeholder="150"/>
              </Field>
              <Field label="Margen de Contribución (0-1)">
                <input className={INPUT} type="number" step="0.01" min="0.01" max="0.99" required value={form.margen_contribucion} onChange={e => set('margen_contribucion', e.target.value)} hint="(Precio - Costo Directo) / Precio"/>
              </Field>
            </div>
          </div>

          {/* IRL */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-black text-gray-900 text-base">Indice de Realidad Local (IRL)</h2>
                <p className="text-gray-500 text-xs mt-0.5">Valores del 0 al 100 para tu municipio</p>
              </div>
              <button
                type="button" onClick={fetchSocialData} disabled={socialLoading || !form.municipio}
                className="flex-shrink-0 text-xs border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {socialLoading ? 'Analizando...' : 'Auto-rellenar datos'}
              </button>
            </div>
            {socialStatus && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700">{socialStatus}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {[
                ['densidad_digital','Densidad Digital'],['validacion_fisica','Validacion Fisica'],
                ['nivel_bancarizacion','Bancarizacion'],['indice_empleo','Empleo Formal'],
                ['conectividad','Conectividad 4G/5G'],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input className={INPUT} type="number" min="0" max="100" value={form[key]} onChange={e => set(key, e.target.value)}/>
                </Field>
              ))}
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-4 rounded-xl font-black text-white text-base transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#22c55e' }}
          >
            {loading ? 'Procesando 10,000 simulaciones...' : 'Generar analisis completo →'}
          </button>
        </form>
      </main>
    </div>
  )
}
