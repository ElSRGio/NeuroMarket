"""
Monte Carlo Simulator — 10,000 iteraciones
Genera distribución de probabilidad de ROI bajo incertidumbre.

Escenarios:
    Pesimista  (P10): percentil 10
    Realista   (P50): mediana
    Optimista  (P90): percentil 90
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
        margen_utilidad: float = 0.30,
        idm_array: list = None,
    ) -> dict:
        rng = np.random.default_rng(seed=42)

        if not idm_array or len(idm_array) == 0:
            idm_array = [1.0] * 12
        idm_vector = np.array([idm_array[i % len(idm_array)] for i in range(meses)])

        ingresos = np.clip(
            rng.normal(ingreso_esperado, ingreso_esperado * variabilidad_ingreso,
                       (self.iterations, meses)), 0, None)
        costos = np.clip(
            rng.normal(costo_esperado, costo_esperado * variabilidad_costo,
                       (self.iterations, meses)), 0, None)

        utilidad_mensual = (ingresos * idm_vector * margen_utilidad) - costos
        utilidad_total = np.sum(utilidad_mensual, axis=1)
        roi_dist = (utilidad_total / inversion_inicial * 100) if inversion_inicial > 0 else utilidad_total

        p10 = float(np.percentile(roi_dist, 10))
        p50 = float(np.percentile(roi_dist, 50))
        p90 = float(np.percentile(roi_dist, 90))
        # Éxito = recuperar la inversión en el horizonte evaluado (ROI >= 100%)
        prob_pos = float(np.mean(roi_dist >= 100) * 100)

        histogram, bin_edges = np.histogram(roi_dist, bins=20)

        return {
            "iterations": self.iterations,
            "p10_roi": round(p10, 2),
            "p50_roi": round(p50, 2),
            "p90_roi": round(p90, 2),
            "mean_roi": round(float(np.mean(roi_dist)), 2),
            "std_roi": round(float(np.std(roi_dist)), 2),
            "prob_positivo": round(prob_pos, 1),
            "escenarios": {
                "pesimista": {"roi": round(p10, 2), "label": "Pesimista (P10)"},
                "realista":  {"roi": round(p50, 2), "label": "Realista (P50)"},
                "optimista": {"roi": round(p90, 2), "label": "Optimista (P90)"},
            },
            "histogram": {
                "counts": histogram.tolist(),
                "bins": [round(float(b), 2) for b in bin_edges],
            },
            "interpretacion": self._interpret(prob_pos, p50),
        }

    def _interpret(self, prob_positivo: float, p50: float) -> str:
        if prob_positivo >= 85 and p50 >= 100:
            return "Alta probabilidad de éxito. Inversión respaldada estadísticamente."
        elif prob_positivo >= 70:
            return "Probabilidad favorable. Riesgo manejable con buena ejecución."
        elif prob_positivo >= 50:
            return "Viabilidad moderada. Requiere estrategia sólida y control de costos."
        return "Alta incertidumbre. Reconsiderar supuestos de ingreso o capital inicial."
