const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const { 
  getAllUsers, 
  updateUserPlan
} = require("../controllers/admin.controller");

// Simple optional admin check
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Acceso denegado: Se requieren permisos de administrador." });
  }
};

router.use(requireAuth, requireAdmin);

router.get("/users", getAllUsers);
router.put("/users/:id/plan", updateUserPlan);

module.exports = router;
