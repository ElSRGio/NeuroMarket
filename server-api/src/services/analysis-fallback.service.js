function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0))
}

function calculateIRL(params = {}) {
  const variables = {
    densidad_digital: clamp(params.densidad_digital),
    validacion_fisica: clamp(params.validacion_fisica),
    nivel_bancarizacion: clamp(params.nivel_bancarizacion),
    indice_empleo: clamp(params.indice_empleo),
    conectividad: clamp(params.conectividad),
  }

  const weights = {
    densidad_digital: 0.30,
    validacion_fisica: 0.25,
    nivel_bancarizacion: 0.20,
    indice_empleo: 0.15,
    conectividad: 0.10,
  }

  const irl_score = Number(Object.entries(weights)
    .reduce((sum, [key, weight]) => sum + variables[key] * weight, 0)
    .toFixed(2))

  let category = 'informal'
  let description = 'Economía predominantemente informal. Datos subestiman 40–60%.'
  let correction_factor = 1.5

  if (irl_score >= 80) {
    category = 'muy_confiable'
    description = 'Datos muy confiables. Economía formal dominante.'
    correction_factor = 1.0
  } else if (irl_score >= 60) {
    category = 'confiable'
    description = 'Confiabilidad media. Ajuste moderado recomendado.'
    correction_factor = 1.15
  } else if (irl_score >= 40) {
    category = 'mixta'
    description = 'Economía mixta. Aplicar factor corrección 1.3×.'
    correction_factor = 1.3
  }

  return {
    irl_score,
    category,
    description,
    correction_factor,
    variables,
    contribution: Object.fromEntries(
      Object.entries(weights).map(([key, weight]) => [key, Number((variables[key] * weight).toFixed(2))])
    ),
  }
}

function calculateTAMSOM(params = {}) {
  const multipliers = {
    restaurante: 1.10,
    retail: 1.00,
    servicios: 0.90,
    tecnologia: 0.80,
    salud: 1.20,
    educacion: 0.95,
    entretenimiento: 1.05,
    general: 1.00,
  }

  const sector = String(params.sector || 'general').toLowerCase()
  const multiplier = multipliers[sector] || 1.0
  const poblacion = Number(params.poblacion) || 0
  const gasto_promedio = Number(params.gasto_promedio) || 0
  const pct_mercado_accesible = Number(params.pct_mercado_accesible) || 30
  const pct_cuota_capturable = Number(params.pct_cuota_capturable) || 5

  const tam = poblacion * gasto_promedio * 12 * multiplier
  const sam = tam * (pct_mercado_accesible / 100)
  const som = sam * (pct_cuota_capturable / 100)

  let interpretation = 'Datos insuficientes para interpretar el mercado.'
  if (tam > 0) {
    const ratio = (som / tam) * 100
    if (ratio >= 5) interpretation = 'Mercado objetivo altamente atractivo para el primer año.'
    else if (ratio >= 2) interpretation = 'Mercado objetivo viable con estrategia de penetración activa.'
    else if (ratio >= 0.5) interpretation = 'Mercado nicho. Factible con diferenciación clara.'
    else interpretation = 'Mercado muy pequeño. Validar supuestos de gasto y población.'
  }

  return {
    tam: Number(tam.toFixed(2)),
    sam: Number(sam.toFixed(2)),
    som: Number(som.toFixed(2)),
    som_mensual: Number((som / 12).toFixed(2)),
    sector,
    sector_multiplier: multiplier,
    pct_mercado_accesible,
    pct_cuota_capturable,
    interpretation,
  }
}

function calculateROI(params = {}) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const inversion_inicial = Number(params.inversion_inicial) || 0
  const ingreso_base = Number(params.ingreso_base) || 0
  const margen_utilidad = Number(params.margen_utilidad) || 0.30
  const costos_fijos = Number(params.costos_fijos) || 0
  const idm_array = Array.isArray(params.idm_array) && params.idm_array.length === 12 ? params.idm_array : new Array(12).fill(1)

  let utilidad_total = 0
  const flujo_mensual = idm_array.map((idm, index) => {
    const ingreso_ajustado = ingreso_base * Number(idm || 0)
    const utilidad_bruta = ingreso_ajustado * margen_utilidad
    const utilidad_neta = utilidad_bruta - costos_fijos
    utilidad_total += utilidad_neta
    return {
      mes: months[index],
      ingreso_ajustado: Number(ingreso_ajustado.toFixed(2)),
      utilidad_bruta: Number(utilidad_bruta.toFixed(2)),
      utilidad_neta: Number(utilidad_neta.toFixed(2)),
      idm: Number(Number(idm || 0).toFixed(3)),
    }
  })

  const utilidad_mensual_promedio = utilidad_total / 12
  const roi_porcentaje = inversion_inicial > 0 ? (utilidad_total / inversion_inicial) * 100 : 0
  let break_even_meses = null
  if (inversion_inicial > 0) {
    let acumulado = -inversion_inicial
    for (let i = 0; i < 120; i += 1) {
      const idm = idm_array[i % idm_array.length]
      const utilidad = (ingreso_base * Number(idm || 0) * margen_utilidad) - costos_fijos
      acumulado += utilidad
      if (acumulado >= 0) {
        break_even_meses = i + 1
        break
      }
    }
  }

  let viabilidad = 'Negativo — Revisar modelo de negocio'
  if (roi_porcentaje >= 100) viabilidad = 'Excelente — Recuperación en menos de 12 meses'
  else if (roi_porcentaje >= 50) viabilidad = 'Bueno — Recuperación entre 12 y 24 meses'
  else if (roi_porcentaje >= 20) viabilidad = 'Aceptable — Recuperación entre 2 y 5 años'
  else if (roi_porcentaje >= 0) viabilidad = 'Bajo — Evaluar reducción de costos o aumento de precio'

  return {
    flujo_mensual,
    utilidad_total_anual: Number(utilidad_total.toFixed(2)),
    utilidad_mensual_promedio: Number(utilidad_mensual_promedio.toFixed(2)),
    roi_porcentaje: Number(roi_porcentaje.toFixed(2)),
    break_even_meses: break_even_meses ? Number(break_even_meses.toFixed(1)) : null,
    inversion_inicial,
    ingreso_base,
    margen_utilidad,
    costos_fijos,
    viabilidad,
  }
}

function createSeededRandom(seed = 42) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function randomNormal(random, mean, stdDev) {
  const u1 = Math.max(random(), Number.EPSILON)
  const u2 = random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return mean + z0 * stdDev
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizeRatio(value, defaultValue, min = 0, max = 1) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return defaultValue
  const ratio = parsed > 1 ? parsed / 100 : parsed
  return clamp(ratio, min, max)
}

function normalizeMonths(value, defaultValue = 12, min = 1, max = 60) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return defaultValue
  return clamp(Math.round(parsed), min, max)
}

function calculateMonteCarlo(params = {}) {
  const iterations = 10000
  const random = createSeededRandom(42)
  const ingreso_esperado = Number(params.ingreso_esperado) || 0
  const costo_esperado = Number(params.costo_esperado) || 0
  const inversion_inicial = Number(params.inversion_inicial) || 0
  const meses = normalizeMonths(params.meses, 12, 1, 60)
  const variabilidad_ingreso = normalizeRatio(params.variabilidad_ingreso, 0.20, 0.01, 0.60)
  const variabilidad_costo = normalizeRatio(params.variabilidad_costo, 0.15, 0.01, 0.60)
  const margen_utilidad = normalizeRatio(params.margen_utilidad, 0.30, 0.05, 0.90)
  const idm_array = Array.isArray(params.idm_array) && params.idm_array.length > 0 ? params.idm_array : new Array(12).fill(1)
  const roiValues = []

  const ingresoMin = Math.max(0, ingreso_esperado * (1 - (2 * variabilidad_ingreso)))
  const ingresoMax = Math.max(ingresoMin, ingreso_esperado * (1 + (2 * variabilidad_ingreso)))
  const costoMin = Math.max(0, costo_esperado * (1 - (2 * variabilidad_costo)))
  const costoMax = Math.max(costoMin, costo_esperado * (1 + (2 * variabilidad_costo)))

  for (let i = 0; i < iterations; i += 1) {
    let utilidad = 0
    for (let month = 0; month < meses; month += 1) {
      const idm = Number(idm_array[month % idm_array.length] || 1)
      const ingreso = clamp(randomNormal(random, ingreso_esperado, ingreso_esperado * variabilidad_ingreso), ingresoMin, ingresoMax)
      const costo = clamp(randomNormal(random, costo_esperado, costo_esperado * variabilidad_costo), costoMin, costoMax)
      utilidad += (ingreso * idm * margen_utilidad) - costo
    }
    const roiBase = inversion_inicial > 0 ? (utilidad / inversion_inicial) * 100 : utilidad
    const roi = clamp(roiBase, -100, 100)
    roiValues.push(roi)
  }

  const sorted = [...roiValues].sort((a, b) => a - b)
  const percentile = (p) => sorted[Math.floor((p / 100) * (sorted.length - 1))]
  const p10 = percentile(10)
  const p50 = percentile(50)
  const p90 = percentile(90)
  const mean_roi = roiValues.reduce((sum, value) => sum + value, 0) / roiValues.length
  const std_roi = Math.sqrt(roiValues.reduce((sum, value) => sum + ((value - mean_roi) ** 2), 0) / roiValues.length)
  const prob_positivo = clamp((roiValues.filter((value) => value >= 100).length / roiValues.length) * 100, 0, 100)

  let interpretacion = 'Alta incertidumbre. Reconsiderar supuestos de ingreso o capital inicial.'
  if (prob_positivo >= 80 && p50 >= 60) interpretacion = 'Alta probabilidad de éxito. Inversión respaldada estadísticamente.'
  else if (prob_positivo >= 65) interpretacion = 'Probabilidad favorable. Riesgo manejable con buena ejecución.'
  else if (prob_positivo >= 45) interpretacion = 'Viabilidad moderada. Requiere estrategia sólida y control de costos.'

  return {
    iterations,
    p10_roi: Number(p10.toFixed(2)),
    p50_roi: Number(p50.toFixed(2)),
    p90_roi: Number(p90.toFixed(2)),
    mean_roi: Number(mean_roi.toFixed(2)),
    std_roi: Number(std_roi.toFixed(2)),
    prob_positivo: Number(prob_positivo.toFixed(1)),
    escenarios: {
      pesimista: { roi: Number(p10.toFixed(2)), label: 'Pesimista (P10)' },
      realista: { roi: Number(p50.toFixed(2)), label: 'Realista (P50)' },
      optimista: { roi: Number(p90.toFixed(2)), label: 'Optimista (P90)' },
    },
    histogram: { counts: [], bins: [] },
    interpretacion,
  }
}

function calculateSVEE(menciones_mensuales = [], irl = 70, factor_competencia = 0.8) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const values = (Array.isArray(menciones_mensuales) ? [...menciones_mensuales] : []).concat(new Array(12).fill(100)).slice(0, 12)
  const promedio = values.reduce((sum, value) => sum + value, 0) / 12 || 1
  const irlFactor = (Number(irl) || 0) / 100
  const scores = values.map((value) => (value / promedio) * irlFactor * (Number(factor_competencia) || 0.8))
  const monthly_data = values.map((value, index) => ({
    mes: months[index],
    mes_num: index + 1,
    menciones: value,
    idm: Number((value / promedio).toFixed(3)),
    svee_score: Number(scores[index].toFixed(3)),
  }))
  const bestIndex = scores.indexOf(Math.max(...scores))
  const prepIndex = (bestIndex - 3 + 12) % 12
  const bestScore = scores[bestIndex]
  const strength = bestScore >= 1 ? 'Excelente ventana' : bestScore >= 0.8 ? 'Buena ventana' : 'Ventana aceptable'

  return {
    scores: scores.map((value) => Number(value.toFixed(3))),
    monthly_data,
    best_month: months[bestIndex],
    best_month_num: bestIndex + 1,
    best_score: Number(bestScore.toFixed(3)),
    prep_start_month: months[prepIndex],
    ranking: [...monthly_data].sort((a, b) => b.svee_score - a.svee_score).slice(0, 6),
    recommendation: `${strength}: Abre en ${months[bestIndex]}. Comienza preparativos en ${months[prepIndex]} (permisos, inventario, contratación).`,
  }
}

function scoreRating(score) {
  if (score >= 85) return { label: 'Muy viable', color: 'green', icon: '✅' }
  if (score >= 70) return { label: 'Viable', color: 'yellow', icon: '🟡' }
  if (score >= 50) return { label: 'Viable con reservas', color: 'orange', icon: '⚠️' }
  return { label: 'No recomendado', color: 'red', icon: '❌' }
}

function viabilityScore(irl, roi, tam_som, svee, mc) {
  const roi_pct = Math.min((Number(roi.roi_porcentaje) || 0) / 200 * 100, 100)
  const irl_score = Number(irl.irl_score) || 0
  const som_ratio = Math.min(((Number(tam_som.som) || 0) / Math.max(Number(tam_som.tam) || 1, 1)) * 2000, 100)
  const svee_max = Math.min(Math.max(...(svee.scores || [0])) * 100, 100)
  const mc_p50 = Math.min((Number(mc.p50_roi) || 0) / 200 * 100, 100)
  return Number(Math.min(roi_pct * 0.30 + irl_score * 0.25 + som_ratio * 0.20 + svee_max * 0.15 + mc_p50 * 0.10, 100).toFixed(2))
}

function runFallbackAnalysis(payload = {}) {
  const irl = calculateIRL(payload.irl_params || {})
  const tam_som = calculateTAMSOM(payload.tam_params || {})
  const roi = calculateROI(payload.roi_params || {})
  const roiParams = payload.roi_params || {}
  const mcParams = payload.mc_params || {}
  const monte_carlo = calculateMonteCarlo({
    ingreso_esperado: mcParams.ingreso_esperado ?? roiParams.ingreso_base,
    costo_esperado: mcParams.costo_esperado ?? roiParams.costos_fijos,
    inversion_inicial: mcParams.inversion_inicial ?? roiParams.inversion_inicial,
    meses: mcParams.meses ?? 12,
    variabilidad_ingreso: mcParams.variabilidad_ingreso ?? 0.20,
    variabilidad_costo: mcParams.variabilidad_costo ?? 0.15,
    margen_utilidad: mcParams.margen_utilidad ?? roiParams.margen_utilidad,
    idm_array: mcParams.idm_array ?? roiParams.idm_array,
  })
  const svee = calculateSVEE(payload.menciones_mensuales, irl.irl_score, payload.factor_competencia || 0.8)
  const viability_score = viabilityScore(irl, roi, tam_som, svee, monte_carlo)

  return {
    viability_score,
    rating: scoreRating(viability_score),
    irl,
    tam_som,
    roi,
    monte_carlo,
    svee,
    source: 'server-fallback',
  }
}

module.exports = { runFallbackAnalysis }
