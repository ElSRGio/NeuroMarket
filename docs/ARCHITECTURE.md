# Arquitectura — XAIZA 2.0

## 📺 Demostraciones Visuales Tecnicas

### ⭐ Versión Integrada: Entrada → BD → Cálculos (RECOMENDADA - NUEVA)
- **Archivo**: `docs/PLATFORM_ANIMATIONS_INTEGRATED.html`
- **Contenido**: Flujo completo y coherente mostrando:
  - 📊 **Diagram de Flujo**: Entrada → PostgreSQL → Cálculo (líneas conectadas)
  - 📝 **Panel 1 - Entrada de Datos**: Usuario ingresa "Restaurante La Familia" con typing animation (nombre, inversión, ingreso, margen, costos)
  - 💾 **Panel 2 - Persistencia en PostgreSQL**: Mostrando exactamente dónde se guardan esos datos en tabla `analyses` (las 6 columnas)
  - 🧮 **Panel 3 - Cálculos Matemáticos**: Transformación usando los MISMOS datos - IRL, ROI, Break-even, Score Final (con indicadores ✓ o ❌)
  - 📍 **Ejemplo Completo**: "Restaurante La Familia" (Libres, Puebla) con input ($50k, $18k/mes, 30%, $5k costos) → transformación → resultado (28.5/100 ❌ No Recomendado)
  - ⏱️ **Timeline Detallado**: Paso a paso desde T=0.0s (usuario escribe) hasta T=8.5s (dashboard renderizado), mostrando exactamente qué ocurre en cada momento
- **Ideal para**: Presentaciones ejecutivas, demos integradas, explicar cómo los datos del usuario se convierten en recomendación

### Versión Básica: Flujo de Sistema Completo
- **Archivo**: `docs/PLATFORM_ANIMATIONS.html`
- **Contenido**: Mapa de flujo de datos, tablas de BD llenándose, ejemplo concreto con números reales
- **Ideal para**: Referencia histórica, entender arquitectura general

### Versión Avanzada: Animaciones Complejas en Tiempo Real
- **Archivo**: `docs/PLATFORM_ANIMATIONS_ADVANCED.html`
- **Contenido**: 3 paneles simultáneos con animaciones complejas (typing, BD, math)
  - 📝 Animación de escritura en tiempo real (typing)
  - 💾 Visualización de tablas PostgreSQL
  - 🧮 Transformación matemática con fórmulas
  - 🔄 Flujo de 5 etapas del sistema
  - 📊 Canvas animado con visualización de datos
- **Ideal para**: Demos técnicas detalladas, referencias gráficas avanzadas

### 🎬 Generador de GIFs desde Animaciones HTML
- **Archivo**: `docs/GIF_GENERATOR.html`
- **Propósito**: Convertir las animaciones HTML interactivas a archivos GIF optimizados para compartir
- **Características**:
  - ✅ Selecciona qué animación convertir (Integrada, Avanzada o Básica)
  - ✅ Elige FPS (4, 5, 8, 10) para controlar fluidez vs. tamaño
  - ✅ Selecciona resolución (480p, 720p, 1080p, 1440p)
  - ✅ Ajusta velocidad de reproducción (50% a 200%)
  - ✅ Descarga directa del GIF generado
  - ✅ Barra de progreso en tiempo real
  
**Cómo usar:**
1. Abre `docs/GIF_GENERATOR.html` en tu navegador
2. Selecciona la animación que deseas convertir
3. Configura FPS y calidad según tus necesidades
4. Haz click en "🚀 Iniciar Captura"
5. Espera a que se genere (puede tardar 1-2 minutos)
6. Descarga automáticamente el archivo GIF

**Recomendaciones por uso:**
- **Presentaciones rápidas**: 720p + 5 FPS + velocidad 100%
- **Redes Sociales**: 480p + 8 FPS + velocidad 150%
- **Documentación detallada**: 1080p + 4 FPS + velocidad 100%
- **Demostraciones técnicas**: 1080p + 5 FPS + velocidad 100%

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
