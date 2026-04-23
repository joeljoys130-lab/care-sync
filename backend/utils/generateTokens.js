const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token (short-lived: 15 minutes)
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

/**
 * Generate JWT refresh token (long-lived: 7 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * Generate both tokens and return them
 */
const generateTokenPair = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

module.exports = { generateAccessToken, generateRefreshToken, generateTokenPair };
