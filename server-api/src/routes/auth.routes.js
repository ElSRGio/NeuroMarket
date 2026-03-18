/**
 * Auth Routes — /api/v2/auth
 */
const router = require("express").Router();
const { body } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/auth.controller");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.post("/register",
  upload.single("profile_image"),
  body("name").notEmpty().trim(),
  body("last_name").optional({ values: "falsy" }).trim(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("age").optional({ values: "falsy" }).isInt({ min: 16, max: 100 }),
  body("preferred_niches").optional({ values: "falsy" }).isString().isLength({ max: 255 }),
  body("average_investment").optional({ values: "falsy" }).isFloat({ min: 0 }),
  registerUser
);

router.post("/login",
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  loginUser
);

module.exports = router;
