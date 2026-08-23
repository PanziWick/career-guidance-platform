require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const AcademicProfile = require('../src/models/AcademicProfile');
const Recommendation = require('../src/models/Recommendation');
const SubjectCombination = require('../src/models/SubjectCombination');
const RecommendationRule = require('../src/models/RecommendationRule');
const connectDB = require('../src/config/db');

// Utility to assert and log
const assert = (message, condition, details = '') => {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
  } else {
    console.error(`❌ [FAIL] ${message}`);
    if (details) console.error(`   Details: ${details}`);
    process.exitCode = 1;
  }
};

const BASE_URL = 'http://localhost:5000/api';

let authToken = '';
let testUserId = null;

const runTests = async () => {
  console.log('--- Starting Recommendation Engine Tests ---\n');

  try {
    await connectDB();
    
    // Clear out test data from previous runs if any
    const testUserEmail = 'recommendtest@example.com';
    const existingUser = await User.findOne({ email: testUserEmail });
    if (existingUser) {
      await AcademicProfile.deleteMany({ userId: existingUser._id });
      await Recommendation.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // 1. Setup - Create Test User & Get Token
    const resReg = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Recommend',
        lastName: 'Test',
        email: testUserEmail,
        password: 'Password123!',
      })
    });
    const regData = await resReg.json();
    
    authToken = regData.data ? regData.data.token : null;
    testUserId = regData.data && regData.data.user ? regData.data.user._id : null;

    assert('Registration successful for test user', resReg.status === 201, JSON.stringify(regData));

    // 2. Reject unauthenticated request
    const resUnauth = await fetch(`${BASE_URL}/recommendations`, { method: 'POST' });
    const unauthData = await resUnauth.json();
    assert('Unauthenticated request rejected', resUnauth.status === 401, unauthData.message);

    // 3. Reject missing/incomplete academic profile
    const resNoProfile = await fetch(`${BASE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const noProfileData = await resNoProfile.json();
    assert('Missing academic profile rejected', resNoProfile.status === 404, JSON.stringify(noProfileData));

    // Create incomplete profile
    await fetch(`${BASE_URL}/academic-profile/me`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` 
      },
      body: JSON.stringify({
        stream: 'Arts',
        olResults: [{ subject: 'Maths', grade: 'A' }] // Incomplete
      })
    });

    const resIncomplete = await fetch(`${BASE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const incompleteData = await resIncomplete.json();
    assert('Incomplete profile rejected', resIncomplete.status === 400, JSON.stringify(incompleteData));

    // 4. Create complete academic profile
    const SubjectCombination = mongoose.model('SubjectCombination');
    const combo = await SubjectCombination.findOne({});
    const comboId = combo ? combo._id.toString() : new mongoose.Types.ObjectId().toString();

    const completeProfileData = {
      stream: 'Arts',
      olResults: [
        { subject: 'Maths', grade: 'B' },
        { subject: 'Science', grade: 'A' },
        { subject: 'English', grade: 'A' }
      ],
      alResults: [
        { subject: combo ? combo.subject1 : 'Economics', grade: 'B' },
        { subject: combo ? combo.subject2 : 'Geography', grade: 'C' },
        { subject: combo ? combo.subject3 : 'ICT', grade: 'B' }
      ],
      subjectCombinationId: comboId,
      interests: ['Business', 'Technology', 'Law'],
      careerPreferences: ['Data Analyst', 'Software Engineer'],
      existingSkills: ['Communication']
    };

    const resUpdate = await fetch(`${BASE_URL}/academic-profile/me`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` 
      },
      body: JSON.stringify(completeProfileData)
    });
    const updateData = await resUpdate.json();
    assert('Complete profile saved', resUpdate.status === 200, JSON.stringify(updateData));

    // 5. Generate Recommendations
    const resGenerate = await fetch(`${BASE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const generateData = await resGenerate.json();
    
    assert('Authenticated recommendation request accepted', resGenerate.status === 200, JSON.stringify(generateData));
    const results = generateData.data ? generateData.data.results : [];
    assert('Recommendations returned a list', Array.isArray(results), `Type: ${typeof results}`);
    
    if (results.length > 0) {
      // 6. Test sorting and structure
      const firstScore = results[0].score;
      const secondScore = results.length > 1 ? results[1].score : -1;
      assert('Results are sorted deterministically descending by score', firstScore >= secondScore, `Scores: ${firstScore}, ${secondScore}`);
      
      const firstResult = results[0];
      assert('Result contains required fields (degree, score, reason, type, university)', 
        !!firstResult.name && !!firstResult.score && !!firstResult.reason && !!firstResult.type && !!firstResult.university,
        JSON.stringify(firstResult)
      );
    } else {
      console.log('⚠️ [WARN] No eligible programmes found. Ensure dataset contains degrees mapping to these subjects/interests.');
    }

    // 6a. Repeatability test
    const resGenerate2 = await fetch(`${BASE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const generateData2 = await resGenerate2.json();
    const results2 = generateData2.data ? generateData2.data.results : [];
    
    // Check if the results arrays are exactly the same (ignoring order if we want, but since it's deterministic, order should match)
    // Actually we just stringify the mapped results to ignore any mongoose IDs changing if they regenerate, though here the results array itself is returned.
    const extractComparable = (resList) => resList.map(r => ({ name: r.name, score: r.score, reason: r.reason }));
    assert('Repeatability: Second run yields identical scores, ordering, and explanations', 
      JSON.stringify(extractComparable(results)) === JSON.stringify(extractComparable(results2)), 
      'Results differed between consecutive runs');

    // 6b. Unsupported Rule Test
    // We temporarily add a fake rule to the DB that recommends an invented degree
    const RecommendationRule = mongoose.model('RecommendationRule');
    const fakeRule = await RecommendationRule.create({
      ruleId: 'TEST999',
      stream: 'Arts',
      subjects: 'Any Arts Subjects',
      interest: 'Invented Interest',
      recommend: 'Invented Degree Name That Is Not Mapped',
      isActive: true
    });
    
    // Update profile to match the fake rule's interest
    await fetch(`${BASE_URL}/academic-profile/me`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` 
      },
      body: JSON.stringify({
        ...completeProfileData,
        interests: [...completeProfileData.interests, 'Invented Interest']
      })
    });
    
    const resGenerate3 = await fetch(`${BASE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const generateData3 = await resGenerate3.json();
    const results3 = generateData3.data ? generateData3.data.results : [];
    
    const hasInventedDegree = results3.some(r => r.name === 'Invented Degree Name That Is Not Mapped');
    assert('A degree cannot receive a recommendation solely from invented or unsupported rule mappings', !hasInventedDegree, 'Invented degree found in recommendations');
    
    // Clean up fake rule
    await RecommendationRule.deleteOne({ ruleId: 'TEST999' });

    // 7. Verify Persistence
    const historyRes = await fetch(`${BASE_URL}/recommendations`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const historyData = await historyRes.json();
    
    assert('Recommendation history retrieved successfully', historyRes.status === 200, JSON.stringify(historyData));
    assert('History contains at least one record', historyData.data && historyData.data.length >= 1, `Length: ${historyData.data ? historyData.data.length : 0}`);

    // Verify Isolation
    const secondUserRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Second',
        lastName: 'User',
        email: 'seconduser@example.com',
        password: 'Password123!',
      })
    });
    const secondUserData = await secondUserRes.json();
    const secondToken = secondUserData.data ? secondUserData.data.token : null;
    
    const secondHistoryRes = await fetch(`${BASE_URL}/recommendations`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${secondToken}` }
    });
    const secondHistoryData = await secondHistoryRes.json();
    
    assert('History isolated per student (second user has 0)', secondHistoryData.data && secondHistoryData.data.length === 0, `Second user history length: ${secondHistoryData.data ? secondHistoryData.data.length : 'undefined'}`);

    // Clean up second user
    await User.deleteOne({ email: 'seconduser@example.com' });

    console.log('\n--- Recommendation Engine Tests Completed ---\n');
  } catch (error) {
    console.error('Test Execution Error:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

runTests();
