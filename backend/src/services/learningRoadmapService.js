const LearningRoadmap = require('../models/LearningRoadmap');
const LearningResource = require('../models/LearningResource');
const Skill = require('../models/Skill');
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

  // Fetch resources for the missing skills
  const missingSkillIds = gapResult.missingSkills.map(s => s.skillId); // These are string IDs like S004
  const skillsInDb = await Skill.find({ skillId: { $in: missingSkillIds } });
  const internalSkillIds = skillsInDb.map(s => s._id);

  const learningResources = await LearningResource.find({ skillId: { $in: internalSkillIds } });

  // Map resources by string skillId for easy lookup
  const resourcesMap = {};
  for (const skill of skillsInDb) {
    resourcesMap[skill.skillId] = learningResources.filter(
      r => r.skillId.toString() === skill._id.toString()
    ).map(r => ({
      title: r.title,
      url: r.url,
      provider: r.provider,
      type: r.type,
      level: r.level,
      access: r.access,
      duration: r.duration
    }));
  }

  const milestones = gapResult.missingSkills.map((skill, index) => {
    const resources = resourcesMap[skill.skillId] || [];
    
    return {
      title: `Develop Skill: ${skill.name}`,
      description: resources.length > 0
        ? `Acquire proficiency in ${skill.name}. Use the recommended verified learning resources.`
        : `Acquire proficiency in ${skill.name}. Specific learning resource mapping is unavailable in the current dataset.`,
      order: index + 1,
      isCompleted: false,
      unavailableResources: resources.length === 0,
      resources
    };
  });

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
