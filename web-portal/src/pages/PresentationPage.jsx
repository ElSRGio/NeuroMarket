/**
 * PresentationPage — Slide ejecutivo para defensa escolar
 * Explica la arquitectura y metodología de NeuroMarket 2.0
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'

const SLIDES = [
  {
    id: 1,
    title: "NeuroMarket 2.0",
    subtitle: "Consultora Estratégica de Inversión Hiperlocal",
    content: null,
    type: "cover",
  },
  {
    id: 2,
    title: "El Problema",
    subtitle: "¿Por qué fracasan los negocios en municipios como Libres?",
    type: "problem",
    points: [
      { icon: "📉", text: "El 65% de los negocios cierran en el primer año por falta de análisis de mercado local." },
      { icon: "📵", text: "Los datos digitales (redes sociales) no reflejan la economía informal dominante en municipios medianos." },
      { icon: "💸", text: "No existe una herramienta asequible de análisis de viabilidad para emprendedores locales." },
    ],
  },
  {
    id: 3,
    title: "Nuestra Solución",
    subtitle: "Motor de Análisis de Viabilidad en 3 capas",
    type: "architecture",
    layers: [
      { name: "Frontend React 19", role: "Interfaz ejecutiva donde el usuario ingresa su negocio y ve el análisis", color: "brand-blue", icon: "⚛️" },
      { name: "Node.js API", role: "Orquestador: maneja autenticación JWT, guarda análisis en PostgreSQL", color: "brand-green", icon: "🟢" },
      { name: "Python Engine", role: "Motor matemático: calcula IRL, TAM/SOM, ROI, Monte Carlo (10,000 iteraciones)", color: "yellow-400", icon: "🐍" },
    ],
  },
  {
    id: 4,
    title: "Módulo Estrella: El IRL",
    subtitle: "Índice de Realidad Local — Innovación metodológica",
    type: "formula",
    formula: "IRL = 0.30×DD + 0.25×VF + 0.20×NB + 0.15×IE + 0.10×CP",
    variables: [
      { symbol: "DD", name: "Densidad Digital", desc: "Presencia en redes sociales (obtenida con Apify)" },
      { symbol: "VF", name: "Validación Física", desc: "Negocios similares activos en Google Maps" },
      { symbol: "NB", name: "Nivel de Bancarización", desc: "Acceso a servicios financieros (datos INEGI)" },
      { symbol: "IE", name: "Índice de Empleo", desc: "Empleo formal registrado en el IMSS" },
      { symbol: "CP", name: "Conectividad", desc: "Cobertura 4G/5G en el municipio" },
    ],
    insight: "El IRL ajusta el análisis según qué tan confiables son los datos digitales frente a la economía informal del municipio.",
  },
  {
    id: 5,
    title: "Módulo de Decisión: Monte Carlo",
    subtitle: "10,000 simulaciones para medir el riesgo de inversión",
    type: "montecarlo",
    scenarios: [
      { label: "Pesimista (P10)", roi: "278%", color: "red-400", desc: "El 10% de los escenarios posibles" },
      { label: "Realista (P50)", roi: "311%", color: "yellow-400", desc: "El escenario más probable" },
      { label: "Optimista (P90)", roi: "344%", color: "brand-green", desc: "El 10% mejor de los escenarios" },
    ],
    insight: "En lugar de dar un ROI único (que puede ser falso), damos una distribución de probabilidad. Así el inversionista conoce el rango real de resultados.",
  },
  {
    id: 6,
    title: "Datos Reales con Apify",
    subtitle: "Scraping ético de señales sociales para el IRL",
    type: "apify",
    steps: [
      { step: "1", text: "El usuario selecciona su municipio y sector de negocio" },
      { step: "2", text: "Apify escanea Facebook Pages y Google Maps en tiempo real" },
      { step: "3", text: "Se extrae: conteo de negocios, cantidad de reseñas, rating promedio" },
      { step: "4", text: "Se calcula la Densidad Digital (DD) real del sector en ese municipio" },
      { step: "5", text: "DD alimenta el IRL → análisis más preciso y localizado" },
    ],
    result: "Resultado para Libres/Restaurante: DD = 30.2/100 (más informal de lo estimado)",
  },
  {
    id: 7,
    title: "Tecnologías Utilizadas",
    subtitle: "Stack full-stack de nivel profesional",
    type: "tech",
    techs: [
      { name: "React 19", category: "Frontend", color: "blue" },
      { name: "Vite 7", category: "Build tool", color: "purple" },
      { name: "Tailwind CSS 3", category: "Estilos", color: "teal" },
      { name: "Recharts", category: "Gráficas", color: "orange" },
      { name: "Zustand", category: "Estado global", color: "yellow" },
      { name: "Node.js + Express", category: "Backend API", color: "green" },
      { name: "JWT + bcryptjs", category: "Autenticación", color: "red" },
      { name: "Sequelize ORM", category: "Base de datos", color: "blue" },
      { name: "PostgreSQL 18", category: "DB", color: "indigo" },
      { name: "Python 3.13 + Flask", category: "Motor analítico", color: "yellow" },
      { name: "NumPy + SciPy", category: "Cálculo científico", color: "orange" },
      { name: "Apify", category: "Web scraping", color: "green" },
    ],
  },
  {
    id: 8,
    title: "Impacto y Escalabilidad",
    subtitle: "De Libres, Puebla → a todo México",
    type: "impact",
    phases: [
      { phase: "Fase 1", location: "Libres, Puebla", status: "✅ Completo", desc: "Validación del modelo IRL con datos reales de Apify + INEGI" },
      { phase: "Fase 2", location: "Región Puebla", status: "🔜 Siguiente", desc: "Expansión a 5 municipios cercanos: Oriental, Cholula, Tehuacán..." },
      { phase: "Fase 3", location: "Nacional", status: "📋 Planeado", desc: "Cualquier economía intermedia de México (arquitectura modular)" },
    ],
  },
]

export default function PresentationPage() {
  const [current, setCurrent] = useState(0)
  const slide = SLIDES[current]

  function prev() { setCurrent(i => Math.max(0, i - 1)) }
  function next() { setCurrent(i => Math.min(SLIDES.length - 1, i + 1)) }

  return (
    <div className="min-h-screen bg-brand-darker flex flex-col">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-brand-green font-bold text-lg">⬡ NeuroMarket 2.0</Link>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">{current + 1} / {SLIDES.length}</span>
          <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Ir al Dashboard →</Link>
        </div>
      </header>

      {/* Slide */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-5xl mx-auto w-full">
        <SlideRenderer slide={slide} />
      </main>

      {/* Controls */}
      <footer className="border-t border-white/10 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <button
          onClick={prev} disabled={current === 0}
          className="px-5 py-2 rounded-lg border border-white/20 text-gray-400 hover:text-white hover:border-white/40 disabled:opacity-30 transition-all text-sm"
        >
          ← Anterior
        </button>

        {/* Dot nav */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-brand-blue w-5' : 'bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>

        <button
          onClick={next} disabled={current === SLIDES.length - 1}
          className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-blue-500 text-white disabled:opacity-30 transition-all text-sm"
        >
          Siguiente →
        </button>
      </footer>
    </div>
  )
}

function SlideRenderer({ slide }) {
  if (slide.type === 'cover') return (
    <div className="text-center space-y-6">
      <div className="text-8xl">⬡</div>
      <h1 className="text-5xl font-black text-white">{slide.title}</h1>
      <p className="text-xl text-brand-blue font-medium">{slide.subtitle}</p>
      <div className="flex justify-center gap-6 mt-8 text-sm text-gray-500">
        <span>Python · Node.js · React 19</span>
        <span>·</span>
        <span>PostgreSQL · Apify · INEGI</span>
      </div>
    </div>
  )

  if (slide.type === 'problem') return (
    <SlideWrapper slide={slide}>
      <div className="space-y-5">
        {slide.points.map((p, i) => (
          <div key={i} className="flex items-start gap-4 bg-white/5 rounded-xl p-5 border border-white/10">
            <span className="text-3xl">{p.icon}</span>
            <p className="text-gray-200 text-lg leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>
    </SlideWrapper>
  )

  if (slide.type === 'architecture') return (
    <SlideWrapper slide={slide}>
      <div className="space-y-4">
        {slide.layers.map((l, i) => (
          <div key={i} className="flex items-center gap-5 bg-white/5 rounded-xl p-5 border border-white/10">
            <span className="text-3xl">{l.icon}</span>
            <div>
              <div className="font-bold text-white text-lg">{l.name}</div>
              <div className="text-gray-400 text-sm mt-0.5">{l.role}</div>
            </div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  )

  if (slide.type === 'formula') return (
    <SlideWrapper slide={slide}>
      <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-xl p-6 text-center mb-6">
        <code className="text-brand-blue text-lg font-mono font-bold">{slide.formula}</code>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {slide.variables.map((v, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <span className="text-brand-green font-bold font-mono">{v.symbol}</span>
            <span className="text-white font-medium ml-2">{v.name}</span>
            <p className="text-gray-400 text-xs mt-1">{v.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 text-yellow-200 text-sm">
        💡 {slide.insight}
      </div>
    </SlideWrapper>
  )

  if (slide.type === 'montecarlo') return (
    <SlideWrapper slide={slide}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {slide.scenarios.map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <div className={`text-3xl font-black text-${s.color}`}>{s.roi}</div>
            <div className="text-white font-bold mt-1">{s.label}</div>
            <div className="text-gray-500 text-xs mt-2">{s.desc}</div>
          </div>
        ))}
      </div>
      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 text-yellow-200 text-sm">
        💡 {slide.insight}
      </div>
    </SlideWrapper>
  )

  if (slide.type === 'apify') return (
    <SlideWrapper slide={slide}>
      <div className="space-y-3 mb-5">
        {slide.steps.map((s, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="w-8 h-8 rounded-full bg-brand-blue/20 border border-brand-blue/50 text-brand-blue font-bold flex items-center justify-center text-sm flex-shrink-0">{s.step}</span>
            <p className="text-gray-300">{s.text}</p>
          </div>
        ))}
      </div>
      <div className="bg-brand-green/10 border border-brand-green/30 rounded-lg p-4 text-brand-green text-sm font-medium">
        ✅ {slide.result}
      </div>
    </SlideWrapper>
  )

  if (slide.type === 'tech') return (
    <SlideWrapper slide={slide}>
      <div className="flex flex-wrap gap-3">
        {slide.techs.map((t, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-center">
            <div className="text-white font-bold text-sm">{t.name}</div>
            <div className="text-gray-500 text-xs">{t.category}</div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  )

  if (slide.type === 'impact') return (
    <SlideWrapper slide={slide}>
      <div className="space-y-4">
        {slide.phases.map((p, i) => (
          <div key={i} className={`flex items-start gap-5 rounded-xl p-5 border ${i === 0 ? 'bg-brand-green/10 border-brand-green/30' : 'bg-white/5 border-white/10'}`}>
            <div className="text-center min-w-[80px]">
              <div className="font-bold text-white">{p.phase}</div>
              <div className="text-xs text-gray-400">{p.location}</div>
            </div>
            <div className="flex-1">
              <span className="text-sm">{p.status}</span>
              <p className="text-gray-300 text-sm mt-1">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideWrapper>
  )

  return null
}

function SlideWrapper({ slide, children }) {
  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black text-white">{slide.title}</h2>
        <p className="text-brand-blue mt-2">{slide.subtitle}</p>
      </div>
      {children}
    </div>
  )
}
