"""
SVEE — Detector de Ventanas Estratégicas de Entrada
Determina el mejor mes para abrir un negocio basándose en estacionalidad.

Fórmulas:
    IDM_mes = Menciones_mes / Promedio_menciones_anuales
    SVEE_score = IDM_mes × (IRL / 100) × Factor_competencia

Ventana óptima: mes con mayor SVEE, con 3 meses de preparación previa.
"""

MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

PREP_MONTHS = 3


class SVEEDetector:
    def detect(
        self,
        menciones_mensuales: list,
        irl: float = 70,
        factor_competencia: float = 0.8,
    ) -> dict:
        if len(menciones_mensuales) != 12:
            menciones_mensuales = (list(menciones_mensuales) + [100] * 12)[:12]

        promedio = sum(menciones_mensuales) / 12 or 1
        irl_factor = irl / 100
        idm_array = [m / promedio for m in menciones_mensuales]
        scores = [idm * irl_factor * factor_competencia for idm in idm_array]

        monthly_data = [
            {
                "mes": MONTHS[i],
                "mes_num": i + 1,
                "menciones": menciones_mensuales[i],
                "idm": round(idm_array[i], 3),
                "svee_score": round(scores[i], 3),
            }
            for i in range(12)
        ]

        best_idx = scores.index(max(scores))
        prep_idx = (best_idx - PREP_MONTHS) % 12

        return {
            "scores": [round(s, 3) for s in scores],
            "monthly_data": monthly_data,
            "best_month": MONTHS[best_idx],
            "best_month_num": best_idx + 1,
            "best_score": round(scores[best_idx], 3),
            "prep_start_month": MONTHS[prep_idx],
            "ranking": sorted(monthly_data, key=lambda x: x["svee_score"], reverse=True)[:6],
            "recommendation": self._recommend(MONTHS[best_idx], MONTHS[prep_idx], scores[best_idx]),
        }

    def _recommend(self, best: str, prep: str, score: float) -> str:
        strength = "Excelente ventana" if score >= 1.0 else ("Buena ventana" if score >= 0.8 else "Ventana aceptable")
        return f"{strength}: Abre en {best}. Comienza preparativos en {prep} (permisos, inventario, contratación)."
