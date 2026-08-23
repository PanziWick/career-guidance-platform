require('dotenv').config();
const mongoose = require('mongoose');
const RecommendationRule = require('./src/models/RecommendationRule');
const DegreeProgramme = require('./src/models/DegreeProgramme');
const fs = require('fs');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const rules = await RecommendationRule.find().lean();
  const degrees = await DegreeProgramme.find().lean();
  fs.writeFileSync('dump.json', JSON.stringify({ rules, degrees }, null, 2));
  await mongoose.connection.close();
}

run().catch(console.error);
