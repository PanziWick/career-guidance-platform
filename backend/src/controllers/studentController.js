const User = require('../models/User');
const AppError = require('../utils/AppError');

const ALLOWED_UPDATE_FIELDS = ['firstName', 'lastName'];

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    // Only allow whitelisted fields to be updated
    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(new AppError('No valid fields provided for update', 400));
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
