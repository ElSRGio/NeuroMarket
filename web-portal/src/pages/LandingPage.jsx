import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-darker">
      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-brand-green font-bold text-xl">⬡</span>
          <span className="font-bold text-lg text-white">NeuroMarket <span className="text-brand-blue">2.0</span></span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            Iniciar sesión
          </Link>
          <Link to="/register" className="btn-primary text-sm py-2">
            Comenzar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/30 rounded-full px-4 py-1.5 text-sm text-brand-blue font-medium mb-8">
          <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></span>
          Nuevo: Motor de Decisión Financiera v2.0
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          ¿Es viable invertir<br />
          <span className="text-brand-blue">en tu negocio</span> aquí?
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          El primer motor de análisis de inversión hiperlocal para municipios de México.
          Respaldado por datos INEGI y simulaciones estadísticas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-lg px-8 py-4">
            Analizar mi negocio →
          </Link>
          <a href="#como-funciona" className="btn-secondary text-lg px-8 py-4">
            Ver cómo funciona
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16">
          {[
            { value: '10K', label: 'Simulaciones por análisis' },
            { value: '4', label: 'Módulos de inteligencia' },
            { value: '100%', label: 'Datos INEGI verificados' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-brand-green">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Los 4 Pilares */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Los 4 Pilares de Inteligencia</h2>
        <p className="text-gray-400 text-center mb-12">Cada análisis combina 4 módulos que trabajan juntos</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map(p => (
            <div key={p.title} className="card hover:border-brand-blue/40 transition-colors">
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="font-bold text-white mb-2">{p.title}</h3>
              <p className="text-gray-400 text-sm">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Score Demo */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="card text-center max-w-2xl mx-auto">
          <div className="text-6xl font-black text-brand-green mb-2">78</div>
          <div className="text-white font-semibold text-xl mb-1">Score de Viabilidad</div>
          <div className="text-yellow-400 font-medium mb-6">🟡 Viable — Riesgo controlado</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><div className="text-brand-green font-bold">64%</div><div className="text-gray-500">Prob. éxito</div></div>
            <div><div className="text-brand-blue font-bold">18 meses</div><div className="text-gray-500">Break-even</div></div>
            <div><div className="text-white font-bold">IRL 72</div><div className="text-gray-500">Datos confiables</div></div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Empieza tu análisis hoy</h2>
        <p className="text-gray-400 mb-8">Libres, Puebla — y próximamente todo México</p>
        <Link to="/register" className="btn-primary text-lg px-10 py-4">
          Crear cuenta gratuita →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-gray-600 text-sm">
        <p>© 2024 NeuroMarket 2.0 · Consultora Estratégica de Inversión Hiperlocal</p>
      </footer>
    </div>
  )
}

const PILLARS = [
  {
    icon: '📊',
    title: 'TAM/SAM/SOM',
    desc: 'Calcula el tamaño real de tu mercado usando datos del INEGI para tu municipio.',
  },
  {
    icon: '🌡️',
    title: 'Índice IRL',
    desc: 'Mide qué tan confiables son los datos digitales frente a la economía informal regional.',
  },
  {
    icon: '🎲',
    title: 'Monte Carlo',
    desc: '10,000 simulaciones estadísticas para proyectar ROI en 3 escenarios posibles.',
  },
  {
    icon: '📅',
    title: 'Ventanas SVEE',
    desc: 'Detecta el mejor mes del año para abrir tu negocio y maximizar ingresos desde el día 1.',
  },
]
