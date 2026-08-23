const Career = require('../models/Career');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const getAll = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Career.find({}).skip(skip).limit(limit).sort({ name: 1 }),
    Career.countDocuments({}),
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
    throw new AppError('Invalid Career ID format', 400);
  }

  const career = await Career.findById(id);
  
  if (!career) {
    throw new AppError('Career not found', 404);
  }

  return career;
};

module.exports = {
  getAll,
  getById,
};
