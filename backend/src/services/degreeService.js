const DegreeProgramme = require('../models/DegreeProgramme');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const getAll = async (filter = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (filter.universityId) {
    query.universityId = filter.universityId;
  }
  
  if (filter.institutionType) {
    query.type = filter.institutionType;
  }

  const [data, total] = await Promise.all([
    DegreeProgramme.find(query).skip(skip).limit(limit).sort({ name: 1 }),
    DegreeProgramme.countDocuments(query),
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
    throw new AppError('Invalid Degree ID format', 400);
  }

  const degree = await DegreeProgramme.findById(id);
  
  if (!degree) {
    throw new AppError('Degree Programme not found', 404);
  }

  return degree;
};

module.exports = {
  getAll,
  getById,
};
