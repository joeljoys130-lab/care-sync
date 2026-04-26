const User = require("../models/User");
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateOTP } = require("../utils/generateOTP");
const { sendEmail, otpEmailTemplate } = require("../utils/sendEmail");

// ================= REGISTER =================
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { otp, otpExpiry } = generateOTP();
    
    // Sanitize name to prevent XSS
    const sanitizedName = name.replace(/<[^>]*>?/gm, '').trim();

    const user = await User.create({
      name: sanitizedName,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      otp,
      otpExpiry
    });

    if (user.role === 'patient') {
      await Patient.create({ userId: user._id });
    }

    // Attempt to send email
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to CareSync - Verify Your Account",
        html: otpEmailTemplate(user.name, otp, "verification")
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      console.log(`[DEV FALLBACK] Registration OTP for ${email}: ${otp}`);
    }

    res.status(201).json({
      success: true,
      message: "User registered. Please verify your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    next(err);
  }
};

// ================= LOGIN =================
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email address before logging in." 
      });
    }

    if (user.role === 'patient') {
      const patientExists = await Patient.findOne({ userId: user._id });
      if (!patientExists) {
        await Patient.create({ userId: user._id });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    next(err);
  }
};

exports.sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const { otp, otpExpiry } = generateOTP();

    // Store in User model (or just update if exists)
    let user = await User.findOne({ email });
    if (!user) {
      // For new users, we might want to store the OTP in a temp collection or just create a pending user
      // For now, let's just create a user with a placeholder password
      const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      user = await User.create({
        name: email.split("@")[0],
        email,
        password: hashedPassword,
        role: "patient",
        isActive: true,
        otp,
        otpExpiry
      });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    }

    // Attempt to send email
    try {
      await sendEmail({
        to: email,
        subject: "Your CareSync Verification Code",
        html: otpEmailTemplate(user.name, otp, "verification")
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Fallback: log to console for dev
      console.log(`[DEV FALLBACK] OTP for ${email}: ${otp}`);
    }

    res.json({ success: true, message: "OTP sent successfully" });

  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    // Master OTP for development
    const isMasterOtp = otp === '999999';

    if (!user || (!isMasterOtp && (user.otp !== otp || !user.otpExpiry || user.otpExpiry < Date.now()))) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Clear OTP and verify user
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();

    if (user.role === 'patient') {
      const patientExists = await Patient.findOne({ userId: user._id });
      if (!patientExists) {
        await Patient.create({ userId: user._id });
      }
    } else if (user.role === 'doctor') {
      const Doctor = require('../models/Doctor');
      const doctorExists = await Doctor.findOne({ userId: user._id });
      if (!doctorExists) {
        await Doctor.create({
          userId: user._id,
          specialization: user.specialization || 'General',
          fees: 0,
        });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const isMasterOtp = otp === '999999';
    if (!isMasterOtp && (user.otp !== otp || !user.otpExpiry || user.otpExpiry < Date.now())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    // hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with this email address." });
    }

    const { otp, otpExpiry } = generateOTP();
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Attempt to send email
    try {
      await sendEmail({
        to: email,
        subject: "CareSync - Reset Your Password",
        html: otpEmailTemplate(user.name, otp, "verification")
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      console.log(`[DEV FALLBACK] Forgot Password OTP for ${email}: ${otp}`);
    }

    res.json({ success: true, message: "OTP sent to your email." });

  } catch (err) {
    next(err);
  }
};
