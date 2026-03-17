/**
 * PostgreSQL connection via Sequelize
 * Supports DATABASE_URL (Render) or individual DB_* env vars
 */
const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";
const sslOptions = isProduction ? { ssl: { require: true, rejectUnauthorized: false } } : {};

let sequelize;

if (process.env.DATABASE_URL) {
  // Parsear manualmente la URL para evitar que Sequelize use el string completo como host
  const rawUrl = process.env.DATABASE_URL.replace(/^postgresql:\/\//, "postgres://");
  const dbUrl = new URL(rawUrl);

  sequelize = new Sequelize(
    decodeURIComponent(dbUrl.pathname.slice(1)), // nombre de la DB (sin el / inicial)
    decodeURIComponent(dbUrl.username),
    decodeURIComponent(dbUrl.password),
    {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port) || 5432,
      dialect: "postgres",
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      dialectOptions: sslOptions,
    }
  );
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || "neuromarket_v2",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "neuromarket2024",
    {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      dialect: "postgres",
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      dialectOptions: sslOptions,
    }
  );
}

module.exports = { sequelize };
