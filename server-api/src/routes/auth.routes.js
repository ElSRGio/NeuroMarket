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
  body("age").optional({ values: "falsy" }).isInt({ min: 16, max: 100 }),
  body("preferred_niches").optional({ values: "falsy" }).isString().isLength({ max: 255 }),
  body("average_investment").optional({ values: "falsy" }).isFloat({ min: 0 }),
  body("profile_image_url").optional({ values: "falsy" }).isString().isLength({ max: 500 }),
  registerUser
);

router.post("/login",
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  loginUser
);

module.exports = router;
