const mongoose = require('mongoose');
const AcademicProfile = require('../models/AcademicProfile');
const Recommendation = require('../models/Recommendation');
const DegreeProgramme = require('../models/DegreeProgramme');
const RecommendationRule = require('../models/RecommendationRule');
const University = require('../models/University');
const educationalDataService = require('./educationalDataService');

const SCORE_WEIGHTS = {
  RULE_MATCH: 10,
  CAREER_PREF_MATCH: 5,
  INTEREST_CATEGORY_MATCH: 2,
};

// Deterministic mapping derived from the seeded dataset.
// Maps a RecommendationRule.recommend string to one or more DegreeProgramme.name values.
const RULE_TO_DEGREE_MAPPING = {
  '(Private) BSc Software Engineering': ['BSc Software Engineering'],
  'Information Systems': ['Information Systems'],
  'Bachelor of Laws (LLB)': ['Law', 'LLB (Hons) Law (International)'],
  'Bachelor of Arts Honours in TESL': ['Teaching English as a Second Language (TESL)', 'BA (Hons) English & TESL'],
  'Bachelor of Social Work Honours': ['Social Work'],
  'BA Honours in Mass Media (Sripalee)': ['Arts (SP) - Mass Media'],
  'BA Honours in Information Technology': ['Arts - Information Technology'],
  'Bachelor of Performing Arts - Music Honours': ['Music Honours'],
  'BA Honours in Translation Studies': ['Translation Studies'],
  'Bachelor of Arts in Islamic Studies': ['Islamic Studies'],
  'Peace and Conflict Resolution Path': ['Peace and Conflict Resolution'],
  'BA Honours in Performing Arts (Sripalee)': ['Arts (SP) - Performing Arts'],
  'Bachelor of Fine Arts (Art & Design)': ['Design'],
};

/**
 * Checks if the student meets the minimum requirement of the degree.
 */
const isEligible = (profile, degree) => {
  // We only support Arts stream for now
  if (profile.stream !== 'Arts') {
    return false;
  }

  // Count passes (grades A, B, C, S)
  const passes = profile.alResults.filter(
    (res) => res.grade && res.grade.toUpperCase() !== 'F'
  ).length;

  if (degree.type === 'Private') {
    if (degree.minimumRequirement === '3 A/L Passes') {
      return passes >= 3;
    }
    // Unsupported requirement treated conservatively
    console.warn(`Unsupported minimum requirement: ${degree.minimumRequirement} for degree ${degree.name}`);
    return false;
  }

  // State degrees have no explicit string requirements in our dataset, assuming eligible if they passed A/L minimums generally, 
  // treating as eligible if they have at least 3 passes.
  return passes >= 3;
};

/**
 * Checks if a rule applies to the student profile.
 */
const isRuleActive = (rule, profile) => {
  // Check if any of the student's A/L subjects appear in the rule's subjects text
  const subjectMatches = profile.alResults.some((res) => 
    rule.subjects.toLowerCase().includes(res.subject.toLowerCase())
  );
  
  // Check if any of the student's interests appear in the rule's interest text
  const interestMatches = profile.interests.some((interest) => 
    rule.interest.toLowerCase().includes(interest.toLowerCase())
  );

  return subjectMatches && interestMatches;
};

/**
 * Generates recommendations for a student.
 */
const generateRecommendations = async (userId) => {
  const profile = await AcademicProfile.findOne({ userId });
  if (!profile) {
    const error = new Error('Academic profile not found');
    error.status = 404;
    throw error;
  }

  const { isComplete, fields } = profile.getProfileCompleteness();
  if (!isComplete) {
    const error = new Error('Academic profile is incomplete');
    error.status = 400;
    error.details = fields;
    throw error;
  }

  const degrees = await DegreeProgramme.find({});
  const rules = await educationalDataService.getActiveRecommendationRules();
  const universities = await University.find({});
  const universityMap = {};
  universities.forEach(u => {
    universityMap[u.universityId] = u.name;
  });
  
  // Pre-fetch career mappings for all degrees
  const careerMappingsData = await mongoose.model('CareerMapping').find({});
  const careers = await mongoose.model('Career').find({});
  const careerMap = {}; // string ID -> Career Name
  careers.forEach(c => {
    careerMap[c.careerId] = c.name;
  });

  const degreeCareerMap = {}; // degreeId -> array of career names
  careerMappingsData.forEach(mapping => {
    if (!degreeCareerMap[mapping.degreeId]) {
      degreeCareerMap[mapping.degreeId] = [];
    }
    const careerName = careerMap[mapping.careerId];
    if (careerName) {
      degreeCareerMap[mapping.degreeId].push(careerName);
    }
  });

  const scoredDegrees = [];
  const appliedRuleIds = [];

  for (const degree of degrees) {
    if (!isEligible(profile, degree)) {
      continue;
    }

    let score = 0;
    const reasons = [];

    // 1. Rule Match
    for (const rule of rules) {
      const mappedDegreeNames = RULE_TO_DEGREE_MAPPING[rule.recommend];
      if (mappedDegreeNames && mappedDegreeNames.includes(degree.name)) {
        if (isRuleActive(rule, profile)) {
          score += SCORE_WEIGHTS.RULE_MATCH;
          reasons.push(`Strong alignment with academic profile and interest in ${rule.interest}`);
          if (!appliedRuleIds.includes(rule.ruleId)) {
            appliedRuleIds.push(rule.ruleId);
          }
          break; // apply highest rule match once
        }
      }
    }

    // 2. Career Preference Match
    const mappedCareers = degreeCareerMap[degree.degreeId] || [];
    const hasCareerMatch = profile.careerPreferences.some(pref => 
      mappedCareers.some(c => c.toLowerCase() === pref.toLowerCase())
    );
    
    if (hasCareerMatch) {
      score += SCORE_WEIGHTS.CAREER_PREF_MATCH;
      reasons.push('Aligns with your career preferences');
    }

    // 3. Interest Category Match
    if (degree.category) {
      const hasCategoryMatch = profile.interests.some(interest => 
        degree.category.toLowerCase().includes(interest.toLowerCase())
      );
      if (hasCategoryMatch) {
        score += SCORE_WEIGHTS.INTEREST_CATEGORY_MATCH;
        reasons.push(`Matches your interest in ${degree.category}`);
      }
    }

    // Constraints check: Do not invent skill points since we have no skill-degree mapping data.
    
    if (score > 0) {
      scoredDegrees.push({
        degreeId: degree._id, // internal ObjectId for Recommendation model
        degreeRef: degree.degreeId, // string ID
        name: degree.name,
        university: universityMap[degree.universityId] || 'Unknown University',
        type: degree.type,
        score,
        reason: reasons.join('. ') + '.'
      });
    }
  }

  // Sort descending by score, then alphabetically by name for deterministic tie-breaking
  scoredDegrees.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });

  // Limit to top 10
  const rankedResults = scoredDegrees.slice(0, 10);

  // Persist Recommendation
  const recommendation = new Recommendation({
    userId,
    recommendedDegrees: rankedResults.map(r => ({
      degreeId: r.degreeRef,
      score: r.score,
      reason: r.reason
    })),
    recommendedCareers: [], 
    appliedRules: appliedRuleIds.map(ruleId => ({ ruleId }))
  });

  await recommendation.save();

  return {
    recommendationId: recommendation._id,
    generatedAt: recommendation.generatedAt,
    results: rankedResults
  };
};

const getHistory = async (userId) => {
  const history = await Recommendation.find({ userId }).sort({ generatedAt: -1 }).lean();
  return history;
};

module.exports = {
  generateRecommendations,
  getHistory,
  SCORE_WEIGHTS,
  RULE_TO_DEGREE_MAPPING,
  isEligible
};
