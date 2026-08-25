/*
  Automated API test runner for Milestone 8 (Administrator Module).
  Run: node scripts/testAdmin.js
  Requires the server to be running on PORT (default 5000).
*/

require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const University = require('../src/models/University');
const DegreeProgramme = require('../src/models/DegreeProgramme');
const Career = require('../src/models/Career');
const Skill = require('../src/models/Skill');
const CareerMapping = require('../src/models/CareerMapping');

const BASE = `http://localhost:${process.env.PORT || 5000}`;
let passed = 0;
let failed = 0;

let adminToken = '';
let studentToken = '';

function request(method, path, body, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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
    if (body) req.write(JSON.stringify(body));
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
  const ts = Date.now();
  const adminEmail = `admin_${ts}@example.com`;
  const studentEmail = `student_${ts}@example.com`;

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-guidance');

  // Create admin user directly in DB
  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: adminEmail,
    password: 'password123',
    role: 'admin'
  });

  // Create student via API to get token
  let r = await request('POST', '/api/auth/register', {
    firstName: 'Student', lastName: 'User', email: studentEmail, password: 'password123'
  });
  studentToken = r.body.data.token;

  // Login as admin
  r = await request('POST', '/api/auth/login', {
    email: adminEmail, password: 'password123'
  });
  adminToken = r.body.data.token;

  console.log('\n=== AUTHORIZATION ===\n');

  r = await request('GET', '/api/admin/dashboard-stats', null, null);
  assert('Unauthenticated request rejected (401)', r.status === 401);

  r = await request('GET', '/api/admin/dashboard-stats', null, studentToken);
  assert('Student request rejected (403)', r.status === 403);

  r = await request('GET', '/api/admin/dashboard-stats', null, adminToken);
  assert('Admin request accepted (200)', r.status === 200);


  console.log('\n=== UNIVERSITIES & SAFE DELETE ===\n');

  const uniData = {
    universityId: `UNI_TEST_${ts}`,
    name: 'Test University',
    type: 'State',
    location: 'Test City'
  };

  r = await request('POST', '/api/admin/universities', uniData, adminToken);
  assert('Create university (201)', r.status === 201);
  const uniId = r.body.data._id;

  r = await request('POST', '/api/admin/universities', uniData, adminToken);
  assert('Duplicate university ID rejected (400)', r.status === 400);

  // Update
  r = await request('PUT', `/api/admin/universities/${uniId}`, { location: 'New City' }, adminToken);
  assert('Update university (200)', r.status === 200 && r.body.data.location === 'New City');

  // Test Safe Delete (Create a degree referencing this uni)
  const degData = {
    degreeId: `DEG_TEST_${ts}`,
    name: 'Test Degree',
    universityId: uniData.universityId,
    type: 'State'
  };
  r = await request('POST', '/api/admin/degrees', degData, adminToken);
  assert('Create degree for safe delete test', r.status === 201);
  const degId = r.body.data._id;

  r = await request('DELETE', `/api/admin/universities/${uniId}`, null, adminToken);
  assert('Delete university with referenced degree rejected (400)', r.status === 400);

  console.log('\n=== DEGREES & CAREERS (CRUD & RELATIONS) ===\n');

  const carData = {
    careerId: `CAR_TEST_${ts}`,
    name: 'Test Career'
  };
  r = await request('POST', '/api/admin/careers', carData, adminToken);
  assert('Create career', r.status === 201);
  const carId = r.body.data._id;

  // Career Mapping
  const mapData = {
    degreeId: degData.degreeId,
    careerId: carData.careerId
  };
  r = await request('POST', '/api/admin/career-mappings', mapData, adminToken);
  assert('Create career mapping', r.status === 201);
  const mapId = r.body.data._id;

  r = await request('POST', '/api/admin/career-mappings', mapData, adminToken);
  assert('Duplicate career mapping rejected (400)', r.status === 400);

  r = await request('DELETE', `/api/admin/degrees/${degId}`, null, adminToken);
  assert('Delete degree with mapping rejected (400)', r.status === 400);

  r = await request('DELETE', `/api/admin/careers/${carId}`, null, adminToken);
  assert('Delete career with mapping rejected (400)', r.status === 400);

  // Clean up mapping so we can delete degree/career
  r = await request('DELETE', `/api/admin/career-mappings/${mapId}`, null, adminToken);
  assert('Delete career mapping (204)', r.status === 204);

  // Now delete degree and career
  r = await request('DELETE', `/api/admin/degrees/${degId}`, null, adminToken);
  assert('Delete degree success (204)', r.status === 204);
  
  r = await request('DELETE', `/api/admin/careers/${carId}`, null, adminToken);
  assert('Delete career success (204)', r.status === 204);

  r = await request('DELETE', `/api/admin/universities/${uniId}`, null, adminToken);
  assert('Delete university success (204)', r.status === 204);

  console.log('\n=== CLEANUP ===\n');
  await User.deleteOne({ email: adminEmail });
  await User.deleteOne({ email: studentEmail });
  // Make sure to clean up any stragglers if a test failed
  await University.deleteOne({ universityId: uniData.universityId });
  await DegreeProgramme.deleteOne({ degreeId: degData.degreeId });
  await Career.deleteOne({ careerId: carData.careerId });
  await CareerMapping.deleteOne({ degreeId: degData.degreeId, careerId: carData.careerId });

  await mongoose.disconnect();

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
