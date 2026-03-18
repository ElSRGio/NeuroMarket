  // web-portal/src/pages/UpgradePage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store.js'
import api from '../services/api.js'

const NAV_DROPDOWN = {
  'Por que NeuroMarket': [
    { title: 'Indice de Realidad Local (IRL)', desc: 'Cruzamos datos digitales con el mundo fisico para medir viabilidad real.' },
    { title: 'Motor de deteccion de nichos', desc: 'Identifica oportunidades de mercado antes de que la competencia las vea.' },
    { title: 'NeuroMarket + INEGI', desc: 'Datos oficiales de poblacion, empleo y bancarizacion integrados.' },
  ],
  'Nuestra plataforma': [
    { title: 'Dashboard ejecutivo', desc: 'Visualiza tus analisis con graficas interactivas y score de viabilidad.' },
    { title: 'Reportes PDF', desc: 'Exporta reportes profesionales con un solo clic (plan Pro).' },
    { title: 'API REST', desc: 'Integra NeuroMarket con tus sistemas existentes (plan Enterprise).' },
  ],
}




function HexLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="#e8f5e9"/>
      <path d="M20 2 L36 11 L28 20 Z" fill="#4ade80"/>
      <path d="M36 11 L36 29 L28 20 Z" fill="#22c55e"/>
      <path d="M20 38 L36 29 L28 20 Z" fill="#16a34a"/>
      <path d="M4 29 L20 38 L12 20 Z" fill="#60a5fa"/>
      <path d="M4 11 L4 29 L12 20 Z" fill="#3b82f6"/>
      <path d="M20 2 L4 11 L12 20 Z" fill="#f97316"/>
    </svg>
  )
}

function Check() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  )
}

const PLANS = [
  {
    id: 'basic',
    category: 'PARA EMPRENDEDORES',
    name: 'Analisis de Viabilidad',
    desc: 'Valida tu idea de negocio con datos reales de INEGI y el Indice de Realidad Local antes de invertir.',
    cta: 'Comenzar gratis',
    audience: 'Para emprendedores y estudiantes que buscan:',
    features: [
      '6 analisis de viabilidad gratuitos',
      'Score IRL (Indice de Realidad Local)',
      'Dashboard con graficas ejecutivas',
      'Datos de 6 municipios de Puebla',
    ],
  },
  {
    id: 'pro',
    category: 'PARA CONSULTORES',
    name: 'Inteligencia de Mercado',
    desc: 'Plataforma completa de analisis hiperlocal. Ideal para consultores y asesores que trabajan con varios clientes.',
    cta: 'Solicitar presupuesto',
    audience: 'Para consultores y analistas que buscan:',
    features: [
      'Analisis ilimitados',
      'Exportacion de reportes PDF ejecutivos',
      'Datos Apify en tiempo real (Facebook/Maps)',
      'Simulacion Monte Carlo (10,000 iter.)',
      'SVEE - Ventanas estrategicas de entrada',
      'TAM/SAM/SOM por municipio',
    ],
  },
  {
    id: 'enterprise',
    category: 'PARA INSTITUCIONES',
    name: 'Plataforma Empresarial',
    desc: 'Solucion integral para dependencias de gobierno, instituciones educativas y empresas de consultoria.',
    cta: 'Solicitar presupuesto',
    audience: 'Para equipos e instituciones que buscan:',
    features: [
      'Todo lo incluido en Pro',
      'Multi-usuario (hasta 20 cuentas)',
      'Acceso a la API de NeuroMarket',
      'Integracion con sistemas existentes',
      'SLA garantizado 99.9%',
      'Onboarding y soporte dedicado',
    ],
  },
]

const PARTNERS = [
  { icon: 'Python', label: 'Python 3.13' },
  { icon: 'Node', label: 'Node.js' },
  { icon: 'React', label: 'React 19' },
  { icon: 'PG', label: 'PostgreSQL' },
  { icon: 'API', label: 'Apify' },
  { icon: 'INEGI', label: 'INEGI' },
]

const MODULES = [
  { label: 'IRL\nIndice de\nRealidad Local', color: 'bg-blue-900 text-white' },
  { label: 'MONTE\nCARLO\n10K iter.', color: 'bg-orange-500 text-white' },
  { label: 'APIFY\nDatos\nReales', color: 'bg-green-600 text-white' },
  { label: 'PDF\nReporte\nEjecutivo', color: 'bg-purple-700 text-white' },
  { label: 'SVEE\nVentanas\nEstrategicas', color: 'bg-teal-600 text-white' },
  { label: 'TAM\nSAM\nSOM', color: 'bg-red-700 text-white' },
]

const FAQS = [
  { q: 'Puedo cambiar de plan en cualquier momento?', a: 'Si. Puedes actualizar o bajar tu plan desde tu perfil. El cambio aplica al siguiente ciclo.' },
  { q: 'Que pasa si alcanzo el limite de 6 analisis en Basic?', a: 'El sistema te avisara y podras actualizar a Pro para analisis ilimitados. Tus datos existentes se conservan.' },
  { q: 'El plan Basic caduca?', a: 'No. El plan Basic es permanente y gratuito, sin fecha de expiracion.' },
  { q: 'Que incluye el reporte PDF?', a: 'Score IRL, distribucion Monte Carlo, proyeccion de flujo mensual a 12 meses, TAM/SAM/SOM y ventana SVEE.' },
  { q: 'Los datos de Apify son en tiempo real?', a: 'En plan Pro, si. Al presionar "Auto-rellenar", Apify escanea Facebook Pages y Google Maps al momento.' },
]

export default function UpgradePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [quickName, setQuickName] = useState('')
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const avatarSrc = user?.profile_image_url
    ? (user.profile_image_url.startsWith('http')
      ? user.profile_image_url
      : `${api.defaults.baseURL || ''}${user.profile_image_url}`)
    : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}`

  function handleQuickAnalysis(e) {
    e.preventDefault()
    navigate('/analysis/new', { state: { business_name: quickName } })
  }

  return (
    <div className="min-h-screen bg-white text-gray-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top bar */}
      <div style={{ backgroundColor: '#1a1a2e' }} className="text-center py-2 text-xs text-gray-300 flex justify-center gap-4 px-4 overflow-hidden">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"/>
          DATOS INEGI VERIFICADOS
        </span>
        <span className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"/>
          MOTOR DE DECISION FINANCIERA v2.0
        </span>
      </div>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <HexLogo size={32}/>
            <span className="font-black text-lg text-gray-900">NeuroMarket</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
            {/* Por que NeuroMarket — con dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-gray-900 transition-colors py-5">
                Por que NeuroMarket
                <svg className="w-3.5 h-3.5 mt-0.5 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                {NAV_DROPDOWN['Por que NeuroMarket'].map((item, i) => (
                  <div key={i}>
                    {i > 0 && <div className="mx-4 border-t border-gray-100 my-1"/>}
                    <div className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <p className="font-bold text-gray-900 text-sm mb-0.5">{item.title}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nuestra plataforma — con dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-gray-900 transition-colors py-5">
                Nuestra plataforma
                <svg className="w-3.5 h-3.5 mt-0.5 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                {NAV_DROPDOWN['Nuestra plataforma'].map((item, i) => (
                  <div key={i}>
                    {i > 0 && <div className="mx-4 border-t border-gray-100 my-1"/>}
                    <div className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <p className="font-bold text-gray-900 text-sm mb-0.5">{item.title}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Mi Dashboard</Link>
            <Link to="/presentation" className="hover:text-gray-900 transition-colors">Demo</Link>
            <span className="text-gray-900 border-b-2 border-green-500 pb-0.5">Precios</span>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-md transition-colors">
                  Iniciar sesion
                </Link>
                <Link to="/register" className="text-sm font-semibold px-4 py-2 rounded-md transition-colors text-white" style={{ backgroundColor: '#22c55e' }}>
                  Registrate
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
                >
                  <img
                    src={avatarSrc}
                    alt="Perfil"
                    className="w-7 h-7 rounded-full object-cover border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || 'User')}`
                    }}
                  />
                  <span className="text-sm text-gray-700 font-medium">{user.name || 'Perfil'}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                      Ver mi perfil
                    </Link>
                    <button onClick={() => { logout(); navigate('/'); }} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile: botón Comienza + hamburguesa */}
          <div className="flex md:hidden items-center gap-2">
            {!user ? (
              <Link to="/register" className="text-xs font-semibold px-3 py-2 rounded-md text-white" style={{ backgroundColor: '#22c55e' }}>
                Registrate
              </Link>
            ) : (
              <button onClick={() => navigate('/profile')} className="text-xs font-semibold px-3 py-2 rounded-md text-white" style={{ backgroundColor: '#22c55e' }}>
                Mi perfil
              </button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
            <div className="pt-3 space-y-1">
              {user && (
                <div className="mb-2 bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                  <img
                    src={avatarSrc}
                    alt="Perfil"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || 'User')}`
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">Por que NeuroMarket</p>
              {NAV_DROPDOWN['Por que NeuroMarket'].map((item, i) => (
                <div key={i} className="px-3 py-2 rounded-lg hover:bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
              <div className="border-t border-gray-100 my-2"/>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 pt-1 pb-1">Nuestra plataforma</p>
              {NAV_DROPDOWN['Nuestra plataforma'].map((item, i) => (
                <div key={i} className="px-3 py-2 rounded-lg hover:bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
              <div className="border-t border-gray-100 my-2"/>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Mi Dashboard</Link>
              <Link to="/presentation" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Demo</Link>
              <span className="block px-3 py-2 text-sm font-bold text-gray-900">Precios</span>
              <div className="border-t border-gray-100 my-2"/>
              {!user ? (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Iniciar sesion
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Ver mi perfil
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }} className="block w-full text-center py-2.5 text-sm border border-red-200 rounded-md text-red-600 hover:bg-red-50">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 text-center bg-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-5 leading-tight">
            Elige la mejor{' '}
            <span style={{ color: '#22c55e' }}>solucion</span>
            {' '}para ti
          </h1>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
            Con los planes Basic o Pro disponibles para cada una de nuestras
            soluciones, podras analizar y validar oportunidades de inversion
            en mercados locales de Mexico desde hoy mismo.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-20 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div key={plan.id} className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-5">
                <HexLogo size={48}/>
              </div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">{plan.category}</p>
              <h2 className="text-xl font-black text-gray-900 mb-3">{plan.name}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{plan.desc}</p>
              <button
                className="w-full py-3 rounded-md font-semibold text-sm mb-7 transition-colors text-white"
                style={{ backgroundColor: '#22c55e' }}
                onClick={() => alert('Contacta a soporte para activar tu plan. Sistema de pagos proximamente.')}
              >
                {plan.cta}
              </button>
              <p className="text-sm font-bold text-gray-900 mb-4">{plan.audience}</p>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check/> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Stack tecnologico - fondo oscuro */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 text-white" style={{ backgroundColor: '#111827' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black mb-4">
                <span style={{ color: '#4ade80' }}>Stack tecnologico</span> profesional
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Arquitectura confiable que conecta datos reales de redes sociales con estadisticas del INEGI.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '📡', title: 'Datos en tiempo real', desc: 'Apify escanea Facebook y Google Maps al momento' },
                  { icon: '📊', title: 'Canales verificados', desc: 'INEGI, IMSS, CONAPO y datos locales de Puebla' },
                  { icon: '🔄', title: 'Motor actualizable', desc: 'Arquitectura modular lista para crecer a nivel nacional' },
                  { icon: '🔗', title: 'Integraciones', desc: 'API REST disponible para planes Enterprise' },
                ].map(item => (
                  <div key={item.title}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mb-2" style={{ backgroundColor: '#22c55e' }}>{item.icon}</div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 md:mt-0">
              {PARTNERS.map(p => (
                <div key={p.label} className="rounded-xl p-4 sm:p-5 flex items-center gap-2 sm:gap-3 transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="text-xs font-black text-gray-400 w-8 text-center">{p.icon}</span>
                  <span className="text-xs sm:text-sm font-semibold text-white">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modulos */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Reconocidos modulos de inteligencia</h2>
          <p className="text-gray-500 mb-12">Tecnologia analitica de nivel profesional, integrada en una sola plataforma.</p>
          <div className="flex flex-wrap justify-center gap-6">
            {MODULES.map((m) => (
              <div key={m.label} className={`w-28 h-28 rounded-xl flex items-center justify-center text-center ${m.color} shadow-lg`}>
                <p className="text-xs font-black leading-tight whitespace-pre-line">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6" style={{ backgroundColor: '#111827' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="text-white">
            <h2 className="text-3xl sm:text-4xl font-black mb-5 leading-tight">
              Quieres ver<br/>
              <span style={{ color: '#4ade80' }}>NeuroMarket en</span><br/>
              <span style={{ color: '#4ade80' }}>accion?</span>
            </h2>
            <p className="text-gray-300 font-semibold text-base sm:text-lg mb-3">
              Descubre como NeuroMarket puede ayudarte a tomar mejores decisiones de inversion.
            </p>
            <p className="text-gray-400 mb-6 sm:mb-8">
              Crea tu primer analisis gratis y descubre el potencial de nuestra plataforma hiperlocal.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
            <p className="font-black text-gray-900 text-lg mb-2">Crea tu analisis gratuito</p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6">
              <div className="h-1.5 rounded-full w-1/3" style={{ backgroundColor: '#22c55e' }}/>
            </div>
            <form onSubmit={handleQuickAnalysis}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de tu negocio</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={quickName}
                  onChange={e => setQuickName(e.target.value)}
                  placeholder="Ej. Cafeteria El Grano"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none text-gray-900 w-full focus:border-green-500"
                />
                <button
                  type="submit"
                  className="font-semibold px-4 py-2.5 rounded-md text-sm text-white text-center whitespace-nowrap"
                  style={{ backgroundColor: '#22c55e' }}
                >
                  Analizar
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-400 mt-4">
              Proyecto academico NeuroMarket 2.0 - Ing. en Sistemas 2026.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">Preguntas frecuentes</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="group border border-gray-200 rounded-xl overflow-hidden hover:border-green-300 transition-colors cursor-pointer">
                <div className="w-full flex items-center justify-between p-5 text-left group-hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <span className="text-gray-400 text-xl flex-shrink-0 font-light group-hover:text-green-500 transition-colors group-hover:rotate-45 transform duration-200 inline-block">+</span>
                </div>
                <div className="max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-300 ease-in-out">
                  <div className="px-5 pb-5 text-sm leading-relaxed border-t border-gray-100 pt-4 bg-gray-50" style={{ color: '#16a34a' }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer multi-columna */}
      <footer className="bg-white border-t border-gray-200 pt-12 sm:pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 mb-10 sm:mb-12">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-4">Nuestra plataforma</p>
              <ul className="space-y-2 text-sm" style={{ color: '#16a34a' }}>
                <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
                <li><Link to="/analysis/new" className="hover:underline">Nuevo analisis</Link></li>
                <li><Link to="/upgrade" className="hover:underline">Planes y precios</Link></li>
                <li className="text-gray-400">API access</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-4">Recursos</p>
              <ul className="space-y-2 text-sm" style={{ color: '#16a34a' }}>
                <li><Link to="/presentation" className="hover:underline">Presentacion</Link></li>
                <li className="text-gray-400">Documentacion</li>
                <li className="text-gray-400">Casos de uso</li>
                <li className="text-gray-400">Guias</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-4">Compania</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Quienes somos</li>
                <li>Contacto</li>
                <li>Proyecto academico</li>
                <li>Ing. en Sistemas 2026</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Terminos y condiciones</li>
                <li>Privacidad</li>
                <li>Cookies</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-4">Clientes</p>
              <ul className="space-y-2 text-sm" style={{ color: '#16a34a' }}>
                <li><Link to="/login" className="hover:underline">Iniciar sesion</Link></li>
                <li><Link to="/register" className="hover:underline">Registrarse</Link></li>
                <li><Link to="/dashboard" className="hover:underline">Mi cuenta</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <HexLogo size={24}/>
              <span className="text-xs text-gray-400">
                2026 NeuroMarket 2.0. Proyecto academico - Ingenieria en Sistemas, Libres, Puebla.
              </span>
            </div>
            <div className="flex gap-4 text-gray-400 text-lg items-center">
              <span className="cursor-pointer hover:text-gray-600">🐦</span>
              <span className="cursor-pointer hover:text-gray-600">📘</span>
              <span className="cursor-pointer hover:text-gray-600">💼</span>
              <Link to="/admin" className="text-xs ml-4 text-gray-400 hover:text-gray-600 transition-colors">Admin Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
