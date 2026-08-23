const degreeService = require('../services/degreeService');

const listDegrees = async (req, res, next) => {
  try {
    const { universityId, institutionType, page, limit } = req.query;
    
    const filter = {};
    if (universityId) {
      filter.universityId = universityId;
    }
    
    if (institutionType === 'State' || institutionType === 'Private') {
      filter.institutionType = institutionType;
    }

    const result = await degreeService.getAll(filter, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getDegree = async (req, res, next) => {
  try {
    const degree = await degreeService.getById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: { degree },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDegrees,
  getDegree,
};
