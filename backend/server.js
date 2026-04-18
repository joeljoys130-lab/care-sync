require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middleware/authMiddleware");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/test", protect, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user,
  });
});

app.use("/api/patient", require("./routes/patientRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});