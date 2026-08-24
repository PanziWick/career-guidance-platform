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

    // Pick a career to test that we know has seeded skills (C001 : Software Engineer)
    const testCareer = await Career.findOne({ careerId: 'C001' });
    if (!testCareer || !testCareer.requiredSkills || testCareer.requiredSkills.length === 0) {
      throw new Error('Seeded career data is missing or requiredSkills are empty. Did you run the seed script?');
    }

    // Ensure we have a recommendation for this user
    let recommendation = await Recommendation.findOne({ userId: user._id });
    if (!recommendation) {
      recommendation = new Recommendation({
        userId: user._id,
        recommendedCareers: [{ careerId: testCareer.careerId, score: 90, reason: 'Test' }]
      });
      await recommendation.save();
    } else {
      recommendation.recommendedCareers = [{ careerId: testCareer.careerId, score: 90, reason: 'Test' }];
      await recommendation.save();
    }
    const targetCareerId = testCareer.careerId;

    // --- Test 1: Cross-student access rejection (Mocking auth logic) ---
    const fakeUserId = new mongoose.Types.ObjectId();
    try {
      await skillGapService.analyzeGap(fakeUserId, recommendation._id, targetCareerId);
      assert('Cross-student access rejected', false);
    } catch (err) {
      assert('Cross-student access rejected', err.statusCode === 404);
    }

    // --- Test 2: Skill matching logic using actual production dataset ---
    // C001 requires: Programming, Database Management, Problem Solving, Critical Thinking, Teamwork (5 skills)
    // Student has: Communication, programming (1 match)
    const gapResult = await skillGapService.analyzeGap(user._id, recommendation._id, targetCareerId);
    assert('Analyzed gap successfully', gapResult.status === 'success');
    assert('Correct match count (1 matching skill)', gapResult.matchCount === 1);
    assert('Correct missing count (4 missing skills)', gapResult.missingCount === 4);
    assert('Completion percentage is 20%', gapResult.completionPercentage === 20);

    // --- Test 3: Deterministic Roadmap Generation with Resources ---
    const roadmap = await roadmapService.generateRoadmap(user._id, recommendation._id, targetCareerId);
    assert('Roadmap generated from missing skills', roadmap.skills.length === 4);
    assert('Roadmap has milestones for missing skills', roadmap.milestones.length === 4);
    assert('Roadmap target level is intermediate', roadmap.skills[0].targetLevel === 'intermediate');
    // S001 (Communication) is missing? Actually C001 (Software Engineer) needs:
    // Programming (S004), Database Management (S005), Problem Solving (S008), Critical Thinking (S002), Teamwork (S009)
    // User has 'programming', so missing: Database Management, Problem Solving, Critical Thinking, Teamwork.
    // ALL of these skills now have verified resources mapped!
    const allHaveResources = roadmap.milestones.every(m => m.resources && m.resources.length > 0 && !m.unavailableResources);
    assert('Roadmap mapped verified learning resources to ALL applicable skills', allHaveResources);

    // --- Test 4: Retrieve Roadmap ---
    const roadmaps = await roadmapService.getRoadmaps(user._id);
    assert('Roadmap retrieved successfully', roadmaps.length > 0);
    assert('Roadmap history preserved', roadmaps.some(r => r._id.toString() === roadmap._id.toString()));

    // --- Test 5: Unavailable mapping (Isolation Test for zero required skills) ---
    // Temporarily clear required skills from the DB to test the boundary condition
    const originalSkills = testCareer.requiredSkills;
    testCareer.requiredSkills = [];
    await testCareer.save();

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

    // Restore the production dataset
    testCareer.requiredSkills = originalSkills;
    await testCareer.save();

    console.log('\n--- All Skill Gap & Roadmap Tests Passed ---');
  } catch (error) {
    console.error('\nTest failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

runTests();
