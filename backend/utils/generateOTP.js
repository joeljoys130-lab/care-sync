const crypto = require('crypto');

/**
 * Generate a 6-digit numeric OTP.
 * @returns {{ otp: string, otpExpiry: Date }}
 */
const generateOTP = () => {
  // Generate cryptographically secure 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, otpExpiry };
};

module.exports = { generateOTP };
