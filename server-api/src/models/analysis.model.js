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
  capital_total: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  costos_fijos: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  clientes_estimados: { type: DataTypes.INTEGER, allowNull: true },
  gasto_promedio: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  margen_contribucion: { type: DataTypes.DECIMAL(5, 4), allowNull: true },
  regimen_fiscal: { type: DataTypes.STRING(50), allowNull: true },
  params: { type: DataTypes.JSONB, defaultValue: {} },
  result: { type: DataTypes.JSONB, defaultValue: {} },
  viability_score: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
    defaultValue: "pending",
  },
  deleted_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
}, {
  tableName: "analyses",
  underscored: true,
});

module.exports = Analysis;
