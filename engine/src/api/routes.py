"""
API Route Registration — NeuroMarket Engine
"""
from flask import Blueprint, request, jsonify
from ..core.irl_calculator import IRLCalculator
from ..core.tam_som_engine import TAMSOMEngine
from ..core.roi_projector import ROIProjector
from ..core.monte_carlo import MonteCarloSimulator
from ..core.svee_detector import SVEEDetector
from ..core.apify_connector import ApifyConnector

bp = Blueprint("neuromarket", __name__, url_prefix="/api/engine")


@bp.post("/irl")
def calculate_irl():
    """Calcula el Índice de Realidad Local"""
    data = request.get_json() or {}
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
    """Calcula TAM/SAM/SOM para un sector de negocio"""
    data = request.get_json() or {}
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
    """Calcula ROI Estructural Proyectado a 12 meses"""
    data = request.get_json() or {}
    projector = ROIProjector()
    result = projector.project(
        inversion_inicial=data.get("inversion_inicial", 0),
        ingreso_base=data.get("ingreso_base", 0),
        margen_utilidad=data.get("margen_utilidad", 0.30),
        idm_array=data.get("idm_array", [1.0] * 12),
        costos_fijos=data.get("costos_fijos", 0),
    )
    return jsonify(result)


@bp.post("/monte-carlo")
def simulate_monte_carlo():
    """Simulación Monte Carlo 10,000 iteraciones"""
    data = request.get_json() or {}
    simulator = MonteCarloSimulator(iterations=10000)
    result = simulator.simulate(
        ingreso_esperado=data.get("ingreso_esperado", 0),
        costo_esperado=data.get("costo_esperado", 0),
        inversion_inicial=data.get("inversion_inicial", 0),
        meses=data.get("meses", 12),
    )
    return jsonify(result)


@bp.post("/svee")
def detect_svee():
    """Detecta Ventanas Estratégicas de Entrada"""
    data = request.get_json() or {}
    detector = SVEEDetector()
    result = detector.detect(
        menciones_mensuales=data.get("menciones_mensuales", [100] * 12),
        irl=data.get("irl", 70),
        factor_competencia=data.get("factor_competencia", 0.8),
    )
    return jsonify(result)


@bp.post("/full-analysis")
def full_investment_analysis():
    """Análisis de viabilidad completo — combina los 4 módulos"""
    data = request.get_json() or {}

    irl = IRLCalculator().calculate(**data.get("irl_params", {}))
    tam_som = TAMSOMEngine().calculate(**data.get("tam_params", {}))
    roi = ROIProjector().project(**data.get("roi_params", {}))
    monte_carlo = MonteCarloSimulator(iterations=10000).simulate(**data.get("mc_params", {}))
    svee = SVEEDetector().detect(
        menciones_mensuales=data.get("menciones_mensuales", [100] * 12),
        irl=irl["irl_score"],
        factor_competencia=data.get("factor_competencia", 0.8),
    )

    score = _viability_score(irl, roi, tam_som, svee, monte_carlo)

    return jsonify({
        "viability_score": score,
        "rating": _score_rating(score),
        "irl": irl,
        "tam_som": tam_som,
        "roi": roi,
        "monte_carlo": monte_carlo,
        "svee": svee,
    })


def _viability_score(irl, roi, tam_som, svee, mc):
    roi_pct = min(roi.get("roi_porcentaje", 0) / 200 * 100, 100)
    irl_score = irl.get("irl_score", 0)
    som_ratio = min(tam_som.get("som", 0) / max(tam_som.get("tam", 1), 1) * 2000, 100)
    svee_max = min(max(svee.get("scores", [0])) * 100, 100)
    mc_p50 = min(mc.get("p50_roi", 0) / 200 * 100, 100)

    return round(min(
        roi_pct * 0.30 + irl_score * 0.25 + som_ratio * 0.20 + svee_max * 0.15 + mc_p50 * 0.10,
        100
    ), 2)


def _score_rating(score):
    if score >= 85:
        return {"label": "Muy viable", "color": "green", "icon": "✅"}
    elif score >= 70:
        return {"label": "Viable", "color": "yellow", "icon": "🟡"}
    elif score >= 50:
        return {"label": "Viable con reservas", "color": "orange", "icon": "⚠️"}
    return {"label": "No recomendado", "color": "red", "icon": "❌"}


def register_routes(app):
    app.register_blueprint(bp)


@bp.get("/social-density")
def get_social_density():
    """
    Calcula densidad_digital real usando Apify (o estimación mock si no hay API key).
    Query params: municipio, estado, sector
    """
    municipio = request.args.get("municipio", "Libres")
    estado = request.args.get("estado", "Puebla")
    sector = request.args.get("sector", "general")

    connector = ApifyConnector()
    result = connector.get_social_density(municipio, estado, sector)
    return jsonify(result)
