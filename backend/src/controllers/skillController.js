const skillService = require('../services/skillService');

const listSkills = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    
    const result = await skillService.getAll(page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getSkill = async (req, res, next) => {
  try {
    const skill = await skillService.getById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSkills,
  getSkill,
};
