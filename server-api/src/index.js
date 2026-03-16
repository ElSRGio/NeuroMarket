/**
 * NeuroMarket 2.0 — Entry Point
 * Node.js + Express API
 */
require("dotenv").config();
const cron = require("node-cron");
const app = require("./app");
const { sequelize } = require("./config/database");
const Analysis = require("./models/analysis.model");
const { Op } = require("sequelize");

const PORT = process.env.PORT || 3000;
const TRASH_DAYS = 30;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("[DB] PostgreSQL connected");
    await sequelize.sync({ alter: false });
    console.log("[DB] Models synchronized");

    // Auto-purge: eliminar permanentemente análisis en papelera > 30 días (corre diariamente a medianoche)
    cron.schedule("0 0 * * *", async () => {
      const cutoff = new Date(Date.now() - TRASH_DAYS * 86400000);
      const { count } = await Analysis.destroy({
        where: { deleted_at: { [Op.lte]: cutoff } },
        returning: true,
      }).then(n => ({ count: n })).catch(() => ({ count: 0 }));
      if (count > 0) console.log(`[CRON] Auto-purge: ${count} análisis eliminados permanentemente`);
    });

    app.listen(PORT, () => {
      console.log(`[NeuroMarket API] Running on http://localhost:${PORT}`);
      console.log(`[NeuroMarket API] Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("[FATAL] Could not start server:", error.message);
    process.exit(1);
  }
}

start();
