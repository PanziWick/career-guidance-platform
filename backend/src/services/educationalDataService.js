const CareerMapping = require('../models/CareerMapping');
const RecommendationRule = require('../models/RecommendationRule');

/**
 * Retrieves career mappings for a specific degree using its string ID.
 * @param {string} degreeId - The string ID of the degree (e.g., 'UOC-001')
 */
const getCareerMappingsByDegree = async (degreeId) => {
  return await CareerMapping.find({ degreeId }).sort({ careerId: 1 });
};

/**
 * Retrieves career mappings for a specific career using its string ID.
 * @param {string} careerId - The string ID of the career (e.g., 'C-001')
 */
const getCareerMappingsByCareer = async (careerId) => {
  return await CareerMapping.find({ careerId }).sort({ degreeId: 1 });
};

/**
 * Retrieves all recommendation rules for internal engine processing.
 */
const getActiveRecommendationRules = async () => {
  return await RecommendationRule.find({}).sort({ ruleId: 1 });
};

/**
 * Retrieves recommendation rules filtered by subjects and interest.
 * The Recommendation engine will use this for personalized suggestions.
 * @param {string} subjects - A/L subjects area
 * @param {string} interest - Student's area of interest
 */
const getRecommendationRulesBySubjectsAndInterest = async (subjects, interest) => {
  const query = {};
  
  if (subjects) {
    query.subjects = new RegExp(subjects, 'i');
  }
  
  if (interest) {
    query.interest = new RegExp(interest, 'i');
  }

  return await RecommendationRule.find(query).sort({ ruleId: 1 });
};

module.exports = {
  getCareerMappingsByDegree,
  getCareerMappingsByCareer,
  getActiveRecommendationRules,
  getRecommendationRulesBySubjectsAndInterest,
};
