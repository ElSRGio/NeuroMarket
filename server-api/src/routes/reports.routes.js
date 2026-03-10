/**
 * Reports Routes — /api/v2/reports (placeholder)
 */
const router = require("express").Router();
const auth = require("../middleware/auth.middleware");

router.get("/", auth, (req, res) => {
  res.json({ message: "Reports endpoint — coming in Phase 3" });
});

module.exports = router;
