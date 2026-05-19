import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppNav from '../components/AppNav.jsx'

const LAYERS = [
  { id: 'digital', label: 'Densidad digital', color: '#2563eb', value: 78 },
  { id: 'physical', label: 'Validacion fisica', color: '#16a34a', value: 62 },
  { id: 'economy', label: 'Nivel economico', color: '#7c3aed', value: 70 },
]

const REGIONS = [
  { name: 'Libres', x: 54, y: 42, score: 71 },
  { name: 'Oriental', x: 65, y: 54, score: 58 },
  { name: 'Tehuacan', x: 46, y: 68, score: 82 },
  { name: 'Cholula', x: 36, y: 47, score: 76 },
]

export default function GeoMapsPage() {
  const [activeLayer, setActiveLayer] = useState('digital')
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0])
  const layer = LAYERS.find(item => item.id === activeLayer) || LAYERS[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">← Dashboard</Link>
            <h1 className="mt-2 text-2xl font-black text-gray-900">Mapas geoespaciales</h1>
            <p className="text-gray-500 text-sm">Vista territorial para combinar IRL, demanda digital y potencial de inversion.</p>
          </div>
          <Link to="/social-listening" className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100">
            Social Listening
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <aside className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-6">
            <section>
              <h2 className="font-black text-gray-900 mb-3">Capas de analisis</h2>
              <div className="space-y-2">
                {LAYERS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveLayer(item.id)}
                    className={`w-full flex items-center justify-between rounded-lg border px-3 py-3 text-sm font-semibold transition-colors ${activeLayer === item.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </span>
                    <span>{item.value}%</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Region seleccionada</p>
              <h3 className="text-lg font-black text-gray-900">{selectedRegion.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Score territorial {selectedRegion.score}/100</p>
              <div className="mt-4 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${selectedRegion.score}%`, backgroundColor: layer.color }} />
              </div>
            </section>

            <section className="text-xs text-gray-500 leading-relaxed">
              XAZIA V2 plantea PostGIS como base geoespacial. Esta vista deja preparado el flujo visual para conectar capas reales cuando el backend exponga coordenadas y poligonos.
            </section>
          </aside>

          <section className="relative min-h-[560px] bg-slate-100 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '38px 38px' }} />
            <div className="absolute inset-8 rounded-[32px] border border-white/80 bg-white/35 backdrop-blur-[2px]" />

            {REGIONS.map(region => (
              <button
                key={region.name}
                onClick={() => setSelectedRegion(region)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${region.x}%`, top: `${region.y}%` }}
                title={region.name}
              >
                <span
                  className="block rounded-full border-4 border-white shadow-lg transition-transform group-hover:scale-110"
                  style={{
                    width: `${28 + region.score / 4}px`,
                    height: `${28 + region.score / 4}px`,
                    backgroundColor: region.name === selectedRegion.name ? layer.color : '#94a3b8',
                    opacity: region.name === selectedRegion.name ? 0.95 : 0.75,
                  }}
                />
                <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white border border-gray-200 px-2 py-1 text-xs font-bold text-gray-700 shadow-sm">
                  {region.name}
                </span>
              </button>
            ))}

            <div className="absolute left-6 bottom-6 bg-white/95 border border-gray-200 rounded-xl p-4 shadow-sm max-w-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Capa activa</p>
              <h2 className="text-lg font-black text-gray-900 mt-1">{layer.label}</h2>
              <p className="text-sm text-gray-500 mt-1">Cruza esta capa con los resultados de Social Listening para decidir donde profundizar el analisis financiero.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
