require('dotenv').config();
const http = require('http');
const app = require('../src/app');
const connectDB = require('../src/config/db');

let server;

async function request(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  console.log("Sending headers:", headers);

  const res = await fetch(`http://localhost:${server.address().port}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return { status: res.status, data };
}

async function run() {
  await connectDB();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    console.log("=== STARTING WORKFLOW VERIFICATION ===\n");

    // 1. Register
    const email = 'demo.student@example.com';
    console.log(`1. Registering ${email}...`);
    const regRes = await request('/api/auth/register', 'POST', {
      firstName: 'Demo',
      lastName: 'Student',
      email,
      password: 'StrongPassword123!',
    });
    console.log("Reg response:", regRes.status, regRes.data);
    let token = regRes.data.data.token;
    
    // 2. Login
    console.log(`\n2. Logging in...`);
    const loginRes = await request('/api/auth/login', 'POST', {
      email,
      password: 'StrongPassword123!',
    });
    console.log("Login response:", loginRes.status, loginRes.data);
    token = loginRes.data.data.token;

    // 3. Get student profile
    console.log(`\n3. Getting student profile...`);
    const profileRes = await request('/api/students/me', 'GET', null, token);
    console.log("Profile response:", profileRes.status, profileRes.data);

    // 4. Get Arts subject combinations
    console.log(`\n4. Getting Arts subject combinations...`);
    const subRes = await request('/api/subject-combinations', 'GET');
    const combinationsList = subRes.data.data || subRes.data;
    const comb = combinationsList[0];
    console.log("Selected Combination:", comb.combinationId);

    // 5 & 6. Update academic profile
    console.log(`\n5 & 6. Updating academic profile...`);
    const acadRes = await request('/api/academic-profile/me', 'PUT', {
      stream: 'Arts',
      subjectCombinationId: comb._id,
      olResults: [
        { subject: 'Mathematics', grade: 'A' },
        { subject: 'Science', grade: 'A' },
        { subject: 'English', grade: 'B' }
      ],
      alResults: [
        { subject: comb.subject1, grade: 'B' },
        { subject: comb.subject2, grade: 'C' },
        { subject: comb.subject3, grade: 'C' }
      ],
      interests: ['Technology', 'Business'],
      careerPreferences: ['IT Professional']
    }, token);
    console.log("Update profile response:", acadRes.status, acadRes.data);

    // 7. Get academic profile
    console.log(`\n7. Getting academic profile...`);
    const getAcadRes = await request('/api/academic-profile/me', 'GET', null, token);
    console.log("Get academic profile:", getAcadRes.status, getAcadRes.data);

    // 8. Generate recommendations
    console.log(`\n8. Generating recommendations...`);
    const recRes = await request('/api/recommendations', 'POST', {}, token);
    console.log("Generate recommendations:", recRes.status, recRes.data.success);
    const recommendations = recRes.data.data;
    if (recommendations && recommendations.length > 0) {
      console.log(`Got ${recommendations.length} recommendations. Top recommendation:`, recommendations[0].careerId);
    } else {
      console.log("No eligible recommendation produced:", recRes.data.message);
    }

    // 9. Get recommendation history
    console.log(`\n9. Getting recommendation history...`);
    const histRes = await request('/api/recommendations', 'GET', null, token);
    const histList = histRes.data.data || histRes.data;
    console.log("History response:", histRes.status, histList.length, "entries");
    const recId = histList[0]._id;
    console.log("Using Recommendation ID:", recId);

    // 10 & 11. Perform skill-gap analysis
    console.log(`\n10 & 11. Performing skill-gap analysis...`);
    const skillRes = await request('/api/skills/gap-analysis', 'POST', { recommendationId: recId }, token);
    console.log("Skill gap result:", skillRes.status, skillRes.data);

    // 12. Generate learning roadmap
    console.log(`\n12. Generating roadmap...`);
    const mapRes = await request('/api/roadmaps', 'POST', { recommendationId: recId }, token);
    console.log("Roadmap generate result:", mapRes.status, mapRes.data);

    // 13. Get roadmap history
    console.log(`\n13. Getting roadmap history...`);
    const mapHistRes = await request('/api/roadmaps', 'GET', null, token);
    const mapList = mapHistRes.data.data || mapHistRes.data;
    console.log("Roadmap history result:", mapHistRes.status, mapList.length, "entries");
    if (mapList.length > 0) {
      console.log("First roadmap ID:", mapList[0]._id);
    }

    console.log(`\n=== POSTMAN OUTPUT ===`);
    console.log(`Student Email: ${email}`);
    console.log(`Password: StrongPassword123!`);
    console.log(`Token: ${token}`);
    console.log(`Recommendation ID: ${recId}`);
    console.log(`\nCorrect Request Order for Postman:`);
    console.log(`1. POST /api/auth/register`);
    console.log(`2. POST /api/auth/login`);
    console.log(`3. GET /api/students/me`);
    console.log(`4. GET /api/subject-combinations`);
    console.log(`5. PUT /api/academic-profile/me`);
    console.log(`6. GET /api/academic-profile/me`);
    console.log(`7. POST /api/recommendations`);
    console.log(`8. GET /api/recommendations`);
    console.log(`9. POST /api/skills/gap-analysis`);
    console.log(`10. POST /api/roadmaps`);
    console.log(`11. GET /api/roadmaps`);
    
  } catch (error) {
    console.error("Workflow verification failed:", error);
  } finally {
    server.close();
    process.exit(0);
  }
}

run();
