const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      return next(); // proceed
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

// 👤 Patient-only access
exports.isPatient = (req, res, next) => {
  if (!req.user || req.user.role !== "patient") {
    return res.status(403).json({ message: "Access denied: Patient only" });
  }
  next();
};


// 👨‍⚕️ Doctor-only access
exports.isDoctor = (req, res, next) => {
  if (!req.user || req.user.role !== "doctor") {
    return res.status(403).json({ message: "Access denied: Doctor only" });
  }
  next();
};


// 🛠️ Admin-only access
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }
  next();
};