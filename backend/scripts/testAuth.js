/*
  Automated API test runner for Milestone 2 endpoints.
  Run: node scripts/testAuth.js
  Requires the server to be running on PORT (default 5000).
*/

const http = require('http');

const BASE = `http://localhost:${process.env.PORT || 5000}`;
let passed = 0;
let failed = 0;
let authToken = '';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
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
  const testEmail = `testuser_${ts}@example.com`;

  console.log('\n=== MILESTONE 1 REGRESSION ===\n');

  // Health check
  let r = await request('GET', '/api/health');
  assert('GET /api/health returns 200', r.status === 200);
  assert('Health response success=true', r.body.success === true);

  // Invalid route
  r = await request('GET', '/api/nonexistent');
  assert('Invalid route returns 404', r.status === 404);
  assert('Invalid route success=false', r.body.success === false);

  console.log('\n=== REGISTRATION ===\n');

  // Missing fields
  r = await request('POST', '/api/auth/register', {});
  assert('Missing fields returns 400', r.status === 400);

  // Invalid email
  r = await request('POST', '/api/auth/register', {
    firstName: 'Test', lastName: 'User', email: 'not-an-email', password: 'pass123456'
  });
  assert('Invalid email returns 400', r.status === 400);

  // Short password
  r = await request('POST', '/api/auth/register', {
    firstName: 'Test', lastName: 'User', email: testEmail, password: '123'
  });
  assert('Short password returns 400', r.status === 400);

  // Valid registration
  r = await request('POST', '/api/auth/register', {
    firstName: 'Panzi', lastName: 'Wick', email: testEmail, password: 'securepass123'
  });
  assert('Valid registration returns 201', r.status === 201, `got ${r.status}`);
  assert('Registration returns token', !!r.body.data?.token);
  assert('Registration returns user', !!r.body.data?.user);
  assert('No password in response', !r.body.data?.user?.password);
  assert('Role defaults to student', r.body.data?.user?.role === 'student');
  authToken = r.body.data?.token || '';

  // Duplicate email
  r = await request('POST', '/api/auth/register', {
    firstName: 'Panzi', lastName: 'Wick', email: testEmail, password: 'securepass123'
  });
  assert('Duplicate email returns 409', r.status === 409, `got ${r.status}`);

  // Attempt to register as admin
  r = await request('POST', '/api/auth/register', {
    firstName: 'Hacker', lastName: 'Admin', email: `admin_${ts}@example.com`,
    password: 'securepass123', role: 'admin'
  });
  assert('Cannot register as admin', r.body.data?.user?.role === 'student');

  console.log('\n=== LOGIN ===\n');

  // Clear token for login tests
  authToken = '';

  // Missing fields
  r = await request('POST', '/api/auth/login', {});
  assert('Missing login fields returns 400', r.status === 400);

  // Wrong password
  r = await request('POST', '/api/auth/login', {
    email: testEmail, password: 'wrongpassword'
  });
  assert('Wrong password returns 401', r.status === 401, `got ${r.status}`);
  assert('Generic error message', r.body.message === 'Invalid email or password');

  // Non-existent account
  r = await request('POST', '/api/auth/login', {
    email: 'nobody@example.com', password: 'anything'
  });
  assert('Non-existent account returns 401', r.status === 401, `got ${r.status}`);
  assert('Same generic message for non-existent', r.body.message === 'Invalid email or password');

  // Valid login
  r = await request('POST', '/api/auth/login', {
    email: testEmail, password: 'securepass123'
  });
  assert('Valid login returns 200', r.status === 200, `got ${r.status}`);
  assert('Login returns token', !!r.body.data?.token);
  assert('No password in login response', !r.body.data?.user?.password);
  authToken = r.body.data?.token || '';

  console.log('\n=== JWT MIDDLEWARE ===\n');

  // Valid token (student profile as proxy)
  r = await request('GET', '/api/students/me');
  assert('Valid JWT passes middleware', r.status === 200);

  // Missing token
  const saved = authToken;
  authToken = '';
  r = await request('GET', '/api/students/me');
  assert('Missing JWT returns 401', r.status === 401);

  // Malformed token
  authToken = 'not.a.valid.jwt';
  r = await request('GET', '/api/students/me');
  assert('Malformed JWT returns 401', r.status === 401);

  authToken = saved;

  console.log('\n=== STUDENT PROFILE ===\n');

  // GET profile
  r = await request('GET', '/api/students/me');
  assert('GET /students/me returns 200', r.status === 200);
  assert('Profile has firstName', r.body.data?.user?.firstName === 'Panzi');

  // PUT profile (valid update)
  r = await request('PUT', '/api/students/me', { firstName: 'Kamal' });
  assert('PUT /students/me returns 200', r.status === 200, `got ${r.status}`);
  assert('firstName updated', r.body.data?.user?.firstName === 'Kamal');

  // Attempt to change role
  r = await request('PUT', '/api/students/me', { role: 'admin' });
  assert('Role change rejected (400 or role unchanged)',
    r.status === 400 || r.body.data?.user?.role === 'student',
    `status=${r.status} role=${r.body.data?.user?.role}`);

  // Attempt to change password via profile
  r = await request('PUT', '/api/students/me', { password: 'hacked123' });
  assert('Password change via profile rejected', r.status === 400);

  // Unauthenticated GET
  authToken = '';
  r = await request('GET', '/api/students/me');
  assert('Unauthenticated GET returns 401', r.status === 401);

  // Unauthenticated PUT
  r = await request('PUT', '/api/students/me', { firstName: 'Hacker' });
  assert('Unauthenticated PUT returns 401', r.status === 401);

  authToken = saved;

  console.log('\n=== ACADEMIC PROFILE ===\n');

  // GET academic profile (auto-creates)
  r = await request('GET', '/api/academic-profile/me');
  assert('GET /academic-profile/me returns 200', r.status === 200, `got ${r.status}`);
  assert('Profile has stream=Arts', r.body.data?.profile?.stream === 'Arts');

  // PUT academic profile
  r = await request('PUT', '/api/academic-profile/me', {
    interests: ['History', 'Political Science'],
    careerPreferences: ['Teacher', 'Journalist'],
    existingSkills: ['Research', 'Writing'],
  });
  assert('PUT /academic-profile/me returns 200', r.status === 200, `got ${r.status}`);
  assert('Interests updated', r.body.data?.profile?.interests?.length === 2);
  assert('CareerPreferences updated', r.body.data?.profile?.careerPreferences?.length === 2);
  assert('ExistingSkills updated', r.body.data?.profile?.existingSkills?.length === 2);

  // Invalid update (no valid fields)
  r = await request('PUT', '/api/academic-profile/me', { role: 'admin' });
  assert('Invalid academic update returns 400', r.status === 400);

  // Unauthenticated
  authToken = '';
  r = await request('GET', '/api/academic-profile/me');
  assert('Unauthenticated academic GET returns 401', r.status === 401);

  authToken = saved;

  // Clean up the test user
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-guidance');
  await mongoose.connection.db.collection('users').deleteMany({
    email: { $in: [testEmail, `admin_${ts}@example.com`] }
  });
  await mongoose.connection.db.collection('academicprofiles').deleteMany({});
  await mongoose.disconnect();

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
