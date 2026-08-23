const AcademicProfile = require('../models/AcademicProfile');
const Recommendation = require('../models/Recommendation');
const Career = require('../models/Career');

/**
 * Normalizes a skill string for comparison (trim, lowercase)
 */
const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  return skill.trim().toLowerCase();
};

/**
 * Perform skill gap analysis based on user's existing skills and required skills of a target career
 */
const analyzeGap = async (userId, recommendationId, targetCareerId) => {
  // 1. Validate Recommendation
  const recommendation = await Recommendation.findOne({ _id: recommendationId, userId });
  if (!recommendation) {
    const error = new Error('Recommendation not found or does not belong to user');
    error.statusCode = 404;
    throw error;
  }

  // Find target career in recommendation
  let careerObj = null;
  if (targetCareerId) {
    careerObj = recommendation.recommendedCareers.find(c => c.careerId === targetCareerId);
  } else if (recommendation.recommendedCareers && recommendation.recommendedCareers.length > 0) {
    careerObj = recommendation.recommendedCareers[0]; // fallback to first
  }

  if (!careerObj) {
    const error = new Error('Target career not found in the specified recommendation');
    error.statusCode = 404;
    throw error;
  }

  const careerId = careerObj.careerId;

  // 2. Obtain target career and required skills
  // Note: currently the DB might not have 'requiredSkills' populated. 
  // We handle it gracefully as an unavailable mapping.
  const career = await Career.findOne({ careerId });
  if (!career) {
    const error = new Error('Career mapping not found');
    error.statusCode = 404;
    throw error;
  }

  // Populate requiredSkills manually if it's an array of objects/strings
  // Assuming it's populated or we can query Skill model if needed. 
  // We added ref: 'Skill' so we should populate it.
  await career.populate('requiredSkills');

  // 3. Check for mapping availability
  if (!career.requiredSkills || career.requiredSkills.length === 0) {
    return {
      status: 'unavailable',
      message: 'Skill mapping unavailable for this career.',
      targetCareer: {
        careerId: career.careerId,
        name: career.name,
      },
      requiredSkills: [],
      studentSkills: [],
      matchedSkills: [],
      missingSkills: [],
      matchCount: 0,
      missingCount: 0,
      completionPercentage: 0,
    };
  }

  // 4. Obtain student's current skills
  const profile = await AcademicProfile.findOne({ userId });
  if (!profile) {
    const error = new Error('Academic profile not found');
    error.statusCode = 404;
    throw error;
  }
  const studentSkillsRaw = profile.existingSkills || [];

  // 5. Normalise both sets
  const studentSkillsNormalized = new Set(studentSkillsRaw.map(normalizeSkill).filter(Boolean));

  // 6. Identify matched and missing
  const matchedSkills = [];
  const missingSkills = [];

  career.requiredSkills.forEach(s => {
    // If it's populated it should be an object with name. 
    // If somehow it's just a string, we handle it as well.
    const name = s.name || s;
    const sId = s.skillId || s;
    const norm = normalizeSkill(name);
    
    if (studentSkillsNormalized.has(norm)) {
      matchedSkills.push({ skillId: sId, name });
    } else {
      missingSkills.push({ skillId: sId, name });
    }
  });

  // Calculate percentage
  const totalRequired = career.requiredSkills.length;
  const matchCount = matchedSkills.length;
  const missingCount = missingSkills.length;
  const completionPercentage = totalRequired > 0 ? Math.round((matchCount / totalRequired) * 100) : 0;

  return {
    status: 'success',
    targetCareer: {
      careerId: career.careerId,
      name: career.name,
    },
    requiredSkills: career.requiredSkills.map(s => ({ skillId: s.skillId || s, name: s.name || s })),
    studentSkills: studentSkillsRaw, // return raw student skills for reference
    matchedSkills,
    missingSkills,
    matchCount,
    missingCount,
    completionPercentage,
    explanation: `You have matched ${matchCount} out of ${totalRequired} required skills (${completionPercentage}%). ${missingCount > 0 ? 'Review your missing skills to improve your readiness.' : 'You have all the required skills for this career!'}`,
  };
};

module.exports = {
  analyzeGap,
};
