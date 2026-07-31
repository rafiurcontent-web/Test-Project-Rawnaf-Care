const authService = require('../services/auth.service');
const env = require('../../config/env');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Username and password are required.',
      });
    }

    const { token, admin } = await authService.login(username, password);

    const isProduction = env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      admin,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const isProduction = env.NODE_ENV === 'production';

    res.cookie('token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      expires: new Date(0),
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const admin = await authService.getMe(req.admin.id);

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getMe,
};
