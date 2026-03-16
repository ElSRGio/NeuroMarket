/**
 * Investment Routes — /api/v2/investment
 */
const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { limitAnalyses } = require("../middleware/plan.middleware");
const { analyze, getOne, getHistory, getTrash, softDelete, restore, permanentDelete, updateName, getCredits } = require("../controllers/investment.controller");

router.post("/analyze", auth, limitAnalyses, analyze);
router.get("/history", auth, getHistory);
router.get("/trash", auth, getTrash);
router.get("/credits", auth, getCredits);
router.get("/:id", auth, getOne);
router.patch("/:id/name", auth, updateName);
router.delete("/:id", auth, softDelete);
router.post("/:id/restore", auth, restore);
router.delete("/:id/permanent", auth, permanentDelete);

module.exports = router;
