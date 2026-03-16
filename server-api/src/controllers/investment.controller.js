/**
 * Investment Controller
 */
const investmentService = require("../services/investment.service");

async function analyze(req, res, next) {
  try {
    const result = await investmentService.runFullAnalysis(req.user.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const analysis = await investmentService.getAnalysis(req.params.id, req.user.id);
    res.json(analysis);
  } catch (err) { next(err); }
}

async function getHistory(req, res, next) {
  try {
    const analyses = await investmentService.getUserAnalyses(req.user.id);
    res.json(analyses);
  } catch (err) { next(err); }
}

async function getTrash(req, res, next) {
  try {
    const analyses = await investmentService.getTrashedAnalyses(req.user.id);
    res.json(analyses);
  } catch (err) { next(err); }
}

async function softDelete(req, res, next) {
  try {
    const result = await investmentService.softDeleteAnalysis(req.params.id, req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function restore(req, res, next) {
  try {
    const result = await investmentService.restoreAnalysis(req.params.id, req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function permanentDelete(req, res, next) {
  try {
    const result = await investmentService.permanentDeleteAnalysis(req.params.id, req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function updateName(req, res, next) {
  try {
    const { business_name } = req.body;
    if (!business_name?.trim()) return res.status(400).json({ error: "Nombre requerido" });
    const analysis = await investmentService.updateAnalysisName(req.params.id, req.user.id, business_name.trim());
    res.json(analysis);
  } catch (err) { next(err); }
}

async function getCredits(req, res, next) {
  try {
    const total = await investmentService.getAnalysisCount(req.user.id);
    const planLimits = { basic: 6, pro: Infinity, enterprise: Infinity };
    const plan = req.user.plan_type || "basic";
    const limit = planLimits[plan] ?? 6;
    res.json({ used: total, limit: limit === Infinity ? null : limit, plan });
  } catch (err) { next(err); }
}

module.exports = { analyze, getOne, getHistory, getTrash, softDelete, restore, permanentDelete, updateName, getCredits };
