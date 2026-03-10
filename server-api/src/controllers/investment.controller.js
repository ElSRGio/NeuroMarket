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

module.exports = { analyze, getOne, getHistory };
