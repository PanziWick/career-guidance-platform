const universityService = require('../services/universityService');

const listUniversities = async (req, res, next) => {
  try {
    const { type, page, limit } = req.query;
    
    // Ensure only valid types are queried if provided
    const filter = {};
    if (type === 'State' || type === 'Private') {
      filter.type = type;
    }

    const result = await universityService.getAll(filter, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getUniversity = async (req, res, next) => {
  try {
    const university = await universityService.getById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: { university },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUniversities,
  getUniversity,
};
