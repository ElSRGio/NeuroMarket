# NeuroMarket 2.0 — Consultora Estratégica de Inversión Hiperlocal

> De "¿qué dice la gente?" a "¿es viable invertir aquí y cuánta es la probabilidad de éxito?"

## Stack
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Sequelize
- **Analytics**: Python 3.11 + Flask + NumPy + SciPy
- **Database**: PostgreSQL 16

## Los 4 Pilares de Inteligencia

| Módulo | Función |
|--------|---------|
| **TAM/SAM/SOM Engine** | Tamaño de mercado con datos INEGI |
| **IRL (Índice de Realidad Local)** | Ajuste por economía informal |
| **Simulador Monte Carlo** | 10K iteraciones, 3 escenarios |
| **SVEE (Ventanas Estacionales)** | Mejor mes para abrir el negocio |

## Quick Start

```bash
# Levantar todo el stack
docker-compose up -d

# Frontend dev (local)
cd web-portal && npm install && npm run dev

# Backend dev (local)
cd server-api && npm install && npm run dev

# Engine dev (local)
cd engine && pip install -r requirements.txt && python main.py
```

## Fases de Expansión
- **Fase 1**: Libres, Puebla (validación)
- **Fase 2**: Estado de Puebla (replicación)
- **Fase 3**: Nacional (cualquier economía intermedia)

## Documentación
- [Arquitectura](docs/ARCHITECTURE.md)
- [Fórmulas](docs/FORMULAS.md)
- [API Reference](docs/API_REFERENCE.md)
