const AcademicProfile = require('../models/AcademicProfile');
const AppError = require('../utils/AppError');

const ALLOWED_UPDATE_FIELDS = ['interests', 'careerPreferences', 'existingSkills'];

const getMyAcademicProfile = async (req, res, next) => {
  try {
    let profile = await AcademicProfile.findOne({ userId: req.user._id });

    // Auto-create a skeleton profile on first access
    if (!profile) {
      profile = await AcademicProfile.create({
        userId: req.user._id,
        stream: 'Arts',
      });
    }

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyAcademicProfile = async (req, res, next) => {
  try {
    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(new AppError('No valid fields provided for update', 400));
    }

    let profile = await AcademicProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await AcademicProfile.create({
        userId: req.user._id,
        stream: 'Arts',
        ...updates,
      });
    } else {
      Object.assign(profile, updates);
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Academic profile updated',
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyAcademicProfile, updateMyAcademicProfile };
