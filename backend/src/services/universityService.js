const University = require('../models/University');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const getAll = async (filter = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (filter.type) {
    query.type = filter.type;
  }

  const [data, total] = await Promise.all([
    University.find(query).skip(skip).limit(limit).sort({ name: 1 }),
    University.countDocuments(query),
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
    throw new AppError('Invalid University ID format', 400);
  }

  const university = await University.findById(id);
  
  if (!university) {
    throw new AppError('University not found', 404);
  }

  return university;
};

module.exports = {
  getAll,
  getById,
};
