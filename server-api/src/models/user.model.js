/**
 * User Model — Sequelize
 */
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  plan_type: {
    type: DataTypes.ENUM("basic", "pro", "enterprise"),
    defaultValue: "basic",
  },
}, {
  tableName: "users",
  underscored: true,
});

module.exports = User;
