/**
 * Reports Routes — /api/v2/reports
 */
const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { requirePdfAccess } = require("../middleware/plan.middleware");
const Analysis = require("../models/analysis.model");
const { generatePDF } = require("../services/pdf.service");

// GET /api/v2/reports/:id/pdf — Pro/Enterprise only
router.get("/:id/pdf", auth, requirePdfAccess, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!analysis) return res.status(404).json({ error: "Análisis no encontrado" });

    const pdfBuffer = await generatePDF(analysis.toJSON());

    const safeName = (analysis.business_name || "reporte")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="neuromarket_${safeName}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("[PDF]", err.message);
    res.status(500).json({ error: "Error generando el PDF: " + err.message });
  }
});

module.exports = router;

