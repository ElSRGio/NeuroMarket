/**
 * Auth Controller
 */
const { register, login } = require("../services/auth.service");
const { validationResult } = require("express-validator");

async function registerUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    const msg = first.path === 'password'
      ? 'La contraseña debe tener al menos 6 caracteres'
      : first.path === 'email'
      ? 'El email no es válido'
      : 'Datos incompletos o inválidos';
    return res.status(400).json({ error: msg });
  }
  try {
    const data = { ...req.body };
    if (req.file) {
      data.profile_image_url = `/uploads/${req.file.filename}`;
    }
    const result = await register(data);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function loginUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Email o contraseña inválidos' });
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { registerUser, loginUser };
