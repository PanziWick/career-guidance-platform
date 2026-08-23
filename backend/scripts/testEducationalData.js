require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');

const BASE = `http://localhost:${process.env.PORT || 5000}`;
let passed = 0;
let failed = 0;

function request(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function assert(label, condition, detail) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}  -->  ${detail || ''}`);
    failed++;
  }
}

async function run() {
  console.log('\n=== M4: EDUCATIONAL DATA APIs ===\n');

  // --- Universities ---
  console.log('\n--- Universities ---');
  let r = await request('GET', '/api/universities');
  assert('GET /api/universities returns 200', r.status === 200, `got ${r.status}`);
  assert('Universities list format', r.body.success === true && Array.isArray(r.body.data), 'invalid body');
  const allUnisCount = r.body.total;
  assert('Universities count > 0', allUnisCount > 0, `total: ${allUnisCount}`);

  r = await request('GET', '/api/universities?type=State');
  assert('GET /api/universities?type=State returns 200', r.status === 200);
  assert('All returned are State', r.body.data.every(u => u.type === 'State'), 'found non-state');

  r = await request('GET', '/api/universities?type=Private');
  assert('GET /api/universities?type=Private returns 200', r.status === 200);
  assert('All returned are Private', r.body.data.every(u => u.type === 'Private'), 'found non-private');

  const uniId = r.body.data[0]._id;
  r = await request('GET', `/api/universities/${uniId}`);
  assert('GET /api/universities/:id returns 200', r.status === 200, `got ${r.status}`);
  assert('Returns single university', r.body.data.university._id === uniId, 'id mismatch');

  r = await request('GET', '/api/universities/invalid-id');
  assert('Invalid ID returns 400', r.status === 400, `got ${r.status}`);

  r = await request('GET', '/api/universities/000000000000000000000000');
  assert('Nonexistent ID returns 404', r.status === 404, `got ${r.status}`);

  // --- Degrees ---
  console.log('\n--- Degrees ---');
  r = await request('GET', '/api/degrees');
  assert('GET /api/degrees returns 200', r.status === 200);
  assert('Degrees list format', r.body.success === true && Array.isArray(r.body.data));
  const degreeUniId = r.body.data[0].universityId;

  r = await request('GET', `/api/degrees?universityId=${degreeUniId}`);
  assert('GET /api/degrees?universityId=... returns 200', r.status === 200);
  assert('All returned match universityId', r.body.data.every(d => d.universityId === degreeUniId));

  r = await request('GET', '/api/degrees?institutionType=State');
  assert('GET /api/degrees?institutionType=State returns 200', r.status === 200);
  assert('All returned are State degrees', r.body.data.every(d => d.type === 'State'));

  const degreeId = r.body.data[0]._id;
  r = await request('GET', `/api/degrees/${degreeId}`);
  assert('GET /api/degrees/:id returns 200', r.status === 200);

  // --- Careers ---
  console.log('\n--- Careers ---');
  r = await request('GET', '/api/careers');
  assert('GET /api/careers returns 200', r.status === 200);
  const careerId = r.body.data[0]._id;

  r = await request('GET', `/api/careers/${careerId}`);
  assert('GET /api/careers/:id returns 200', r.status === 200);

  // --- Skills ---
  console.log('\n--- Skills ---');
  r = await request('GET', '/api/skills');
  assert('GET /api/skills returns 200', r.status === 200);
  const skillId = r.body.data[0]._id;

  r = await request('GET', `/api/skills/${skillId}`);
  assert('GET /api/skills/:id returns 200', r.status === 200);

  // --- Subject Combinations ---
  console.log('\n--- Subject Combinations ---');
  r = await request('GET', '/api/subject-combinations');
  assert('GET /api/subject-combinations returns 200', r.status === 200);
  const comboId = r.body.data[0]._id;

  r = await request('GET', `/api/subject-combinations/${comboId}`);
  assert('GET /api/subject-combinations/:id returns 200', r.status === 200);

  // --- DB Integrity & Internal Services ---
  console.log('\n--- Database Integrity ---');
  await mongoose.connect(process.env.MONGODB_URI);
  
  const University = require('../src/models/University');
  const DegreeProgramme = require('../src/models/DegreeProgramme');
  const Career = require('../src/models/Career');
  const Skill = require('../src/models/Skill');
  const SubjectCombination = require('../src/models/SubjectCombination');
  
  const edService = require('../src/services/educationalDataService');

  const seededUnis = await University.countDocuments();
  assert('Seeded universities exist', seededUnis > 0);
  
  const seededDegrees = await DegreeProgramme.countDocuments();
  assert('Seeded degrees exist', seededDegrees > 0);

  const seededCareers = await Career.countDocuments();
  assert('Seeded careers exist', seededCareers > 0);

  const seededSkills = await Skill.countDocuments();
  assert('Seeded skills exist', seededSkills > 0);

  const seededCombos = await SubjectCombination.countDocuments();
  assert('Seeded subject combinations exist', seededCombos > 0);

  // Test internal educationalDataService
  console.log('\n--- Internal Service Validation ---');
  const firstDegreeStr = (await DegreeProgramme.findOne()).degreeId;
  const mappingsByDegree = await edService.getCareerMappingsByDegree(firstDegreeStr);
  assert('getCareerMappingsByDegree returns data', Array.isArray(mappingsByDegree));

  const firstCareerStr = (await Career.findOne()).careerId;
  const mappingsByCareer = await edService.getCareerMappingsByCareer(firstCareerStr);
  assert('getCareerMappingsByCareer returns data', Array.isArray(mappingsByCareer));

  const rules = await edService.getActiveRecommendationRules();
  assert('Recommendation rules exist', rules.length > 0);
  
  const filteredRules = await edService.getRecommendationRulesBySubjectsAndInterest('History', 'Teaching');
  assert('getRecommendationRulesBySubjectsAndInterest executes successfully', Array.isArray(filteredRules));

  await mongoose.disconnect();

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
