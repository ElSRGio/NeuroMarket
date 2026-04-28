/**
 * PDF Report Service — Genera reporte ejecutivo con Puppeteer
 * Convierte el análisis de inversión en un PDF profesional
 */
const puppeteer = require("puppeteer");

function buildHtml(analysis) {
  const r = analysis.result || {};
  const roi = r.roi || {};
  const mc = r.monte_carlo || {};
  const irl = r.irl || {};
  const svee = r.svee || {};
  const tam = r.tam_som || {};
  const rating = r.rating || {};
  const score = analysis.viability_score || r.viability_score || 0;

  const scoreColor =
    score >= 85 ? "#16a34a" : score >= 70 ? "#eab308" : score >= 50 ? "#f97316" : "#ef4444";

  const flujoRows = (roi.flujo_mensual || [])
    .map(
      (m) => `
    <tr>
      <td>${m.mes}</td>
      <td>$${(m.ingreso_ajustado || 0).toLocaleString()}</td>
      <td>$${(m.utilidad_bruta || 0).toLocaleString()}</td>
      <td style="color:${m.utilidad_neta >= 0 ? "#16a34a" : "#ef4444"}">
        $${(m.utilidad_neta || 0).toLocaleString()}
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1e293b; }

  .cover { background: #0b1f3a; color: white; padding: 60px 50px; min-height: 220px; }
  .cover h1 { font-size: 32px; font-weight: 900; color: #2563eb; }
  .cover h2 { font-size: 18px; font-weight: 400; color: #94a3b8; margin-top: 6px; }
  .cover .meta { display: flex; gap: 40px; margin-top: 30px; }
  .cover .meta div { font-size: 13px; color: #64748b; }
  .cover .meta strong { display: block; color: #e2e8f0; font-size: 15px; }

  .score-badge {
    display: inline-block;
    font-size: 64px; font-weight: 900;
    color: ${scoreColor};
    background: #f8fafc;
    border: 4px solid ${scoreColor};
    border-radius: 16px;
    padding: 10px 30px;
    float: right; margin-top: -10px;
  }
  .score-label { color: ${scoreColor}; font-weight: bold; font-size: 16px; }

  .section { padding: 30px 50px; border-bottom: 1px solid #e2e8f0; }
  .section h3 { font-size: 16px; font-weight: 700; color: #0b1f3a; margin-bottom: 16px;
    border-left: 4px solid #2563eb; padding-left: 10px; }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center; }
  .kpi .val { font-size: 22px; font-weight: 900; color: #0b1f3a; }
  .kpi .lbl { font-size: 11px; color: #64748b; margin-top: 4px; }

  .scenarios { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
  .scenario { border-radius: 10px; padding: 16px; text-align: center; }
  .scenario.pessimist { background: #fef2f2; border: 1px solid #fecaca; }
  .scenario.realist   { background: #fefce8; border: 1px solid #fef08a; }
  .scenario.optimist  { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .scenario .s-roi { font-size: 24px; font-weight: 900; }
  .scenario .s-label { font-size: 12px; color: #64748b; margin-top: 4px; }
  .pessimist .s-roi { color: #dc2626; }
  .realist .s-roi   { color: #ca8a04; }
  .optimist .s-roi  { color: #16a34a; }

  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #0b1f3a; color: white; padding: 8px 12px; text-align: left; }
  td { padding: 7px 12px; border-bottom: 1px solid #f1f5f9; }
  tr:nth-child(even) td { background: #f8fafc; }

  .irl-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .irl-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 10px; text-align: center; }
  .irl-item .v { font-size: 20px; font-weight: 900; color: #2563eb; }
  .irl-item .l { font-size: 10px; color: #64748b; margin-top: 3px; }

  .svee-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;
    padding: 20px; text-align: center; }
  .svee-month { font-size: 28px; font-weight: 900; color: #16a34a; }
  .svee-prep { color: #64748b; font-size: 13px; margin-top: 6px; }
  .svee-rec { color: #374151; font-size: 12px; margin-top: 10px; font-style: italic; }

  .footer { padding: 20px 50px; background: #f8fafc; font-size: 11px; color: #94a3b8;
    display: flex; justify-content: space-between; }

  .disclaimer { margin: 0 50px 20px; background: #fefce8; border: 1px solid #fef08a;
    border-radius: 8px; padding: 12px 16px; font-size: 11px; color: #713f12; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div style="display:flex; justify-content:space-between; align-items:flex-start">
    <div>
      <div style="color:#2563eb; font-size:13px; font-weight:600; letter-spacing:2px; margin-bottom:8px">
        XAIZA 2.0 — REPORTE DE VIABILIDAD
      </div>
      <h1>${analysis.business_name || "Análisis de Inversión"}</h1>
      <h2>${analysis.sector} · ${analysis.municipio}, ${analysis.estado}</h2>
    </div>
    <div class="score-badge">${Number(score).toFixed(0)}</div>
  </div>
  <div class="meta">
    <div><strong>${analysis.municipio}, ${analysis.estado}</strong>Localización</div>
    <div><strong>$${Number(analysis.inversion_inicial || 0).toLocaleString()}</strong>Inversión inicial</div>
    <div><strong class="score-label">${rating.label || "—"} ${rating.icon || ""}</strong>Calificación</div>
    <div><strong>${new Date(analysis.createdAt).toLocaleDateString("es-MX", { dateStyle: "long" })}</strong>Fecha del análisis</div>
  </div>
</div>

<!-- KPIs FINANCIEROS -->
<div class="section">
  <h3>Resumen Financiero</h3>
  <div class="kpi-grid">
    <div class="kpi">
      <div class="val">${roi.roi_porcentaje?.toFixed(1) || "—"}%</div>
      <div class="lbl">ROI Proyectado</div>
    </div>
    <div class="kpi">
      <div class="val">$${Number(roi.utilidad_total_anual || 0).toLocaleString()}</div>
      <div class="lbl">Utilidad Anual</div>
    </div>
    <div class="kpi">
      <div class="val" style="color:${roi.runway_meses < 3 ? '#ef4444' : roi.runway_meses < 6 ? '#eab308' : '#16a34a'}">
        ${roi.runway_meses === 999 ? "∞" : roi.runway_meses?.toFixed(1) || "—"}
      </div>
      <div class="lbl">Runway (Meses)</div>
    </div>
    <div class="kpi">
      <div class="val">${roi.clientes_equilibrio || "—"}</div>
      <div class="lbl">Clientes/Mes (Pto. Eq.)</div>
    </div>
  </div>
</div>

<!-- MONTE CARLO -->
${mc.escenarios ? `
<div class="section">
  <h3>Simulación Monte Carlo — ${(mc.iterations || 10000).toLocaleString()} iteraciones</h3>
  <p style="color:#64748b; font-size:12px; margin-bottom:12px">
    ${mc.interpretacion || ""}
  </p>
  <div class="scenarios">
    <div class="scenario pessimist">
      <div class="s-roi">${mc.escenarios?.pesimista?.roi?.toFixed(1) || 0}%</div>
      <div class="s-label">Pesimista (P10)</div>
    </div>
    <div class="scenario realist">
      <div class="s-roi">${mc.escenarios?.realista?.roi?.toFixed(1) || 0}%</div>
      <div class="s-label">Realista (P50)</div>
    </div>
    <div class="scenario optimist">
      <div class="s-roi">${mc.escenarios?.optimista?.roi?.toFixed(1) || 0}%</div>
      <div class="s-label">Optimista (P90)</div>
    </div>
  </div>
</div>` : ""}

<!-- IRL -->
<div class="section">
  <h3>Índice de Realidad Local (IRL) — ${irl.irl_score || "—"}/100</h3>
  <p style="color:#64748b; font-size:12px; margin-bottom:12px">${irl.description || ""}</p>
  <div class="irl-grid">
    ${Object.entries(irl.variables || {}).map(([k, v]) => `
      <div class="irl-item">
        <div class="v">${v}</div>
        <div class="l">${k.replace(/_/g, " ")}</div>
      </div>`).join("")}
  </div>
</div>

<!-- SVEE -->
${svee.best_month ? `
<div class="section">
  <h3>Ventana Estratégica de Entrada (SVEE)</h3>
  <div class="svee-box">
    <div style="color:#64748b; font-size:13px; margin-bottom:4px">Mejor mes para abrir:</div>
    <div class="svee-month">📅 ${svee.best_month}</div>
    <div class="svee-prep">Inicio de preparativos: ${svee.prep_start_month}</div>
    <div class="svee-rec">${svee.recommendation || ""}</div>
  </div>
</div>` : ""}

<!-- FLUJO MENSUAL -->
${flujoRows ? `
<div class="section">
  <h3>Proyección de Flujo Mensual (12 meses)</h3>
  <table>
    <thead><tr><th>Mes</th><th>Ingreso Ajustado</th><th>Utilidad Bruta</th><th>Utilidad Neta</th></tr></thead>
    <tbody>${flujoRows}</tbody>
  </table>
</div>` : ""}

<!-- DISCLAIMER -->
<div class="disclaimer">
  ⚠️ Este reporte es generado por un sistema automatizado de análisis con fines informativos.
  No constituye asesoramiento financiero profesional. Los resultados de Monte Carlo son estimaciones
  estadísticas basadas en los parámetros ingresados. Consulta con un especialista antes de tomar
  decisiones de inversión.
</div>

<div class="footer">
  <span>XAIZA 2.0 — Consultora Estratégica de Inversión Hiperlocal</span>
  <span>Generado el ${new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}</span>
</div>

</body>
</html>`;
}

async function generatePDF(analysis) {
  const html = buildHtml(analysis);
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

module.exports = { generatePDF };
