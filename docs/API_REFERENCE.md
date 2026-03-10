# NeuroMarket 2.0 — API Reference

Base URL: `http://localhost:3000/api/v2`  
Authentication: Bearer JWT (except `/auth/*` endpoints)

---

## Auth

### POST `/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 6 chars)"
}
```
**Response 201:**
```json
{ "user": { "id": "uuid", "name": "...", "email": "...", "plan_type": "basic" }, "token": "jwt" }
```

---

### POST `/auth/login`
Inicia sesión.

**Body:**
```json
{ "email": "string", "password": "string" }
```
**Response 200:**
```json
{ "user": { ... }, "token": "jwt" }
```

---

## Municipios

### GET `/municipios`
Lista todos los municipios con datos INEGI precargados.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "clave_inegi": "21090",
      "nombre": "Libres",
      "estado": "Puebla",
      "poblacion": 15420,
      "densidad_digital": 42.00,
      "validacion_fisica": 55.00,
      "nivel_bancarizacion": 38.00,
      "indice_empleo": 48.00,
      "conectividad": 55.00,
      "gasto_promedio_mensual": 2400.00
    }
  ]
}
```

---

### GET `/municipios/:id`
Datos de un municipio específico (útil para pre-llenar formulario IRL).

---

## Investment

> Todos los endpoints requieren `Authorization: Bearer <token>`

### POST `/investment/analyze`
Ejecuta el análisis completo de inversión (IRL + TAM/SOM + ROI + Monte Carlo + SVEE).

**Body:**
```json
{
  "business_name": "Restaurante La Familia",
  "sector": "restaurante",
  "municipio": "Libres",
  "estado": "Puebla",
  "factor_competencia": 0.8,
  "menciones_mensuales": [85,90,100,100,110,95,100,100,115,100,120,130],
  "irl_params": {
    "densidad_digital": 42,
    "validacion_fisica": 55,
    "nivel_bancarizacion": 38,
    "indice_empleo": 48,
    "conectividad": 55
  },
  "tam_params": {
    "poblacion": 15420,
    "gasto_promedio": 2400,
    "sector": "restaurante",
    "pct_mercado_accesible": 30,
    "pct_cuota_capturable": 5
  },
  "roi_params": {
    "inversion_inicial": 50000,
    "ingreso_base": 18000,
    "margen_utilidad": 0.30,
    "costos_fijos": 5000,
    "idm_array": [0.85,0.90,1.0,1.0,1.1,0.95,1.0,1.0,1.15,1.0,1.2,1.30]
  },
  "mc_params": {
    "ingreso_esperado": 18000,
    "costo_esperado": 5000,
    "inversion_inicial": 50000,
    "meses": 12
  }
}
```

**Sectores válidos:** `general`, `restaurante`, `retail`, `servicios`, `salud`, `educacion`, `entretenimiento`, `tecnologia`

**Response 200:**
```json
{
  "analysis_id": "uuid",
  "viability_score": 36.85,
  "rating": { "label": "No recomendado", "color": "red", "icon": "❌" },
  "irl": {
    "irl_score": 46.65,
    "category": "mixta",
    "correction_factor": 1.3,
    "description": "Economía mixta. Aplicar factor corrección 1.3×."
  },
  "tam_som": {
    "tam": 488505600,
    "sam": 146551680,
    "som": 7327584,
    "som_mensual": 610632,
    "sector_multiplier": 1.1,
    "interpretation": "Mercado nicho. Factible con diferenciación clara."
  },
  "roi": {
    "roi_porcentaje": 14.46,
    "utilidad_total_anual": 7230,
    "utilidad_mensual_promedio": 602.5,
    "break_even_meses": 83,
    "viabilidad": "Bajo — Evaluar reducción de costos o aumento de precio",
    "flujo_mensual": [ ... 12 objects ... ]
  },
  "monte_carlo": {
    "iterations": 10000,
    "mean_roi": 311.61,
    "p10_roi": 278.73,
    "p50_roi": 311.51,
    "p90_roi": 344.68,
    "prob_positivo": 100,
    "std_roi": 25.51,
    "escenarios": {
      "pesimista": { "roi": 278.73, "label": "Pesimista (P10)" },
      "realista":  { "roi": 311.51, "label": "Realista (P50)" },
      "optimista": { "roi": 344.68, "label": "Optimista (P90)" }
    },
    "interpretacion": "Alta probabilidad de éxito. Inversión respaldada estadísticamente."
  },
  "svee": {
    "best_month": "Diciembre",
    "best_month_num": 12,
    "best_score": 0.468,
    "prep_start_month": "Septiembre",
    "recommendation": "Ventana aceptable: Abre en Diciembre. Comienza preparativos en Septiembre...",
    "ranking": [ ... top months ... ],
    "monthly_data": [ ... 12 objects ... ]
  }
}
```

---

### GET `/investment/history`
Historial de análisis del usuario autenticado (últimos 20).

**Response 200:**
```json
{ "data": [ { "id": "uuid", "business_name": "...", "viability_score": 36.85, "created_at": "..." } ] }
```

---

### GET `/investment/:id`
Obtiene un análisis específico con resultado completo.

**Response 200:**
```json
{ "data": { "id": "uuid", "business_name": "...", "result": { ... full analysis ... } } }
```

---

## Fórmulas del Motor (Referencia rápida)

| Módulo | Fórmula |
|--------|---------|
| IRL | `IRL = 0.30×DD + 0.25×VF + 0.20×NB + 0.15×IE + 0.10×CP` |
| ROI | `ROI = (Utilidad_Anual / Inversión) × 100` |
| Utilidad mensual | `U = (Ingreso_Base × IDM) × Margen − Costos_Fijos` |
| TAM | `Población × Gasto_Promedio × 12 × Multiplicador_Sector` |
| SAM | `TAM × (pct_accesible / 100)` |
| SOM | `SAM × (pct_capturable / 100)` |
| SVEE | `Score = IDM × 0.6 + (menciones/max_menciones) × 0.4` |

Ver `docs/FORMULAS.md` para detalles completos.
