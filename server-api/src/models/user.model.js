/**
 * User Model — Sequelize
 */
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  last_name: { type: DataTypes.STRING(100), allowNull: true },
  age: { type: DataTypes.INTEGER, allowNull: true },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  preferred_niches: { type: DataTypes.STRING(255), allowNull: true },
  average_investment: { type: DataTypes.DECIMAL(12, 2), allowNull: true, defaultValue: null },
  profile_image_url: { type: DataTypes.STRING(500), allowNull: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
  plan_type: {
    type: DataTypes.ENUM("basic", "pro", "enterprise"),
    defaultValue: "basic",
  },
}, {
  tableName: "users",
  underscored: true,
});

module.exports = User;
