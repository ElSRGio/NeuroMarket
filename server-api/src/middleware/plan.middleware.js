/**
 * Plan Middleware — enforces feature limits per plan_type
 * basic:      max 3 analyses, no PDF export
 * pro:        unlimited analyses, PDF export
 * enterprise: all pro features + priority
 */
const Analysis = require("../models/analysis.model");

const PLAN_LIMITS = {
  basic:      { maxAnalyses: 6, pdfExport: false },
  pro:        { maxAnalyses: Infinity, pdfExport: true },
  enterprise: { maxAnalyses: Infinity, pdfExport: true },
};

/**
 * requirePlan(...plans) — restricts a route to specific plan types
 * Usage: router.post("/analyze", auth, requirePlan("pro", "enterprise"), handler)
 */
function requirePlan(...plans) {
  return (req, res, next) => {
    const userPlan = req.user?.plan || "basic";
    if (!plans.includes(userPlan)) {
      return res.status(403).json({
        error: "Esta función requiere un plan superior.",
        current_plan: userPlan,
        upgrade_required: true,
      });
    }
    next();
  };
}

/**
 * limitAnalyses — blocks analyze if basic user has reached max analyses
 */
async function limitAnalyses(req, res, next) {
  try {
    const userPlan = req.user?.plan || "basic";
    const limit = PLAN_LIMITS[userPlan]?.maxAnalyses ?? 3;

    if (limit === Infinity) return next();

    // Cuenta TODOS los análisis (incluyendo soft-deleted) para mantener el límite de créditos
    const count = await Analysis.count({ where: { user_id: req.user.id } });
    if (count >= limit) {
      return res.status(403).json({
        error: `Tu plan ${userPlan} permite un máximo de ${limit} análisis. Actualiza a Pro para análisis ilimitados.`,
        current_plan: userPlan,
        analyses_used: count,
        upgrade_required: true,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * requirePdfAccess — blocks PDF download for basic users
 */
function requirePdfAccess(req, res, next) {
  const userPlan = req.user?.plan || "basic";
  if (!PLAN_LIMITS[userPlan]?.pdfExport) {
    return res.status(403).json({
      error: "La exportación PDF está disponible en los planes Pro y Enterprise.",
      current_plan: userPlan,
      upgrade_required: true,
    });
  }
  next();
}

module.exports = { requirePlan, limitAnalyses, requirePdfAccess };
