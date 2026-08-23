const Skill = require('../models/Skill');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const getAll = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Skill.find({}).skip(skip).limit(limit).sort({ name: 1 }),
    Skill.countDocuments({}),
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
    throw new AppError('Invalid Skill ID format', 400);
  }

  const skill = await Skill.findById(id);
  
  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  return skill;
};

module.exports = {
  getAll,
  getById,
};
