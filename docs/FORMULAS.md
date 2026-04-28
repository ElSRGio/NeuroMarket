# Fórmulas Matemáticas — XAIZA 2.0

## 1. IRL — Índice de Realidad Local

Ajusta el análisis según qué tan confiables son los datos digitales frente a la economía informal.

```
IRL = (0.30 × DD) + (0.25 × VF) + (0.20 × NB) + (0.15 × IE) + (0.10 × CP)
```

| Variable | Descripción | Rango |
|----------|-------------|-------|
| DD | Densidad Digital (usuarios internet / población) | 0–100 |
| VF | Validación Física (negocios registrados INEGI vs estimados) | 0–100 |
| NB | Nivel de Bancarización (cuentas bancarias / PEA) | 0–100 |
| IE | Índice de Empleo formal | 0–100 |
| CP | Conectividad del municipio (cobertura 4G/5G) | 0–100 |

**Interpretación:**
- 80–100: Datos muy confiables, economía formal dominante (factor 1.0×)
- 60–79: Confiabilidad media, ajuste moderado (factor 1.15×)
- 40–59: Economía mixta, corrección 1.3× (factor 1.30×)
- 0–39: Economía predominantemente informal, datos subestiman 40–60% (factor 1.50×)

---

## 2. TAM / SAM / SOM

```
TAM = Población × Gasto_promedio_categoría × 12 × Multiplicador_sector
SAM = TAM × (Porcentaje_mercado_accesible / 100)
SOM = SAM × (Cuota_capturable_año1 / 100)
```

**Multiplicadores por sector:** restaurante 1.10 | retail 1.00 | servicios 0.90 | salud 1.20 | tecnología 0.80

---

## 3. ROI Estructural Proyectado

```
U_mes = (Ingreso_base × IDM_mes) × Margen_utilidad − Costos_fijos
U_anual = Σ U_mes  (12 meses)
ROI = (U_anual / Inversión_inicial) × 100
Break_even_meses = Inversión_inicial / (U_anual / 12)
```

---

## 4. Simulación Monte Carlo (10,000 iteraciones)

- Ingresos: distribución normal `μ = ingreso_esperado`, `σ = μ × 0.20`
- Costos: distribución normal `μ = costo_esperado`, `σ = μ × 0.15`

**Escenarios:**
- Pesimista (P10): percentil 10
- Realista (P50): mediana
- Optimista (P90): percentil 90

---

## 5. SVEE — Ventana Estratégica de Entrada

```
IDM_mes = Menciones_mes / Promedio_menciones_anuales
SVEE_score = IDM_mes × (IRL / 100) × Factor_competencia
```

**Ventana óptima:** mes con mayor SVEE_score. Preparativos: 3 meses antes.

---

## 6. Score de Viabilidad Global

```
Score = ROI_norm × 0.30 + IRL × 0.25 + SOM_ratio × 0.20 + SVEE_max × 0.15 + MC_P50 × 0.10
```

**Escala 0–100:**
- 85–100: ✅ Muy viable — Invertir con confianza
- 70–84:  🟡 Viable — Riesgo controlado
- 50–69:  ⚠️ Viable con reservas — Validar supuestos
- 0–49:   ❌ No recomendado — Alto riesgo
