const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminRepository = require('../repositories/admin.repository');
const env = require('../../config/env');

/**
 * Authenticate an admin and return a JWT.
 * 
 * @param {string} username - The admin's username
 * @param {string} password - The admin's plain text password
 * @returns {Promise<Object>} { token, admin: { id, username } }
 */
const login = async (username, password) => {
  const admin = await adminRepository.findByUsername(username);
  
  if (!admin) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  
  if (!isMatch) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  // Sign JWT
  const token = jwt.sign(
    { id: admin._id },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    token,
    admin: {
      id: admin._id,
      username: admin.username,
    },
  };
};

/**
 * Retrieve the currently authenticated admin's profile without sensitive data.
 * 
 * @param {string} adminId - The admin's MongoDB ObjectId
 * @returns {Promise<Object>} { id, username }
 */
const getMe = async (adminId) => {
  const admin = await adminRepository.findById(adminId);
  
  if (!admin) {
    const error = new Error('Admin not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: admin._id,
    username: admin.username,
  };
};

module.exports = {
  login,
  getMe,
};
