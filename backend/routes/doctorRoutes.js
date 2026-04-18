const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, (req, res) => {
  res.json({ message: "Doctor route working" });
});

module.exports = router;