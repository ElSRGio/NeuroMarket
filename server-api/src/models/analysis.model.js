/**
 * Analysis Model — stores investment analyses
 */
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Analysis = sequelize.define("Analysis", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  business_name: { type: DataTypes.STRING(200), allowNull: false },
  sector: { type: DataTypes.STRING(100), defaultValue: "general" },
  municipio: { type: DataTypes.STRING(100), defaultValue: "Libres" },
  estado: { type: DataTypes.STRING(100), defaultValue: "Puebla" },
  inversion_inicial: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  params: { type: DataTypes.JSONB, defaultValue: {} },
  result: { type: DataTypes.JSONB, defaultValue: {} },
  viability_score: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
    defaultValue: "pending",
  },
}, {
  tableName: "analyses",
  underscored: true,
});

module.exports = Analysis;
