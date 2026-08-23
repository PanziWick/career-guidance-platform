const LearningRoadmap = require('../models/LearningRoadmap');
const skillGapService = require('./skillGapService');

/**
 * Generate a learning roadmap deterministically based on skill gap analysis results.
 * Only uses skills where the gap is missing. Since learning resources (courses, etc.) 
 * are not mapped in the current dataset, it will mark learning resources as unavailable.
 */
const generateRoadmap = async (userId, recommendationId, targetCareerId) => {
  // 1. Perform skill gap analysis
  const gapResult = await skillGapService.analyzeGap(userId, recommendationId, targetCareerId);

  // 2. Handle cases where mapping is unavailable or there are no missing skills
  if (gapResult.status === 'unavailable') {
    const error = new Error('Cannot generate roadmap because skill mapping is unavailable for the target career.');
    error.statusCode = 400;
    throw error;
  }

  if (gapResult.missingSkills.length === 0) {
    const error = new Error('You already possess all required skills for this career.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Construct the roadmap structure deterministically
  const skillsToDevelop = gapResult.missingSkills.map(skill => ({
    skillId: skill.skillId,
    name: skill.name,
    currentLevel: 'none',
    targetLevel: 'intermediate',
  }));

  const milestones = gapResult.missingSkills.map((skill, index) => ({
    title: `Develop Skill: ${skill.name}`,
    description: `Acquire proficiency in ${skill.name}. Specific learning resource mapping is unavailable in the current dataset.`,
    order: index + 1,
    isCompleted: false,
  }));

  // 4. Save to the database
  const newRoadmap = new LearningRoadmap({
    userId,
    targetCareer: gapResult.targetCareer,
    skills: skillsToDevelop,
    milestones,
  });

  await newRoadmap.save();

  return newRoadmap;
};

/**
 * Retrieve learning roadmaps for a user
 */
const getRoadmaps = async (userId) => {
  const roadmaps = await LearningRoadmap.find({ userId }).sort({ generatedAt: -1 });
  return roadmaps;
};

module.exports = {
  generateRoadmap,
  getRoadmaps,
};
