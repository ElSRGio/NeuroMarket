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
        (0, "informal", "Economía predominantemente informal. Datos subestiman 40–60%.", 1.50),
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

        irl_score = round(sum(variables[k] * self.WEIGHTS[k] for k in self.WEIGHTS), 2)
        category, description, correction_factor = self._interpret(irl_score)

        return {
            "irl_score": irl_score,
            "category": category,
            "description": description,
            "correction_factor": correction_factor,
            "variables": variables,
            "contribution": {k: round(variables[k] * self.WEIGHTS[k], 2) for k in self.WEIGHTS},
        }

    def _interpret(self, score: float):
        for threshold, category, description, factor in self.THRESHOLDS:
            if score >= threshold:
                return category, description, factor
        return "informal", "Economía predominantemente informal.", 1.50

    @staticmethod
    def _clamp(value: float, lo: float = 0, hi: float = 100) -> float:
        return max(lo, min(hi, float(value)))
