const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// simple test route
router.get('/:doctorId', protect, (req, res) => {
  res.json({ message: "Reviews route working" });
});

router.post('/', protect, (req, res) => {
  res.json({ message: "Review created (mock)" });
});

module.exports = router;