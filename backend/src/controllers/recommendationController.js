const recommendationService = require('../services/recommendationService');

/**
 * Generate recommendations for the authenticated user.
 */
const generate = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await recommendationService.generateRecommendations(userId);
    
    // Check if eligible programmes were found
    if (result.results.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No eligible programmes found based on your current academic profile.',
        data: result
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recommendations generated successfully',
      data: result
    });
  } catch (error) {
    if (error.status === 400 || error.status === 404) {
      return res.status(error.status).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }
    
    console.error('Error generating recommendations:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    });
  }
};

/**
 * Retrieve the authenticated user's recommendation history.
 */
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await recommendationService.getHistory(userId);
    
    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error retrieving recommendation history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve recommendation history'
    });
  }
};

module.exports = {
  generate,
  getHistory
};
