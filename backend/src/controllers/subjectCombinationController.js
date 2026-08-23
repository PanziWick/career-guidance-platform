const subjectCombinationService = require('../services/subjectCombinationService');

const listCombinations = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    
    const result = await subjectCombinationService.getAll(page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getCombination = async (req, res, next) => {
  try {
    const combination = await subjectCombinationService.getById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: { combination },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCombinations,
  getCombination,
};
