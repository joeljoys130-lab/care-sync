const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');


router.get('/', protect, (req, res) => {
  res.json({ message: "Appointments route working" });
});

router.post('/', protect, (req, res) => {
  res.json({ message: "Appointment created (mock)" });
});

module.exports = router;