/*
  Automated API test runner for Milestones 1–3.
  Run: node scripts/testAuth.js
  Requires the server to be running on PORT (default 5000).
*/

require('dotenv').config();
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

  // ─── MILESTONE 1 REGRESSION ────────────────────────────────────────

  console.log('\n=== MILESTONE 1 REGRESSION ===\n');

  let r = await request('GET', '/api/health');
  assert('GET /api/health returns 200', r.status === 200);
  assert('Health response success=true', r.body.success === true);

  r = await request('GET', '/api/nonexistent');
  assert('Invalid route returns 404', r.status === 404);
  assert('Invalid route success=false', r.body.success === false);

  // ─── REGISTRATION ──────────────────────────────────────────────────

  console.log('\n=== REGISTRATION ===\n');

  r = await request('POST', '/api/auth/register', {});
  assert('Missing fields returns 400', r.status === 400);

  r = await request('POST', '/api/auth/register', {
    firstName: 'Test', lastName: 'User', email: 'not-an-email', password: 'pass123456'
  });
  assert('Invalid email returns 400', r.status === 400);

  r = await request('POST', '/api/auth/register', {
    firstName: 'Test', lastName: 'User', email: testEmail, password: '123'
  });
  assert('Short password returns 400', r.status === 400);

  r = await request('POST', '/api/auth/register', {
    firstName: 'Panzi', lastName: 'Wick', email: testEmail, password: 'securepass123'
  });
  assert('Valid registration returns 201', r.status === 201, `got ${r.status}`);
  assert('Registration returns token', !!r.body.data?.token);
  assert('Registration returns user', !!r.body.data?.user);
  assert('No password in response', !r.body.data?.user?.password);
  assert('Role defaults to student', r.body.data?.user?.role === 'student');
  authToken = r.body.data?.token || '';

  r = await request('POST', '/api/auth/register', {
    firstName: 'Panzi', lastName: 'Wick', email: testEmail, password: 'securepass123'
  });
  assert('Duplicate email returns 409', r.status === 409, `got ${r.status}`);

  r = await request('POST', '/api/auth/register', {
    firstName: 'Hacker', lastName: 'Admin', email: `admin_${ts}@example.com`,
    password: 'securepass123', role: 'admin'
  });
  assert('Cannot register as admin', r.body.data?.user?.role === 'student');

  // ─── LOGIN ─────────────────────────────────────────────────────────

  console.log('\n=== LOGIN ===\n');

  authToken = '';

  r = await request('POST', '/api/auth/login', {});
  assert('Missing login fields returns 400', r.status === 400);

  r = await request('POST', '/api/auth/login', {
    email: testEmail, password: 'wrongpassword'
  });
  assert('Wrong password returns 401', r.status === 401, `got ${r.status}`);
  assert('Generic error message', r.body.message === 'Invalid email or password');

  r = await request('POST', '/api/auth/login', {
    email: 'nobody@example.com', password: 'anything'
  });
  assert('Non-existent account returns 401', r.status === 401, `got ${r.status}`);
  assert('Same generic message for non-existent', r.body.message === 'Invalid email or password');

  r = await request('POST', '/api/auth/login', {
    email: testEmail, password: 'securepass123'
  });
  assert('Valid login returns 200', r.status === 200, `got ${r.status}`);
  assert('Login returns token', !!r.body.data?.token);
  assert('No password in login response', !r.body.data?.user?.password);
  authToken = r.body.data?.token || '';

  // ─── JWT MIDDLEWARE ────────────────────────────────────────────────

  console.log('\n=== JWT MIDDLEWARE ===\n');

  r = await request('GET', '/api/students/me');
  assert('Valid JWT passes middleware', r.status === 200);

  const saved = authToken;
  authToken = '';
  r = await request('GET', '/api/students/me');
  assert('Missing JWT returns 401', r.status === 401);

  authToken = 'not.a.valid.jwt';
  r = await request('GET', '/api/students/me');
  assert('Malformed JWT returns 401', r.status === 401);

  authToken = saved;

  // ─── STUDENT PROFILE (M2 REGRESSION) ──────────────────────────────

  console.log('\n=== STUDENT PROFILE ===\n');

  r = await request('GET', '/api/students/me');
  assert('GET /students/me returns 200', r.status === 200);
  assert('Profile has firstName', r.body.data?.user?.firstName === 'Panzi');

  r = await request('PUT', '/api/students/me', { firstName: 'Kamal' });
  assert('PUT /students/me returns 200', r.status === 200, `got ${r.status}`);
  assert('firstName updated', r.body.data?.user?.firstName === 'Kamal');

  r = await request('PUT', '/api/students/me', { role: 'admin' });
  assert('Role change rejected (400 or role unchanged)',
    r.status === 400 || r.body.data?.user?.role === 'student',
    `status=${r.status} role=${r.body.data?.user?.role}`);

  r = await request('PUT', '/api/students/me', { password: 'hacked123' });
  assert('Password change via profile rejected', r.status === 400);

  authToken = '';
  r = await request('GET', '/api/students/me');
  assert('Unauthenticated GET returns 401', r.status === 401);

  r = await request('PUT', '/api/students/me', { firstName: 'Hacker' });
  assert('Unauthenticated PUT returns 401', r.status === 401);

  authToken = saved;

  // ─── ACADEMIC PROFILE — M2 REGRESSION ─────────────────────────────

  console.log('\n=== ACADEMIC PROFILE (M2 REGRESSION) ===\n');

  r = await request('GET', '/api/academic-profile/me');
  assert('GET /academic-profile/me returns 200', r.status === 200, `got ${r.status}`);
  assert('Profile has stream=Arts', r.body.data?.profile?.stream === 'Arts');
  assert('Response includes completeness', r.body.data?.completeness !== undefined);
  assert('Profile not complete initially', r.body.data?.completeness?.isComplete === false);

  r = await request('PUT', '/api/academic-profile/me', {
    interests: ['History', 'Political Science'],
    careerPreferences: ['Teacher', 'Journalist'],
    existingSkills: ['Research', 'Writing'],
  });
  assert('PUT /academic-profile/me returns 200', r.status === 200, `got ${r.status}`);
  assert('Interests updated', r.body.data?.profile?.interests?.length === 2);
  assert('CareerPreferences updated', r.body.data?.profile?.careerPreferences?.length === 2);
  assert('ExistingSkills updated', r.body.data?.profile?.existingSkills?.length === 2);

  r = await request('PUT', '/api/academic-profile/me', { role: 'admin' });
  assert('Protected field "role" rejected', r.status === 400);

  authToken = '';
  r = await request('GET', '/api/academic-profile/me');
  assert('Unauthenticated academic GET returns 401', r.status === 401);

  authToken = saved;

  // ─── M3: O/L RESULTS ──────────────────────────────────────────────

  console.log('\n=== M3: O/L RESULTS ===\n');

  // Valid O/L results
  r = await request('PUT', '/api/academic-profile/me', {
    olResults: [
      { subject: 'Mathematics', grade: 'A' },
      { subject: 'English', grade: 'B' },
      { subject: 'Science', grade: 'C' },
      { subject: 'Sinhala', grade: 'S' },
      { subject: 'History', grade: 'A' },
      { subject: 'Religion', grade: 'B' },
      { subject: 'Art', grade: 'C' },
      { subject: 'ICT', grade: 'A' },
    ],
  });
  assert('Valid O/L results accepted', r.status === 200, `got ${r.status}`);
  assert('O/L results stored (8 subjects)', r.body.data?.profile?.olResults?.length === 8);

  // Invalid O/L grade
  r = await request('PUT', '/api/academic-profile/me', {
    olResults: [
      { subject: 'Mathematics', grade: 'X' },
    ],
  });
  assert('Invalid O/L grade rejected', r.status === 400, `got ${r.status}`);

  // Duplicate O/L subjects
  r = await request('PUT', '/api/academic-profile/me', {
    olResults: [
      { subject: 'Mathematics', grade: 'A' },
      { subject: 'Mathematics', grade: 'B' },
    ],
  });
  assert('Duplicate O/L subjects rejected', r.status === 400, `got ${r.status}`);

  // Case-insensitive duplicate detection
  r = await request('PUT', '/api/academic-profile/me', {
    olResults: [
      { subject: 'English', grade: 'A' },
      { subject: 'english', grade: 'B' },
    ],
  });
  assert('Case-insensitive O/L duplicate rejected', r.status === 400, `got ${r.status}`);

  // Malformed O/L (not an array)
  r = await request('PUT', '/api/academic-profile/me', {
    olResults: 'not-an-array',
  });
  assert('Non-array O/L rejected', r.status === 400, `got ${r.status}`);

  // Malformed O/L entry (missing subject)
  r = await request('PUT', '/api/academic-profile/me', {
    olResults: [{ grade: 'A' }],
  });
  assert('O/L entry without subject rejected', r.status === 400, `got ${r.status}`);

  // Malformed O/L entry (missing grade)
  r = await request('PUT', '/api/academic-profile/me', {
    olResults: [{ subject: 'Mathematics' }],
  });
  assert('O/L entry without grade rejected', r.status === 400, `got ${r.status}`);

  // Empty subject string
  r = await request('PUT', '/api/academic-profile/me', {
    olResults: [{ subject: '', grade: 'A' }],
  });
  assert('Empty O/L subject rejected', r.status === 400, `got ${r.status}`);

  // O/L update replaces previous results
  r = await request('PUT', '/api/academic-profile/me', {
    olResults: [
      { subject: 'Mathematics', grade: 'A' },
      { subject: 'English', grade: 'A' },
    ],
  });
  assert('O/L update replaces previous', r.status === 200, `got ${r.status}`);
  assert('O/L now has 2 subjects', r.body.data?.profile?.olResults?.length === 2);

  // ─── M3: A/L RESULTS & SUBJECT COMBINATIONS ───────────────────────

  console.log('\n=== M3: A/L RESULTS & SUBJECT COMBINATIONS ===\n');

  // First, look up a valid subject combination from the seeded data
  // AC001: Economics, ICT, English Literature
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-guidance');
  const SubjectCombination = require('../src/models/SubjectCombination');
  const combo = await SubjectCombination.findOne({ combinationId: 'AC001' });
  const comboId = combo ? combo._id.toString() : null;
  const combo2 = await SubjectCombination.findOne({ combinationId: 'AC004' });
  const combo2Id = combo2 ? combo2._id.toString() : null;

  assert('Seeded combination AC001 exists', !!comboId, 'SubjectCombination AC001 not found');
  assert('Seeded combination AC004 exists', !!combo2Id, 'SubjectCombination AC004 not found');

  if (!comboId || !combo2Id) {
    console.log('\n  SKIP: Cannot run A/L tests without seeded subject combinations.\n');
  } else {
    // Valid A/L results with matching combination (subjects in different order)
    r = await request('PUT', '/api/academic-profile/me', {
      alResults: [
        { subject: 'English Literature', grade: 'A' },
        { subject: 'Economics', grade: 'B' },
        { subject: 'ICT', grade: 'C' },
      ],
      subjectCombinationId: comboId,
    });
    assert('Valid A/L with matching combination accepted', r.status === 200, `got ${r.status} ${r.body?.message}`);
    assert('A/L results stored (3 subjects)', r.body.data?.profile?.alResults?.length === 3);
    assert('Combination ID stored', r.body.data?.profile?.subjectCombinationId === comboId);

    // Invalid A/L grade
    r = await request('PUT', '/api/academic-profile/me', {
      alResults: [
        { subject: 'Economics', grade: 'Z' },
        { subject: 'ICT', grade: 'A' },
        { subject: 'English Literature', grade: 'B' },
      ],
      subjectCombinationId: comboId,
    });
    assert('Invalid A/L grade rejected', r.status === 400, `got ${r.status}`);

    // Duplicate A/L subjects
    r = await request('PUT', '/api/academic-profile/me', {
      alResults: [
        { subject: 'Economics', grade: 'A' },
        { subject: 'Economics', grade: 'B' },
        { subject: 'ICT', grade: 'C' },
      ],
      subjectCombinationId: comboId,
    });
    assert('Duplicate A/L subjects rejected', r.status === 400, `got ${r.status}`);

    // Subjects that don't match combination
    r = await request('PUT', '/api/academic-profile/me', {
      alResults: [
        { subject: 'Geography', grade: 'A' },
        { subject: 'Economics', grade: 'B' },
        { subject: 'Logic', grade: 'C' },
      ],
      subjectCombinationId: comboId,
    });
    assert('Mismatched A/L subjects vs combination rejected', r.status === 400, `got ${r.status}`);

    // Invalid (non-existent) subject combination ID
    r = await request('PUT', '/api/academic-profile/me', {
      alResults: [
        { subject: 'Economics', grade: 'A' },
        { subject: 'ICT', grade: 'B' },
        { subject: 'English Literature', grade: 'C' },
      ],
      subjectCombinationId: '000000000000000000000000',
    });
    assert('Non-existent combination ID rejected', r.status === 400, `got ${r.status}`);

    // Malformed combination ID
    r = await request('PUT', '/api/academic-profile/me', {
      subjectCombinationId: 'not-a-valid-id',
    });
    assert('Malformed combination ID rejected', r.status === 400, `got ${r.status}`);

    // Malformed A/L (not an array)
    r = await request('PUT', '/api/academic-profile/me', {
      alResults: 'invalid',
    });
    assert('Non-array A/L rejected', r.status === 400, `got ${r.status}`);

    // Update to a different valid combination
    // AC004: History, Sinhala, Political Science
    r = await request('PUT', '/api/academic-profile/me', {
      alResults: [
        { subject: 'Political Science', grade: 'A' },
        { subject: 'History', grade: 'B' },
        { subject: 'Sinhala', grade: 'C' },
      ],
      subjectCombinationId: combo2Id,
    });
    assert('A/L update to different combination accepted', r.status === 200, `got ${r.status}`);
    assert('New combination ID stored', r.body.data?.profile?.subjectCombinationId === combo2Id);
  }

  // ─── M3: INTERESTS / SKILLS / CAREER PREFERENCES ──────────────────

  console.log('\n=== M3: INTERESTS / SKILLS / CAREER PREFERENCES ===\n');

  r = await request('PUT', '/api/academic-profile/me', {
    interests: ['Art History', 'Archaeology', 'Creative Writing'],
  });
  assert('Interests update accepted', r.status === 200, `got ${r.status}`);
  assert('Interests stored (3)', r.body.data?.profile?.interests?.length === 3);

  r = await request('PUT', '/api/academic-profile/me', {
    existingSkills: ['Public Speaking', 'Critical Thinking'],
  });
  assert('Skills update accepted', r.status === 200, `got ${r.status}`);
  assert('Skills stored (2)', r.body.data?.profile?.existingSkills?.length === 2);

  r = await request('PUT', '/api/academic-profile/me', {
    careerPreferences: ['Lecturer', 'Diplomat', 'Researcher'],
  });
  assert('Career preferences update accepted', r.status === 200, `got ${r.status}`);
  assert('Career preferences stored (3)', r.body.data?.profile?.careerPreferences?.length === 3);

  // Invalid: non-array
  r = await request('PUT', '/api/academic-profile/me', {
    interests: 'not-an-array',
  });
  assert('Non-array interests rejected', r.status === 400, `got ${r.status}`);

  // Invalid: array with empty string
  r = await request('PUT', '/api/academic-profile/me', {
    interests: ['Valid', ''],
  });
  assert('Empty string in interests rejected', r.status === 400, `got ${r.status}`);

  // Invalid: array with non-string
  r = await request('PUT', '/api/academic-profile/me', {
    existingSkills: [123, 'Valid'],
  });
  assert('Non-string in skills rejected', r.status === 400, `got ${r.status}`);

  // Invalid: career prefs non-array
  r = await request('PUT', '/api/academic-profile/me', {
    careerPreferences: { pref: 'Teacher' },
  });
  assert('Non-array career preferences rejected', r.status === 400, `got ${r.status}`);

  // ─── M3: PROTECTED FIELDS ─────────────────────────────────────────

  console.log('\n=== M3: PROTECTED FIELDS ===\n');

  r = await request('PUT', '/api/academic-profile/me', { userId: '000000000000000000000000' });
  assert('userId modification rejected', r.status === 400, `got ${r.status}`);

  r = await request('PUT', '/api/academic-profile/me', { _id: '000000000000000000000000' });
  assert('_id modification rejected', r.status === 400, `got ${r.status}`);

  r = await request('PUT', '/api/academic-profile/me', { password: 'hacked' });
  assert('password in academic profile rejected', r.status === 400, `got ${r.status}`);

  r = await request('PUT', '/api/academic-profile/me', { createdAt: '2020-01-01' });
  assert('createdAt modification rejected', r.status === 400, `got ${r.status}`);

  // ─── M3: STREAM VALIDATION ────────────────────────────────────────

  console.log('\n=== M3: STREAM VALIDATION ===\n');

  r = await request('PUT', '/api/academic-profile/me', { stream: 'Science' });
  assert('Unsupported stream rejected', r.status === 400, `got ${r.status}`);

  r = await request('PUT', '/api/academic-profile/me', { stream: 'Arts' });
  assert('Valid stream accepted', r.status === 200, `got ${r.status}`);

  r = await request('PUT', '/api/academic-profile/me', { stream: 123 });
  assert('Non-string stream rejected', r.status === 400, `got ${r.status}`);

  // ─── M3: EMPTY / MALFORMED UPDATES ────────────────────────────────

  console.log('\n=== M3: EMPTY / MALFORMED UPDATES ===\n');

  r = await request('PUT', '/api/academic-profile/me', {});
  assert('Empty body rejected', r.status === 400, `got ${r.status}`);

  r = await request('PUT', '/api/academic-profile/me', { unknownField: 'value' });
  assert('Unknown fields only rejected', r.status === 400, `got ${r.status}`);

  // ─── M3: PROFILE COMPLETENESS ─────────────────────────────────────

  console.log('\n=== M3: PROFILE COMPLETENESS ===\n');

  // Ensure all fields are populated for completeness check
  if (comboId) {
    await request('PUT', '/api/academic-profile/me', {
      olResults: [
        { subject: 'Mathematics', grade: 'A' },
        { subject: 'English', grade: 'B' },
      ],
    });
    await request('PUT', '/api/academic-profile/me', {
      alResults: [
        { subject: 'Economics', grade: 'A' },
        { subject: 'ICT', grade: 'B' },
        { subject: 'English Literature', grade: 'C' },
      ],
      subjectCombinationId: comboId,
    });
    await request('PUT', '/api/academic-profile/me', {
      interests: ['History'],
      careerPreferences: ['Teacher'],
    });

    r = await request('GET', '/api/academic-profile/me');
    assert('Complete profile isComplete=true', r.body.data?.completeness?.isComplete === true,
      `got ${JSON.stringify(r.body.data?.completeness)}`);
    assert('Completeness fields all true',
      Object.values(r.body.data?.completeness?.fields || {}).every(Boolean),
      `got ${JSON.stringify(r.body.data?.completeness?.fields)}`);
  }

  // ─── M3: UNAUTHENTICATED ACCESS ───────────────────────────────────

  console.log('\n=== M3: UNAUTHENTICATED ACCESS ===\n');

  authToken = '';
  r = await request('GET', '/api/academic-profile/me');
  assert('Unauthenticated GET academic profile returns 401', r.status === 401);

  r = await request('PUT', '/api/academic-profile/me', {
    olResults: [{ subject: 'Mathematics', grade: 'A' }],
  });
  assert('Unauthenticated PUT academic profile returns 401', r.status === 401);

  authToken = saved;

  // ─── CLEANUP ───────────────────────────────────────────────────────

  const testUserEmails = [testEmail, `admin_${ts}@example.com`];
  const testUsers = await mongoose.connection.db.collection('users').find({ email: { $in: testUserEmails } }).toArray();
  const testUserIds = testUsers.map(u => u._id);

  await mongoose.connection.db.collection('users').deleteMany({
    _id: { $in: testUserIds }
  });
  await mongoose.connection.db.collection('academicprofiles').deleteMany({
    userId: { $in: testUserIds }
  });
  await mongoose.disconnect();

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
