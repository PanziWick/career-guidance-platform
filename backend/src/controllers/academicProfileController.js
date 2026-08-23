const AcademicProfile = require('../models/AcademicProfile');
const AppError = require('../utils/AppError');
const {
  validateStream,
  validateOlResults,
  validateAlResults,
  validateSubjectCombination,
  validateInterests,
  validateSkills,
  validateCareerPreferences,
} = require('../services/academicProfileValidator');

const ALLOWED_UPDATE_FIELDS = [
  'stream',
  'olResults',
  'alResults',
  'subjectCombinationId',
  'interests',
  'careerPreferences',
  'existingSkills',
];

const PROTECTED_FIELDS = ['userId', '_id', 'role', 'password', 'createdAt', 'updatedAt', '__v'];

const getMyAcademicProfile = async (req, res, next) => {
  try {
    let profile = await AcademicProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await AcademicProfile.create({
        userId: req.user._id,
        stream: 'Arts',
      });
    }

    const completeness = profile.getProfileCompleteness();

    res.status(200).json({
      success: true,
      data: { profile, completeness },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyAcademicProfile = async (req, res, next) => {
  try {
    // Reject protected fields
    for (const field of PROTECTED_FIELDS) {
      if (req.body[field] !== undefined) {
        return next(new AppError(`Field '${field}' cannot be modified`, 400));
      }
    }

    // Collect only whitelisted fields
    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(new AppError('No valid fields provided for update', 400));
    }

    // Aggregate validation errors
    const errors = [];

    if (updates.stream !== undefined) {
      const r = validateStream(updates.stream);
      if (!r.valid) errors.push(...r.errors);
    }

    if (updates.olResults !== undefined) {
      const r = validateOlResults(updates.olResults);
      if (!r.valid) errors.push(...r.errors);
    }

    if (updates.alResults !== undefined) {
      const r = validateAlResults(updates.alResults);
      if (!r.valid) errors.push(...r.errors);
    }

    if (updates.interests !== undefined) {
      const r = validateInterests(updates.interests);
      if (!r.valid) errors.push(...r.errors);
    }

    if (updates.existingSkills !== undefined) {
      const r = validateSkills(updates.existingSkills);
      if (!r.valid) errors.push(...r.errors);
    }

    if (updates.careerPreferences !== undefined) {
      const r = validateCareerPreferences(updates.careerPreferences);
      if (!r.valid) errors.push(...r.errors);
    }

    // Subject combination validation — requires async DB lookup
    if (updates.subjectCombinationId !== undefined) {
      const alSubjects =
        Array.isArray(updates.alResults)
          ? updates.alResults.map((e) => e.subject)
          : undefined;
      const r = await validateSubjectCombination(updates.subjectCombinationId, alSubjects);
      if (!r.valid) errors.push(...r.errors);
    }

    // When A/L results are submitted without a combination, check if one is already on the profile
    if (
      Array.isArray(updates.alResults) &&
      updates.alResults.length > 0 &&
      !updates.subjectCombinationId
    ) {
      const existing = await AcademicProfile.findOne({ userId: req.user._id });
      if (existing && existing.subjectCombinationId) {
        const alSubjects = updates.alResults.map((e) => e.subject);
        const r = await validateSubjectCombination(existing.subjectCombinationId, alSubjects);
        if (!r.valid) errors.push(...r.errors);
      }
    }

    if (errors.length > 0) {
      return next(new AppError(errors.join('; '), 400));
    }

    // Normalise grade values to uppercase
    if (updates.olResults) {
      updates.olResults = updates.olResults.map((e) => ({
        subject: e.subject.trim(),
        grade: e.grade.trim().toUpperCase(),
      }));
    }
    if (updates.alResults) {
      updates.alResults = updates.alResults.map((e) => ({
        subject: e.subject.trim(),
        grade: e.grade.trim().toUpperCase(),
      }));
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

    const completeness = profile.getProfileCompleteness();

    res.status(200).json({
      success: true,
      message: 'Academic profile updated',
      data: { profile, completeness },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyAcademicProfile, updateMyAcademicProfile };
