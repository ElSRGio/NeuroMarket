const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/database");

// GET /api/v2/municipios — list all municipalities
router.get("/", async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT id, clave_inegi, nombre, estado, poblacion,
              densidad_digital, validacion_fisica,
              nivel_bancarizacion, indice_empleo, conectividad,
              gasto_promedio_mensual
       FROM municipios ORDER BY nombre`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v2/municipios/:id — single municipality IRL defaults
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT * FROM municipios WHERE id = :id`,
      { replacements: { id: req.params.id } }
    );
    if (!rows.length) return res.status(404).json({ error: "Municipio not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
