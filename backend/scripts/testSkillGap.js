require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const AcademicProfile = require('../src/models/AcademicProfile');
const Recommendation = require('../src/models/Recommendation');
const Career = require('../src/models/Career');
const Skill = require('../src/models/Skill');
const LearningRoadmap = require('../src/models/LearningRoadmap');
const connectDB = require('../src/config/db');

// Mock request to mimic express controller context
const skillGapService = require('../src/services/skillGapService');
const roadmapService = require('../src/services/learningRoadmapService');

const assert = (desc, condition) => {
  if (condition) {
    console.log(`✅ ${desc}`);
  } else {
    console.error(`❌ ${desc}`);
    throw new Error(`Assertion failed: ${desc}`);
  }
};

const runTests = async () => {
  try {
    await connectDB();
    console.log('\n--- Starting Skill Gap & Roadmap Tests ---\n');

    // 1. Setup mock data
    const user = await User.findOne({ role: 'student' });
    if (!user) {
      throw new Error('No student found in DB. Run seed scripts or earlier tests first.');
    }

    // Set some skills for the user
    let profile = await AcademicProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = new AcademicProfile({
        userId: user._id,
        stream: 'Arts',
        existingSkills: [],
      });
    }
    profile.existingSkills = ['Communication', 'programming']; // case and space will test normalization
    await profile.save();

    // Ensure we have a recommendation for this user
    let recommendation = await Recommendation.findOne({ userId: user._id });
    if (!recommendation) {
      // Create a dummy recommendation if not exists
      const career = await Career.findOne();
      recommendation = new Recommendation({
        userId: user._id,
        recommendedCareers: [{ careerId: career.careerId, score: 90, reason: 'Test' }]
      });
      await recommendation.save();
    } else if (!recommendation.recommendedCareers || recommendation.recommendedCareers.length === 0) {
      const career = await Career.findOne();
      recommendation.recommendedCareers = [{ careerId: career.careerId, score: 90, reason: 'Test' }];
      await recommendation.save();
    }
    const targetCareerId = recommendation.recommendedCareers[0].careerId;
    
    // Add requiredSkills to the career for testing partial match
    const careerObj = await Career.findOne({ careerId: targetCareerId });
    const s1 = await Skill.findOne({ name: 'Communication' });
    const s2 = await Skill.findOne({ name: 'Leadership' });
    
    if (s1 && s2) {
      careerObj.requiredSkills = [s1._id, s2._id];
      await careerObj.save();
    }

    // --- Test 1: Cross-student access rejection (Mocking auth logic) ---
    // skillGapService takes userId. Passing a wrong user ID to a recommendation belonging to someone else
    const fakeUserId = new mongoose.Types.ObjectId();
    try {
      await skillGapService.analyzeGap(fakeUserId, recommendation._id, targetCareerId);
      assert('Cross-student access rejected', false);
    } catch (err) {
      assert('Cross-student access rejected', err.statusCode === 404);
    }

    // --- Test 2: Skill matching logic (Partial match) ---
    const gapResult = await skillGapService.analyzeGap(user._id, recommendation._id, targetCareerId);
    assert('Analyzed gap successfully', gapResult.status === 'success');
    assert('Correct match count', gapResult.matchCount === 1);
    assert('Correct missing count', gapResult.missingCount === 1);
    assert('Completion percentage is 50%', gapResult.completionPercentage === 50);

    // --- Test 3: Deterministic Roadmap Generation ---
    const roadmap = await roadmapService.generateRoadmap(user._id, recommendation._id, targetCareerId);
    assert('Roadmap generated from missing skills', roadmap.skills.length === 1);
    assert('Roadmap has milestones', roadmap.milestones.length === 1);
    assert('Roadmap skill is Leadership', roadmap.skills[0].name === 'Leadership');
    assert('Roadmap target level is intermediate', roadmap.skills[0].targetLevel === 'intermediate');

    // --- Test 4: Retrieve Roadmap ---
    const roadmaps = await roadmapService.getRoadmaps(user._id);
    assert('Roadmap retrieved successfully', roadmaps.length > 0);
    assert('Roadmap history preserved', roadmaps.some(r => r._id.toString() === roadmap._id.toString()));

    // --- Test 5: Unavailable mapping (Zero required skills) ---
    // clear required skills
    careerObj.requiredSkills = [];
    await careerObj.save();

    const unavailableGap = await skillGapService.analyzeGap(user._id, recommendation._id, targetCareerId);
    assert('Unavailable mapping handled', unavailableGap.status === 'unavailable');
    assert('Match count is 0', unavailableGap.matchCount === 0);
    assert('Completion percentage is 0', unavailableGap.completionPercentage === 0);

    try {
      await roadmapService.generateRoadmap(user._id, recommendation._id, targetCareerId);
      assert('Roadmap generation handles unavailable mapping', false);
    } catch (err) {
      assert('Roadmap generation handles unavailable mapping', err.statusCode === 400);
    }

    console.log('\n--- All Skill Gap & Roadmap Tests Passed ---');
  } catch (error) {
    console.error('\nTest failed:', error);
  } finally {
    try {
      // 6. Cleanup: Ensure we revert any changes to the authoritative seeded dataset
      // We modified the Career object to test partial matching, so we must remove it.
      const user = await User.findOne({ role: 'student' });
      if (user) {
        const recommendation = await Recommendation.findOne({ userId: user._id });
        if (recommendation && recommendation.recommendedCareers && recommendation.recommendedCareers.length > 0) {
          const targetCareerId = recommendation.recommendedCareers[0].careerId;
          const careerObj = await Career.findOne({ careerId: targetCareerId });
          if (careerObj) {
            careerObj.requiredSkills = [];
            await careerObj.save();
          }
        }
      }
    } catch (cleanupErr) {
      console.error('Cleanup failed:', cleanupErr);
    }
    mongoose.connection.close();
  }
};

runTests();
