const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const env = require('../config/env');
const logger = require('../utils/logger');

const seedAdmin = async () => {
  let exitCode = 0;

  try {
    logger.info('Initializing MongoDB connection for seeding...');
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB Connected successfully.');

    // Check if the admin account already exists
    const adminExists = await Admin.findOne({ username: env.ADMIN_USERNAME });

    if (adminExists) {
      logger.info('Admin already exists. No action taken.');
    } else {
      // Hash the password with 12 salt rounds for robust security
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, salt);

      // Create the Admin document
      await Admin.create({
        username: env.ADMIN_USERNAME,
        password: hashedPassword,
      });

      logger.info('Admin account created successfully.');
    }
  } catch (error) {
    logger.error(`Error seeding admin: ${error.message}`);
    exitCode = 1;
  } finally {
    // Ensure database connection is closed cleanly before exit
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('MongoDB connection gracefully closed.');
    }
    process.exit(exitCode);
  }
};

// Execute the seeder
seedAdmin();
