const careerService = require('../services/careerService');

const listCareers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    
    const result = await careerService.getAll(page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getCareer = async (req, res, next) => {
  try {
    const career = await careerService.getById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: { career },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCareers,
  getCareer,
};
