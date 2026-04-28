"""
XAIZA 2.0 — Bootstrap Script
Run this once to create all project directories and files.
Usage: python bootstrap.py
"""
import os

BASE = os.path.dirname(os.path.abspath(__file__))


def write(rel_path, content):
    abs_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    with open(abs_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  created: {rel_path}")


files = {}

# ── engine/requirements.txt ─────────────────────────────────────────────────
files["engine/requirements.txt"] = """\
flask==3.0.0
flask-cors==4.0.0
numpy==1.26.4
scipy==1.12.0
pandas==2.2.1
psycopg2-binary==2.9.9
python-dotenv==1.0.1
gunicorn==21.2.0
"""

# ── engine/Dockerfile ────────────────────────────────────────────────────────
files["engine/Dockerfile"] = """\
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "main:app"]
"""

# ── engine/main.py ───────────────────────────────────────────────────────────
files["engine/main.py"] = '''\
"""
XAIZA 2.0 — Python Analytics Engine
Entry point for Flask API
"""
import os
from dotenv import load_dotenv
from src.api.app import create_app

load_dotenv()

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("ENGINE_PORT", 5000))
    debug = os.getenv("NODE_ENV", "development") == "development"
    print(f"[XAIZA Engine] Starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
'''

# ── Python package __init__.py files ────────────────────────────────────────
for pkg in [
    "engine/src/__init__.py",
    "engine/src/api/__init__.py",
    "engine/src/core/__init__.py",
    "engine/src/utils/__init__.py",
]:
    files[pkg] = "\n"

# ── engine/src/api/app.py ────────────────────────────────────────────────────
files["engine/src/api/app.py"] = '''\
"""
Flask Application Factory
"""
from flask import Flask
from flask_cors import CORS
from .routes import register_routes


def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

    register_routes(app)

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "neuromarket-engine", "version": "2.0"}

    return app
'''

# ── engine/src/api/routes.py ─────────────────────────────────────────────────
files["engine/src/api/routes.py"] = '''\
"""
API Route Registration — XAIZA Engine
"""
from flask import Blueprint, request, jsonify
from ..core.irl_calculator import IRLCalculator
from ..core.tam_som_engine import TAMSOMEngine
from ..core.roi_projector import ROIProjector
from ..core.monte_carlo import MonteCarloSimulator
from ..core.svee_detector import SVEEDetector

bp = Blueprint("neuromarket", __name__, url_prefix="/api/engine")


@bp.post("/irl")
def calculate_irl():
    """Calculate Índice de Realidad Local"""
    data = request.get_json()
    calculator = IRLCalculator()
    result = calculator.calculate(
        densidad_digital=data.get("densidad_digital", 0),
        validacion_fisica=data.get("validacion_fisica", 0),
        nivel_bancarizacion=data.get("nivel_bancarizacion", 0),
        indice_empleo=data.get("indice_empleo", 0),
        conectividad=data.get("conectividad", 0),
    )
    return jsonify(result)


@bp.post("/tam-som")
def calculate_tam_som():
    """Calculate TAM/SAM/SOM for a business sector"""
    data = request.get_json()
    engine = TAMSOMEngine()
    result = engine.calculate(
        poblacion=data.get("poblacion", 0),
        gasto_promedio=data.get("gasto_promedio", 0),
        pct_mercado_accesible=data.get("pct_mercado_accesible", 30),
        pct_cuota_capturable=data.get("pct_cuota_capturable", 5),
        sector=data.get("sector", "general"),
    )
    return jsonify(result)


@bp.post("/roi")
def calculate_roi():
    """Calculate ROI Estructural Proyectado"""
    data = request.get_json()
    projector = ROIProjector()
    result = projector.project(
        capital_total=data.get("capital_total", 0),
        inversion_inicial=data.get("inversion_inicial", 0),
        costos_fijos=data.get("costos_fijos", 0),
        gasto_promedio=data.get("gasto_promedio", 0),
        margen_contribucion=data.get("margen_contribucion", 0.30),
        clientes_estimados=data.get("clientes_estimados", 0),
        regimen_fiscal=data.get("regimen_fiscal", "RESICO"),
        idm_array=data.get("idm_array", [1.0] * 12)
    )
    return jsonify(result)


@bp.post("/monte-carlo")
def simulate_monte_carlo():
    """Run Monte Carlo simulation (10,000 iterations)"""
    data = request.get_json()
    simulator = MonteCarloSimulator(iterations=10000)
    result = simulator.simulate(
        ingreso_esperado=data.get("ingreso_esperado", 0),
        costo_esperado=data.get("costo_esperado", 0),
        inversion_inicial=data.get("inversion_inicial", 0),
        meses=data.get("meses", 12),
        margen_contribucion=data.get("margen_contribucion", 0.30),
        regimen_fiscal=data.get("regimen_fiscal", "RESICO"),
        capital_total=data.get("capital_total", 0),
    )
    return jsonify(result)


@bp.post("/svee")
def detect_svee():
    """Detect Ventanas Estratégicas de Entrada"""
    data = request.get_json()
    detector = SVEEDetector()
    result = detector.detect(
        menciones_mensuales=data.get("menciones_mensuales", [100] * 12),
        irl=data.get("irl", 70),
        factor_competencia=data.get("factor_competencia", 0.8),
    )
    return jsonify(result)


@bp.post("/full-analysis")
def full_investment_analysis():
    """Full investment viability analysis combining all modules"""
    data = request.get_json()

    irl_calc = IRLCalculator()
    tam_engine = TAMSOMEngine()
    roi_proj = ROIProjector()
    mc_sim = MonteCarloSimulator(iterations=10000)
    svee_det = SVEEDetector()

    irl = irl_calc.calculate(**data.get("irl_params", {}))
    tam_som = tam_engine.calculate(**data.get("tam_params", {}))
    roi = roi_proj.project(**data.get("roi_params", {}))
    monte_carlo = mc_sim.simulate(**data.get("mc_params", {}))
    svee = svee_det.detect(
        menciones_mensuales=data.get("menciones_mensuales", [100] * 12),
        irl=irl["irl_score"],
        factor_competencia=data.get("factor_competencia", 0.8),
    )

    score = _calculate_viability_score(irl, roi, tam_som, svee, monte_carlo)

    return jsonify({
        "viability_score": score,
        "irl": irl,
        "tam_som": tam_som,
        "roi": roi,
        "monte_carlo": monte_carlo,
        "svee": svee,
    })


def _calculate_viability_score(irl, roi, tam_som, svee, mc):
    roi_pct = min(roi.get("roi_porcentaje", 0) / 200 * 100, 100)
    irl_score = irl.get("irl_score", 0)
    som_ratio = min(tam_som.get("som", 0) / max(tam_som.get("tam", 1), 1) * 2000, 100)
    svee_max = min(max(svee.get("scores", [0])) * 100, 100)
    mc_p50 = min(mc.get("p50_roi", 0) / 200 * 100, 100)

    score = (
        roi_pct * 0.30
        + irl_score * 0.25
        + som_ratio * 0.20
        + svee_max * 0.15
        + mc_p50 * 0.10
    )
    return round(min(score, 100), 2)


def register_routes(app):
    app.register_blueprint(bp)
'''

# ── engine/src/core/irl_calculator.py ────────────────────────────────────────
files["engine/src/core/irl_calculator.py"] = '''\
"""
IRL — Índice de Realidad Local
Ajusta la confiabilidad de los datos digitales frente a la economía informal.

Fórmula:
    IRL = (0.30 × DD) + (0.25 × VF) + (0.20 × NB) + (0.15 × IE) + (0.10 × CP)
"""


class IRLCalculator:
    WEIGHTS = {
        "densidad_digital": 0.30,
        "validacion_fisica": 0.25,
        "nivel_bancarizacion": 0.20,
        "indice_empleo": 0.15,
        "conectividad": 0.10,
    }

    THRESHOLDS = [
        (80, "muy_confiable", "Datos muy confiables. Economía formal dominante.", 1.0),
        (60, "confiable", "Confiabilidad media. Ajuste moderado recomendado.", 1.15),
        (40, "mixta", "Economía mixta. Aplicar factor corrección 1.3×.", 1.30),
        (0, "informal", "Economía predominantemente informal. Datos digitales subestiman 40–60%.", 1.50),
    ]

    def calculate(
        self,
        densidad_digital: float = 0,
        validacion_fisica: float = 0,
        nivel_bancarizacion: float = 0,
        indice_empleo: float = 0,
        conectividad: float = 0,
    ) -> dict:
        variables = {
            "densidad_digital": self._clamp(densidad_digital),
            "validacion_fisica": self._clamp(validacion_fisica),
            "nivel_bancarizacion": self._clamp(nivel_bancarizacion),
            "indice_empleo": self._clamp(indice_empleo),
            "conectividad": self._clamp(conectividad),
        }

        irl_score = sum(
            variables[k] * self.WEIGHTS[k] for k in self.WEIGHTS
        )
        irl_score = round(irl_score, 2)

        category, description, correction_factor = self._interpret(irl_score)

        contribution = {
            k: round(variables[k] * self.WEIGHTS[k], 2) for k in self.WEIGHTS
        }

        return {
            "irl_score": irl_score,
            "category": category,
            "description": description,
            "correction_factor": correction_factor,
            "variables": variables,
            "contribution": contribution,
        }

    def _interpret(self, score: float):
        for threshold, category, description, factor in self.THRESHOLDS:
            if score >= threshold:
                return category, description, factor
        return "informal", "Economía predominantemente informal.", 1.50

    @staticmethod
    def _clamp(value: float, min_val: float = 0, max_val: float = 100) -> float:
        return max(min_val, min(max_val, float(value)))
'''

# ── engine/src/core/tam_som_engine.py ────────────────────────────────────────
files["engine/src/core/tam_som_engine.py"] = '''\
"""
TAM / SAM / SOM Engine
Calcula el tamaño de mercado total, disponible y capturable.

Fórmulas:
    TAM = Población × Gasto_promedio_categoría × 12
    SAM = TAM × (pct_mercado_accesible / 100)
    SOM = SAM × (pct_cuota_capturable / 100)
"""

SECTOR_MULTIPLIERS = {
    "restaurante": 1.10,
    "retail": 1.00,
    "servicios": 0.90,
    "tecnologia": 0.80,
    "salud": 1.20,
    "educacion": 0.95,
    "entretenimiento": 1.05,
    "general": 1.00,
}


class TAMSOMEngine:
    def calculate(
        self,
        poblacion: int = 0,
        gasto_promedio: float = 0,
        pct_mercado_accesible: float = 30,
        pct_cuota_capturable: float = 5,
        sector: str = "general",
    ) -> dict:
        multiplier = SECTOR_MULTIPLIERS.get(sector.lower(), 1.0)

        tam = poblacion * gasto_promedio * 12 * multiplier
        sam = tam * (pct_mercado_accesible / 100)
        som = sam * (pct_cuota_capturable / 100)

        som_anual_mensual = som / 12

        return {
            "tam": round(tam, 2),
            "sam": round(sam, 2),
            "som": round(som, 2),
            "som_mensual": round(som_anual_mensual, 2),
            "sector": sector,
            "sector_multiplier": multiplier,
            "pct_mercado_accesible": pct_mercado_accesible,
            "pct_cuota_capturable": pct_cuota_capturable,
            "interpretation": self._interpret(som, tam),
        }

    def _interpret(self, som: float, tam: float) -> str:
        if tam == 0:
            return "Datos insuficientes para interpretar el mercado."
        ratio = (som / tam) * 100
        if ratio >= 5:
            return "Mercado objetivo altamente atractivo para el primer año."
        elif ratio >= 2:
            return "Mercado objetivo viable con estrategia de penetración activa."
        elif ratio >= 0.5:
            return "Mercado nicho. Factible con diferenciación clara."
        return "Mercado muy pequeño. Validar supuestos de gasto y población."
'''

# ── engine/src/core/roi_projector.py ─────────────────────────────────────────
files["engine/src/core/roi_projector.py"] = '''\
"""
ROI Projector — Proyección Financiera Anual
Calcula ROI Estructural y flujo mensual con estacionalidad.

Fórmulas:
    U_mes = (Ingreso_base × IDM_mes) × Margen_utilidad - Costos_fijos
    U_anual = Σ U_mes
    ROI = (U_anual / Inversión_inicial) × 100
    Break_even = Inversión_inicial / (U_anual / 12)
"""


MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
          "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]


class ROIProjector:
    def project(
        self,
        capital_total: float = 0,
        inversion_inicial: float = 0,
        costos_fijos: float = 0,
        gasto_promedio: float = 0,
        margen_contribucion: float = 0.30,
        clientes_estimados: int = 0,
        regimen_fiscal: str = "RESICO",
        idm_array: list = None,
        **kwargs
    ) -> dict:
        if idm_array is None or len(idm_array) != 12:
            idm_array = [1.0] * 12

        capital_trabajo = max(0, capital_total - inversion_inicial)
        runway_meses = (capital_trabajo / costos_fijos) if costos_fijos > 0 else 999
        
        tasa_isr = 0.025 if regimen_fiscal == "RESICO" else 0.30
        ingreso_base = clientes_estimados * gasto_promedio

        flujo_mensual = []
        utilidad_total = 0

        for i, idm in enumerate(idm_array):
            ingreso_ajustado = ingreso_base * idm
            utilidad_bruta = ingreso_ajustado * margen_contribucion
            utilidad_antes_impuestos = utilidad_bruta - costos_fijos
            
            isr = ingreso_ajustado * tasa_isr if regimen_fiscal == "RESICO" else max(0, utilidad_antes_impuestos * tasa_isr)
            utilidad_neta = utilidad_antes_impuestos - isr

            flujo_mensual.append({
                "mes": MONTHS[i],
                "ingreso_ajustado": round(ingreso_ajustado, 2),
                "utilidad_bruta": round(utilidad_bruta, 2),
                "utilidad_neta": round(utilidad_neta, 2),
                "idm": idm,
            })
            utilidad_total += utilidad_neta

        roi = (utilidad_total / inversion_inicial * 100) if inversion_inicial > 0 else 0
        utilidad_mensual_promedio = utilidad_total / 12
        
        margen_unitario = gasto_promedio * margen_contribucion
        clientes_equilibrio = (costos_fijos / margen_unitario) if margen_unitario > 0 else 0

        return {
            "flujo_mensual": flujo_mensual,
            "utilidad_total_anual": round(utilidad_total, 2),
            "utilidad_mensual_promedio": round(utilidad_mensual_promedio, 2),
            "roi_porcentaje": round(roi, 2),
            "capital_trabajo": round(capital_trabajo, 2),
            "runway_meses": round(runway_meses, 1),
            "clientes_equilibrio": int(clientes_equilibrio),
            "inversion_inicial": inversion_inicial,
            "viabilidad": self._interpret_runway(runway_meses, clientes_estimados, clientes_equilibrio),
        }

    def _interpret_runway(self, runway: float, clientes_est: int, clientes_eq: float) -> str:
        if clientes_est < clientes_eq:
            return "Peligro — No alcanzas el punto de equilibrio"
        if runway < 3:
            return "Riesgo Alto — Runway menor a 3 meses"
        elif runway < 6:
            return "Riesgo Medio — Runway entre 3 y 6 meses"
        return "Viable — Runway superior a 6 meses"
'''

# ── engine/src/core/monte_carlo.py ───────────────────────────────────────────
files["engine/src/core/monte_carlo.py"] = '''\
"""
Monte Carlo Simulator — 10,000 iteraciones
Genera distribución de probabilidad de ROI bajo incertidumbre.

Escenarios:
    Optimista (P90): percentil 90
    Realista (P50): mediana
    Pesimista (P10): percentil 10
"""
import numpy as np


class MonteCarloSimulator:
    def __init__(self, iterations: int = 10000):
        self.iterations = iterations

    def simulate(
        self,
        ingreso_esperado: float = 0,
        costo_esperado: float = 0,
        inversion_inicial: float = 0,
        meses: int = 12,
        variabilidad_ingreso: float = 0.20,
        variabilidad_costo: float = 0.15,
        margen_contribucion: float = 0.30,
        regimen_fiscal: str = "RESICO",
        capital_total: float = 0,
    ) -> dict:
        rng = np.random.default_rng(seed=42)

        ingresos = rng.normal(
            loc=ingreso_esperado,
            scale=ingreso_esperado * variabilidad_ingreso,
            size=(self.iterations, meses),
        )
        costos = rng.normal(
            loc=costo_esperado,
            scale=costo_esperado * variabilidad_costo,
            size=(self.iterations, meses),
        )

        ingresos = np.clip(ingresos, 0, None)
        costos = np.clip(costos, 0, None)

        utilidad_bruta = ingresos * margen_contribucion
        utilidad_antes_impuestos = utilidad_bruta - costos
        
        tasa_isr = 0.025 if regimen_fiscal == "RESICO" else 0.30
        
        isr = ingresos * tasa_isr if regimen_fiscal == "RESICO" else np.maximum(0, utilidad_antes_impuestos * tasa_isr)
        utilidad_neta = utilidad_antes_impuestos - isr
        
        utilidad_total = np.sum(utilidad_neta, axis=1)
        roi_distribution = (
            (utilidad_total / inversion_inicial * 100)
            if inversion_inicial > 0
            else utilidad_total
        )

        p10 = float(np.percentile(roi_distribution, 10))
        p50 = float(np.percentile(roi_distribution, 50))
        p90 = float(np.percentile(roi_distribution, 90))
        mean = float(np.mean(roi_distribution))
        std = float(np.std(roi_distribution))
        prob_positivo = float(np.mean(roi_distribution > 0) * 100)

        histogram, bin_edges = np.histogram(roi_distribution, bins=20)

        return {
            "iterations": self.iterations,
            "p10_roi": round(p10, 2),
            "p50_roi": round(p50, 2),
            "p90_roi": round(p90, 2),
            "mean_roi": round(mean, 2),
            "std_roi": round(std, 2),
            "prob_positivo": round(prob_positivo, 1),
            "escenarios": {
                "pesimista": {"roi": round(p10, 2), "label": "Pesimista (P10)"},
                "realista": {"roi": round(p50, 2), "label": "Realista (P50)"},
                "optimista": {"roi": round(p90, 2), "label": "Optimista (P90)"},
            },
            "histogram": {
                "counts": histogram.tolist(),
                "bins": [round(float(b), 2) for b in bin_edges.tolist()],
            },
            "interpretacion": self._interpret(prob_positivo, p50),
        }

    def _interpret(self, prob_positivo: float, p50: float) -> str:
        if prob_positivo >= 85 and p50 >= 50:
            return "Alta probabilidad de éxito. Inversión respaldada estadísticamente."
        elif prob_positivo >= 70:
            return "Probabilidad favorable. Riesgo manejable con buena ejecución."
        elif prob_positivo >= 50:
            return "Viabilidad moderada. Requiere estrategia sólida y control de costos."
        return "Alta incertidumbre. Reconsiderar supuestos de ingreso o capital inicial."
'''

# ── engine/src/core/svee_detector.py ─────────────────────────────────────────
files["engine/src/core/svee_detector.py"] = '''\
"""
SVEE — Detector de Ventanas Estratégicas de Entrada
Determina el mejor mes para abrir un negocio basándose en estacionalidad.

Fórmulas:
    IDM_mes = Menciones_mes / Promedio_menciones_anuales
    SVEE_score = IDM_mes × IRL_factor × Factor_competencia

La ventana óptima es el mes con mayor SVEE considerando
3 meses previos para preparación.
"""

MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

PREP_MONTHS = 3  # Meses de preparación necesarios antes de abrir


class SVEEDetector:
    def detect(
        self,
        menciones_mensuales: list,
        irl: float = 70,
        factor_competencia: float = 0.8,
    ) -> dict:
        if len(menciones_mensuales) != 12:
            menciones_mensuales = (menciones_mensuales + [100] * 12)[:12]

        promedio = sum(menciones_mensuales) / 12
        if promedio == 0:
            promedio = 1

        irl_factor = irl / 100
        idm_array = [m / promedio for m in menciones_mensuales]
        scores = [idm * irl_factor * factor_competencia for idm in idm_array]

        monthly_data = []
        for i in range(12):
            monthly_data.append({
                "mes": MONTHS[i],
                "mes_num": i + 1,
                "menciones": menciones_mensuales[i],
                "idm": round(idm_array[i], 3),
                "svee_score": round(scores[i], 3),
            })

        max_score = max(scores)
        best_month_idx = scores.index(max_score)

        prep_start_idx = (best_month_idx - PREP_MONTHS) % 12
        prep_start_month = MONTHS[prep_start_idx]

        ranking = sorted(monthly_data, key=lambda x: x["svee_score"], reverse=True)

        return {
            "scores": [round(s, 3) for s in scores],
            "monthly_data": monthly_data,
            "best_month": MONTHS[best_month_idx],
            "best_month_num": best_month_idx + 1,
            "best_score": round(max_score, 3),
            "prep_start_month": prep_start_month,
            "ranking": ranking[:6],
            "recommendation": self._build_recommendation(
                MONTHS[best_month_idx], prep_start_month, max_score
            ),
        }

    def _build_recommendation(self, best_month: str, prep_month: str, score: float) -> str:
        if score >= 1.0:
            strength = "Excelente ventana"
        elif score >= 0.8:
            strength = "Buena ventana"
        else:
            strength = "Ventana aceptable"

        return (
            f"{strength}: Abre en {best_month}. "
            f"Comienza preparativos en {prep_month} "
            f"(permisos, inventario, contratación)."
        )
'''

# ── engine/src/utils/validators.py ───────────────────────────────────────────
files["engine/src/utils/validators.py"] = '''\
"""
Input validators for the XAIZA Engine API
"""


def validate_range(value, min_val=0, max_val=100, name="value"):
    if not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be a number")
    if not (min_val <= value <= max_val):
        raise ValueError(f"{name} must be between {min_val} and {max_val}")
    return float(value)


def validate_positive(value, name="value"):
    if not isinstance(value, (int, float)) or value < 0:
        raise ValueError(f"{name} must be a non-negative number")
    return float(value)


def validate_idm_array(arr):
    if not isinstance(arr, list) or len(arr) != 12:
        raise ValueError("idm_array must be a list of exactly 12 values")
    return [float(v) for v in arr]
'''

# ── docs/FORMULAS.md ─────────────────────────────────────────────────────────
files["docs/FORMULAS.md"] = """\
# Fórmulas Matemáticas — XAIZA 2.0

## 1. IRL — Índice de Realidad Local

Ajusta el análisis según qué tan confiables son los datos digitales frente a la economía informal regional.

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

**Interpretación IRL:**
- 80–100: Datos muy confiables, economía formal dominante
- 60–79: Confiabilidad media, ajuste moderado
- 40–59: Economía mixta, aplicar factor corrección 1.3×
- 0–39: Economía predominantemente informal, datos digitales subestiman 40–60%

## 2. TAM / SAM / SOM

```
TAM = Población_municipio × Gasto_promedio_categoría × 12
SAM = TAM × (Porcentaje_mercado_accesible / 100)
SOM = SAM × (Cuota_capturable_año1 / 100)
```

## 3. ROI Estructural Proyectado

```
U_mes = (Ingreso_base × IDM_mes) × Margen_utilidad
U_anual = Σ U_mes (12 meses)
ROI = (U_anual / Inversión_inicial) × 100
Break_even_meses = Inversión_inicial / (U_anual / 12)
```

## 4. Simulación Monte Carlo

- **10,000 iteraciones** por escenario
- Distribución normal para ingresos: `μ = ingreso_esperado`, `σ = ingreso_esperado × 0.20`
- Distribución normal para costos: `μ = costo_esperado`, `σ = costo_esperado × 0.15`

**Escenarios:**
- Optimista (P90): percentil 90 de las simulaciones
- Realista (P50): percentil 50 (mediana)
- Pesimista (P10): percentil 10

## 5. SVEE — Índice de Ventana Estacional

```
IDM_mes = Menciones_mes / Promedio_menciones_anuales
SVEE_score_mes = IDM_mes × IRL × Factor_competencia
```

**Ventana óptima**: Mes con SVEE_score más alto considerando 3 meses previos de preparación.

## 6. Score de Viabilidad Global

```
Score = (ROI_realista × 0.30) + (IRL × 0.25) + (SOM_ratio × 0.20) + (SVEE_max × 0.15) + (Monte_Carlo_P50 × 0.10)
```

**Escala**: 0–100
- 85–100: ✅ Muy viable — Invertir con confianza
- 70–84: 🟡 Viable — Riesgo controlado
- 50–69: ⚠️ Viable con reservas — Validar supuestos
- 0–49: ❌ No recomendado — Alto riesgo
"""

# ── docs/ARCHITECTURE.md ─────────────────────────────────────────────────────
files["docs/ARCHITECTURE.md"] = """\
# Arquitectura — XAIZA 2.0

## Visión General

XAIZA 2.0 es una plataforma de inteligencia de inversión hiperlocal compuesta por 4 servicios
independientes que se comunican a través de HTTP.

```
┌─────────────────────────────────────────────────────────┐
│                     Usuario Final                        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│              web-portal  (React 19 + Vite)              │
│              Puerto 5173                                 │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│           server-api  (Node.js + Express)               │
│           Puerto 3000                                    │
│  - Autenticación JWT                                     │
│  - CRUD proyectos / análisis                             │
│  - Proxy hacia engine Python                            │
└────────────┬──────────────────────┬─────────────────────┘
             │ SQL (Sequelize)      │ HTTP (Axios)
┌────────────▼──────┐   ┌──────────▼──────────────────────┐
│  PostgreSQL 16    │   │   engine  (Python + Flask)       │
│  Puerto 5432      │   │   Puerto 5000                    │
│                   │   │  - IRL Calculator                │
│  Tablas:          │   │  - TAM/SAM/SOM Engine            │
│  - users          │   │  - ROI Projector                 │
│  - projects       │   │  - Monte Carlo Simulator         │
│  - analyses       │   │  - SVEE Detector                 │
│  - reports        │   └──────────────────────────────────┘
└───────────────────┘
```

## Servicios

| Servicio | Tecnología | Puerto | Responsabilidad |
|----------|-----------|--------|----------------|
| `web-portal` | React 19 + Vite + Tailwind | 5173 | UI / dashboards / reportes |
| `server-api` | Node.js 20 + Express + Sequelize | 3000 | API REST, auth, persistencia |
| `engine` | Python 3.11 + Flask + NumPy | 5000 | Cálculos matemáticos / simulaciones |
| `postgres` | PostgreSQL 16 | 5432 | Base de datos relacional |

## Flujo de un Análisis Completo

1. Usuario llena formulario de proyecto en `web-portal`
2. `server-api` valida JWT y persiste los parámetros en PostgreSQL
3. `server-api` llama `POST /api/engine/full-analysis` en `engine`
4. `engine` ejecuta los 4 módulos (IRL → TAM/SOM → ROI → Monte Carlo → SVEE)
5. Resultado se devuelve como JSON y se persiste en `analyses`
6. `web-portal` renderiza el dashboard con gráficas y score de viabilidad

## Módulos del Engine (Phase 1)

### IRL Calculator (`src/core/irl_calculator.py`)
Pondera 5 variables socioeconómicas para generar un índice 0–100 de confiabilidad de datos.

### TAM/SOM Engine (`src/core/tam_som_engine.py`)
Calcula mercado total, servible y capturable aplicando multiplicadores por sector.

### ROI Projector (`src/core/roi_projector.py`)
Proyecta flujo mensual a 12 meses con índices de demanda estacional (IDM).

### Monte Carlo Simulator (`src/core/monte_carlo.py`)
10,000 iteraciones con distribuciones normales para ingresos y costos. Entrega P10/P50/P90.

### SVEE Detector (`src/core/svee_detector.py`)
Identifica el mes óptimo de apertura y calcula 3 meses de preparación previa.

## Patrones de Diseño

- **Factory Pattern**: `create_app()` en Flask para inyección de configuración
- **Strategy Pattern**: Calculadores intercambiables por sector/región
- **Blueprint Pattern**: Rutas Flask modularizadas
- **Seed para reproducibilidad**: Monte Carlo usa `np.random.default_rng(seed=42)`
"""


if __name__ == "__main__":
    print("XAIZA 2.0 — Bootstrap")
    print(f"Base directory: {BASE}")
    print()
    for rel_path, content in files.items():
        write(rel_path, content)
    print()
    print(f"Done. {len(files)} files created.")
    print()
    print("Next steps:")
    print("  cd engine && pip install -r requirements.txt && python main.py")
