/**
 * Auth Service — register & login
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function register({ name, email, password }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw Object.assign(new Error("El email ya está registrado"), { status: 409 });

  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password_hash });

  const token = _signToken(user);
  return { user: _safeUser(user), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw Object.assign(new Error("Credenciales inválidas"), { status: 401 });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw Object.assign(new Error("Credenciales inválidas"), { status: 401 });

  const token = _signToken(user);
  return { user: _safeUser(user), token };
}

function _signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan_type },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function _safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, plan_type: user.plan_type };
}

module.exports = { register, login };
