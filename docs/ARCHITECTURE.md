# Arquitectura — NeuroMarket 2.0

## Diagrama General

```
┌──────────────────────────────────────────────────────────────┐
│                        Usuario Final                          │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼───────────────────────────────┐
│              web-portal  (React 19 + Vite + Tailwind)        │
│              Puerto 5173                                      │
│  - Dashboard de Viabilidad (Score + Riesgo)                  │
│  - Simulador Dinámico de Capital (slider Break-even)         │
│  - Mapa de Ventanas Estacionales (SVEE)                      │
│  - Reportes PDF ejecutivos                                   │
└──────────────────────────────┬───────────────────────────────┘
                               │ REST API v2 (JWT)
┌──────────────────────────────▼───────────────────────────────┐
│           server-api  (Node.js 20 + Express + Sequelize)     │
│           Puerto 3000                                         │
│  Endpoints:                                                  │
│  POST /api/v2/investment/analyze                             │
│  POST /api/v2/investment/simulate                            │
│  POST /api/v2/market/tam-sam-som                             │
│  POST /api/v2/seasonality/windows                            │
│  POST /api/v2/reports/generate                              │
└──────────────┬──────────────────────────┬────────────────────┘
               │ SQL (Sequelize)          │ HTTP (Axios)
┌──────────────▼───────────┐  ┌──────────▼──────────────────────┐
│    PostgreSQL 16          │  │   engine  (Python 3.11 + Flask)  │
│    Puerto 5432            │  │   Puerto 5000                    │
│                           │  │                                  │
│  Tablas:                  │  │  /api/engine/irl                 │
│  - users                  │  │  /api/engine/tam-som             │
│  - projects               │  │  /api/engine/roi                 │
│  - analyses               │  │  /api/engine/monte-carlo         │
│  - reports                │  │  /api/engine/svee                │
│  - subscriptions          │  │  /api/engine/full-analysis       │
└───────────────────────────┘  └──────────────────────────────────┘
```

## Servicios

| Servicio | Tecnología | Puerto | Responsabilidad |
|----------|-----------|--------|----------------|
| `web-portal` | React 19 + Vite + Tailwind + Recharts | 5173 | UI / dashboards / simulador |
| `server-api` | Node.js 20 + Express + Sequelize + JWT | 3000 | API REST, auth, persistencia |
| `engine` | Python 3.11 + Flask + NumPy + SciPy | 5000 | Cálculos matemáticos |
| `postgres` | PostgreSQL 16 | 5432 | Base de datos relacional |

## Flujo de un Análisis Completo

```
1. Usuario llena formulario → web-portal
2. server-api valida JWT y guarda parámetros en PostgreSQL
3. server-api llama POST /api/engine/full-analysis → engine
4. engine ejecuta: IRL → TAM/SOM → ROI → Monte Carlo → SVEE
5. Resultado JSON guardado en tabla analyses
6. web-portal renderiza Score de Viabilidad + gráficas
```

## Módulos del Engine (Fase 1)

| Módulo | Archivo | Función |
|--------|---------|---------|
| IRL Calculator | `src/core/irl_calculator.py` | Índice 0–100 de confiabilidad de datos |
| TAM/SOM Engine | `src/core/tam_som_engine.py` | Mercado total, servible y capturable |
| ROI Projector | `src/core/roi_projector.py` | Flujo 12 meses + break-even |
| Monte Carlo | `src/core/monte_carlo.py` | 10K iteraciones P10/P50/P90 |
| SVEE Detector | `src/core/svee_detector.py` | Mes óptimo de apertura |

## Principios de Diseño

- **API-First**: Todos los endpoints versionados `/api/v2/...` para futura app móvil
- **Modular**: Máx 200 líneas por archivo, SRP estricto
- **Reproducible**: Monte Carlo usa `seed=42` para consistencia
- **Transparencia por plan**: Caja negra (Básico) vs Lógica semi-transparente (Premium)
