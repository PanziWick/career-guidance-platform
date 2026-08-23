const roadmapService = require('../services/learningRoadmapService');

const generateRoadmap = async (req, res, next) => {
  try {
    const { recommendationId, targetCareerId } = req.body;
    
    if (!recommendationId) {
      const error = new Error('Recommendation ID is required');
      error.statusCode = 400;
      throw error;
    }

    const roadmap = await roadmapService.generateRoadmap(req.user._id, recommendationId, targetCareerId);
    
    res.status(201).json({
      success: true,
      data: { roadmap },
    });
  } catch (error) {
    next(error);
  }
};

const getRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await roadmapService.getRoadmaps(req.user._id);
    
    res.status(200).json({
      success: true,
      data: { roadmaps },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateRoadmap,
  getRoadmaps,
};
