const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const { 
  getAllUsers, 
  updateUserPlan,
  updateUser,
  deleteUser,
  getDeletedUsersLog,
  getAllReports,
  getReportById,
  downloadReportPdfAsAdmin,
  getUsageSummary,
  resetUserPassword,
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
router.get("/users/deleted-log", getDeletedUsersLog);
router.put("/users/:id", updateUser);
router.put("/users/:id/plan", updateUserPlan);
router.put("/users/:id/reset-password", resetUserPassword);
router.delete("/users/:id", deleteUser);

router.get("/reports", getAllReports);
router.get("/reports/summary", getUsageSummary);
router.get("/reports/:id", getReportById);
router.get("/reports/:id/pdf", downloadReportPdfAsAdmin);

module.exports = router;
