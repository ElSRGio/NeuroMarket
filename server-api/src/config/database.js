/**
 * PostgreSQL connection via Sequelize
 * Supports DATABASE_URL (Render) or individual DB_* env vars
 */
const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: isProduction
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  });
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
      dialectOptions: isProduction
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
    }
  );
}

module.exports = { sequelize };
