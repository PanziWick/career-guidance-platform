require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

// Models
const University = require('../src/models/University');
const SubjectCombination = require('../src/models/SubjectCombination');
const DegreeProgramme = require('../src/models/DegreeProgramme');
const Career = require('../src/models/Career');
const Skill = require('../src/models/Skill');
const CareerMapping = require('../src/models/CareerMapping');
const RecommendationRule = require('../src/models/RecommendationRule');
const User = require('../src/models/User');
const AcademicProfile = require('../src/models/AcademicProfile');
const Recommendation = require('../src/models/Recommendation');
const LearningRoadmap = require('../src/models/LearningRoadmap');

const reset = async () => {
  // Explicit development safeguard
  if (process.env.NODE_ENV !== 'development') {
    console.error('ERROR: Database reset is only allowed in development environment.');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || !mongoUri.includes('career_guidance')) {
    console.error('ERROR: MONGODB_URI does not target the career_guidance database.');
    process.exit(1);
  }

  console.log('Connecting to database for reset...');
  await connectDB();

  console.log('Clearing application-generated collections...');
  await User.deleteMany({});
  await AcademicProfile.deleteMany({});
  await Recommendation.deleteMany({});
  await LearningRoadmap.deleteMany({});
  console.log('Application-generated collections cleared.');

  console.log('Clearing authoritative dataset collections...');
  await University.deleteMany({});
  await SubjectCombination.deleteMany({});
  await DegreeProgramme.deleteMany({});
  await Career.deleteMany({});
  await Skill.deleteMany({});
  await CareerMapping.deleteMany({});
  await RecommendationRule.deleteMany({});
  console.log('Authoritative dataset collections cleared.');

  console.log('Database reset complete.');
  await mongoose.connection.close();
  process.exit(0);
};

reset().catch(err => {
  console.error('Reset failed:', err.message);
  process.exit(1);
});
