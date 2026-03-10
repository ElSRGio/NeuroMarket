/**
 * Investment Routes — /api/v2/investment
 */
const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { analyze, getOne, getHistory } = require("../controllers/investment.controller");

router.post("/analyze", auth, analyze);
router.get("/history", auth, getHistory);
router.get("/:id", auth, getOne);

module.exports = router;
