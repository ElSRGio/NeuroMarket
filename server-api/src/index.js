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

async function ensureUserProfileColumns() {
  await sequelize.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS age INTEGER,
    ADD COLUMN IF NOT EXISTS preferred_niches VARCHAR(255),
    ADD COLUMN IF NOT EXISTS average_investment NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);
  `);
}

async function connectWithRetry(retries = 5, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("[DB] PostgreSQL connected");
      return true;
    } catch (err) {
      console.error(`[DB] Connection attempt ${i}/${retries} failed: ${err.message}`);
      if (i < retries) await new Promise(r => setTimeout(r, delay));
    }
  }
  return false;
}

async function start() {
  // Levanta el servidor HTTP inmediatamente para que Render no lo mate por timeout
  const server = app.listen(PORT, () => {
    console.log(`[NeuroMarket API] Running on http://localhost:${PORT}`);
    console.log(`[NeuroMarket API] Environment: ${process.env.NODE_ENV}`);
  });

  const connected = await connectWithRetry();
  if (!connected) {
    console.error("[FATAL] Could not connect to PostgreSQL after 5 attempts.");
    process.exit(1);
  }

  try {
    await ensureUserProfileColumns();
    await sequelize.sync({ alter: false });
    console.log("[DB] Models synchronized");
  } catch (err) {
    console.error("[DB] Sync warning:", err.message);
  }

  // Auto-purge: eliminar permanentemente análisis en papelera > 30 días (corre diariamente a medianoche)
  cron.schedule("0 0 * * *", async () => {
    try {
      const cutoff = new Date(Date.now() - TRASH_DAYS * 86400000);
      const count = await Analysis.destroy({
        where: { deleted_at: { [Op.lte]: cutoff } },
      });
      if (count > 0) console.log(`[CRON] Auto-purge: ${count} análisis eliminados permanentemente`);
    } catch (e) {
      console.error("[CRON] Auto-purge error:", e.message);
    }
  });
}

start();
