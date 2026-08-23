const skillService = require('../services/skillService');

const skillGapService = require('../services/skillGapService');

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

const analyzeGap = async (req, res, next) => {
  try {
    const { recommendationId, targetCareerId } = req.body;
    
    if (!recommendationId) {
      const error = new Error('Recommendation ID is required');
      error.statusCode = 400;
      throw error;
    }

    const gapAnalysis = await skillGapService.analyzeGap(req.user._id, recommendationId, targetCareerId);
    
    res.status(200).json({
      success: true,
      data: { gapAnalysis },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSkills,
  getSkill,
  analyzeGap,
};
