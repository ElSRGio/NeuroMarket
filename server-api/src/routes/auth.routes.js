/**
 * Auth Routes — /api/v2/auth
 */
const router = require("express").Router();
const { body } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/auth.controller");

router.post("/register",
  body("name").notEmpty().trim(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  registerUser
);

router.post("/login",
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  loginUser
);

module.exports = router;
