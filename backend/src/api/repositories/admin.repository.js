const Admin = require('../../models/Admin');

/**
 * Find and return a single admin by username.
 * 
 * @param {string} username - The username to search for.
 * @returns {Promise<Object|null>} The admin document or null if not found.
 */
const findByUsername = async (username) => {
  return await Admin.findOne({ username });
};

/**
 * Create and return a new admin document.
 * 
 * @param {Object} data - The admin data (username, password).
 * @returns {Promise<Object>} The created admin document.
 */
const createAdmin = async (data) => {
  return await Admin.create(data);
};

/**
 * Find and return a single admin by ID.
 * 
 * @param {string} id - The MongoDB ObjectId.
 * @returns {Promise<Object|null>} The admin document or null if not found.
 */
const findById = async (id) => {
  return await Admin.findById(id);
};

module.exports = {
  findByUsername,
  createAdmin,
  findById,
};
