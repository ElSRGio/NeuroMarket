/**
 * Auth Service — register & login
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function register({ name, last_name, email, password, age, preferred_niches, average_investment, profile_image_url, role }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw Object.assign(new Error("El email ya está registrado"), { status: 409 });

  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    last_name: last_name || null,
    email,
    role: role || 'user',
    age: age || null,
    preferred_niches: preferred_niches || null,
    average_investment: average_investment || null,
    profile_image_url: profile_image_url || null,
    password_hash,
  });

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
    { id: user.id, email: user.email, plan: user.plan_type, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function _safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    last_name: user.last_name,
    age: user.age,
    email: user.email,
    role: user.role,
    preferred_niches: user.preferred_niches,
    average_investment: user.average_investment,
    profile_image_url: user.profile_image_url,
    plan_type: user.plan_type,
  };
}

module.exports = { register, login };
