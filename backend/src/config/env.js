require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  FRONTEND_URL: process.env.FRONTEND_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  WHATSAPP_PHONE: process.env.WHATSAPP_PHONE,
  WHATSAPP_MESSAGE: process.env.WHATSAPP_MESSAGE,
};

if (!env.MONGODB_URI || !env.JWT_SECRET) {
  throw new Error('Critical environment variables missing (MONGODB_URI or JWT_SECRET)');
}

module.exports = env;
