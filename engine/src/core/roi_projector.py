"""
ROI Projector — Proyección Financiera Anual con Estacionalidad
Calcula flujo mensual, ROI Estructural y punto de equilibrio.

Fórmulas:
    U_mes = (Ingreso_base × IDM_mes) × Margen - Costos_fijos
    U_anual = Σ U_mes (12 meses)
    ROI = (U_anual / Inversión_inicial) × 100
    Break_even = Inversión_inicial / Utilidad_mensual_promedio
"""

MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
          "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]


class ROIProjector:
    def project(
        self,
        inversion_inicial: float = 0,
        ingreso_base: float = 0,
        margen_utilidad: float = 0.30,
        idm_array: list = None,
        costos_fijos: float = 0,
    ) -> dict:
        if not idm_array or len(idm_array) != 12:
            idm_array = [1.0] * 12

        flujo_mensual = []
        utilidad_total = 0

        for i, idm in enumerate(idm_array):
            ingreso_adj = ingreso_base * idm
            utilidad_bruta = ingreso_adj * margen_utilidad
            utilidad_neta = utilidad_bruta - costos_fijos
            utilidad_total += utilidad_neta

            flujo_mensual.append({
                "mes": MONTHS[i],
                "ingreso_ajustado": round(ingreso_adj, 2),
                "utilidad_bruta": round(utilidad_bruta, 2),
                "utilidad_neta": round(utilidad_neta, 2),
                "idm": round(idm, 3),
            })

        promedio_mensual = utilidad_total / 12
        roi = (utilidad_total / inversion_inicial * 100) if inversion_inicial > 0 else 0
        break_even = self._calculate_break_even_month(
            inversion_inicial=inversion_inicial,
            ingreso_base=ingreso_base,
            margen_utilidad=margen_utilidad,
            costos_fijos=costos_fijos,
            idm_array=idm_array,
            max_months=120,
        )

        return {
            "flujo_mensual": flujo_mensual,
            "utilidad_total_anual": round(utilidad_total, 2),
            "utilidad_mensual_promedio": round(promedio_mensual, 2),
            "roi_porcentaje": round(roi, 2),
            "break_even_meses": break_even,
            "inversion_inicial": inversion_inicial,
            "ingreso_base": ingreso_base,
            "margen_utilidad": margen_utilidad,
            "costos_fijos": costos_fijos,
            "viabilidad": self._interpret_roi(roi),
        }

    def _calculate_break_even_month(
        self,
        inversion_inicial: float,
        ingreso_base: float,
        margen_utilidad: float,
        costos_fijos: float,
        idm_array: list,
        max_months: int = 120,
    ):
        if inversion_inicial <= 0:
            return 0

        acumulado = -inversion_inicial
        for month_idx in range(max_months):
            idm = idm_array[month_idx % len(idm_array)]
            utilidad_neta = (ingreso_base * idm * margen_utilidad) - costos_fijos
            acumulado += utilidad_neta
            if acumulado >= 0:
                return month_idx + 1
        return None

    def _interpret_roi(self, roi: float) -> str:
        if roi >= 100:
            return "Excelente — Recuperación en menos de 12 meses"
        elif roi >= 50:
            return "Bueno — Recuperación entre 12 y 24 meses"
        elif roi >= 20:
            return "Aceptable — Recuperación entre 2 y 5 años"
        elif roi >= 0:
            return "Bajo — Evaluar reducción de costos o aumento de precio"
        return "Negativo — Revisar modelo de negocio"
