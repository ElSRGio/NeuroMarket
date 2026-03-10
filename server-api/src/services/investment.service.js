/**
 * Investment Service — orquesta llamadas al engine Python
 */
const axios = require("axios");
const Analysis = require("../models/analysis.model");

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
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
    limit: 20,
  });
}

module.exports = { runFullAnalysis, getAnalysis, getUserAnalyses };
