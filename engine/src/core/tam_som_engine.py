"""
TAM / SAM / SOM Engine
Calcula el tamaño de mercado total, disponible y capturable.

Fórmulas:
    TAM = Población × Gasto_promedio × 12 × Multiplicador_sector
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

        return {
            "tam": round(tam, 2),
            "sam": round(sam, 2),
            "som": round(som, 2),
            "som_mensual": round(som / 12, 2),
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
