/**
 * Investment Service — orquesta llamadas al engine Python
 */
const axios = require("axios");
const Analysis = require("../models/analysis.model");
const { runFallbackAnalysis } = require("./analysis-fallback.service");

const ENGINE_URL = process.env.PYTHON_ENGINE_URL || "http://localhost:5000";

async function runFullAnalysis(userId, payload) {
  const analysis = await Analysis.create({
    user_id: userId,
    business_name: payload.business_name,
    sector: payload.sector || "general",
    municipio: payload.municipio || "Libres",
    estado: payload.estado || "Puebla",
    inversion_inicial: payload.roi_params?.inversion_inicial || 0,
    params: payload,
    status: "processing",
  });

  try {
    const { data } = await axios.post(`${ENGINE_URL}/api/engine/full-analysis`, payload, {
      timeout: 30000,
    });

    await analysis.update({
      result: data,
      viability_score: data.viability_score,
      status: "completed",
    });

    return { analysis_id: analysis.id, ...data };
  } catch (err) {
    const statusCode = err.response?.status;
    if (statusCode === 429 || !statusCode || statusCode >= 500) {
      const fallbackData = runFallbackAnalysis(payload);
      await analysis.update({
        result: fallbackData,
        viability_score: fallbackData.viability_score,
        status: "completed",
      });

      return {
        analysis_id: analysis.id,
        ...fallbackData,
        warning: "Se usó el motor de respaldo por disponibilidad temporal del engine principal.",
      };
    }

    await analysis.update({ status: "failed" });
    throw Object.assign(
      new Error(`Engine error: ${err.response?.data?.message || err.message}`),
      { status: 502 }
    );
  }
}

async function getAnalysis(analysisId, userId) {
  const analysis = await Analysis.findOne({ where: { id: analysisId, user_id: userId } });
  if (!analysis) throw Object.assign(new Error("Análisis no encontrado"), { status: 404 });
  return analysis;
}

async function getUserAnalyses(userId) {
  return Analysis.findAll({
    where: { user_id: userId, deleted_at: null },
    order: [["created_at", "DESC"]],
    limit: 50,
  });
}

async function getTrashedAnalyses(userId) {
  const { Op } = require("sequelize");
  return Analysis.findAll({
    where: { user_id: userId, deleted_at: { [Op.ne]: null } },
    order: [["deleted_at", "DESC"]],
  });
}

async function softDeleteAnalysis(analysisId, userId) {
  const analysis = await Analysis.findOne({ where: { id: analysisId, user_id: userId, deleted_at: null } });
  if (!analysis) throw Object.assign(new Error("Análisis no encontrado"), { status: 404 });
  await analysis.update({ deleted_at: new Date() });
  return { success: true };
}

async function restoreAnalysis(analysisId, userId) {
  const { Op } = require("sequelize");
  const analysis = await Analysis.findOne({ where: { id: analysisId, user_id: userId, deleted_at: { [Op.ne]: null } } });
  if (!analysis) throw Object.assign(new Error("Análisis no encontrado en papelera"), { status: 404 });
  await analysis.update({ deleted_at: null });
  return { success: true };
}

async function permanentDeleteAnalysis(analysisId, userId) {
  const { Op } = require("sequelize");
  const analysis = await Analysis.findOne({ where: { id: analysisId, user_id: userId, deleted_at: { [Op.ne]: null } } });
  if (!analysis) throw Object.assign(new Error("Análisis no encontrado en papelera"), { status: 404 });
  await analysis.destroy();
  return { success: true };
}

async function updateAnalysisName(analysisId, userId, business_name) {
  const analysis = await Analysis.findOne({ where: { id: analysisId, user_id: userId, deleted_at: null } });
  if (!analysis) throw Object.assign(new Error("Análisis no encontrado"), { status: 404 });
  await analysis.update({ business_name });
  return analysis;
}

async function getAnalysisCount(userId) {
  // Cuenta TODOS los análisis (incluyendo eliminados) para respetar el límite del plan
  return Analysis.count({ where: { user_id: userId } });
}

module.exports = {
  runFullAnalysis, getAnalysis, getUserAnalyses,
  getTrashedAnalyses, softDeleteAnalysis, restoreAnalysis,
  permanentDeleteAnalysis, updateAnalysisName, getAnalysisCount,
};
