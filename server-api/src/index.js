/**
 * NeuroMarket 2.0 — Entry Point
 * Node.js + Express API
 */
require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./config/database");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("[DB] PostgreSQL connected");
    await sequelize.sync({ alter: false });
    console.log("[DB] Models synchronized");

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
