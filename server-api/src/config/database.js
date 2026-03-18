/**
 * PostgreSQL connection via Sequelize
 * Supports: DATABASE_URL, DB_HOST as full URL, or individual DB_* env vars
 */
const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";
// Render's external connections require SSL. So if we detect a render.com host we FORCE SSL.
const forceSSL = process.env.DATABASE_URL?.includes('render.com') || process.env.DB_HOST?.includes('render.com');

const sslOptions = isProduction || forceSSL 
  ? { ssl: { require: true, rejectUnauthorized: false } } 
  : {};

function parseUrl(raw) {
  const normalized = raw.replace(/^postgresql:\/\//, "postgres://");
  const u = new URL(normalized);
  return {
    database: decodeURIComponent(u.pathname.slice(1)),
    username: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: parseInt(u.port) || 5432,
  };
}

function isUrl(str) {
  return str && (str.startsWith("postgresql://") || str.startsWith("postgres://"));
}

let cfg;

const rawUrl = process.env.DATABASE_URL || process.env.DB_HOST;

if (isUrl(rawUrl)) {
  // Render puso la URL completa en DATABASE_URL o accidentalmente en DB_HOST — la parseamos
  cfg = parseUrl(rawUrl);
  console.log(`[DB] Using connection URL → host: ${cfg.host}`);
} else {
  cfg = {
    database: process.env.DB_NAME || "neuromarket_v2",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "neuromarket2024",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
  };
}

const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
  host: cfg.host,
  port: cfg.port,
  dialect: "postgres",
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: sslOptions,
});

module.exports = { sequelize };
