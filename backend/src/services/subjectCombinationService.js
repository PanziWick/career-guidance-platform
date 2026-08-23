const SubjectCombination = require('../models/SubjectCombination');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const getAll = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    SubjectCombination.find({}).skip(skip).limit(limit).sort({ combinationId: 1 }),
    SubjectCombination.countDocuments({}),
  ]);

  return {
    data,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

const getById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid Subject Combination ID format', 400);
  }

  const combination = await SubjectCombination.findById(id);
  
  if (!combination) {
    throw new AppError('Subject Combination not found', 404);
  }

  return combination;
};

module.exports = {
  getAll,
  getById,
};
