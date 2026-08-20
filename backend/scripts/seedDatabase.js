require('dotenv').config();

const path = require('path');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

const University = require('../src/models/University');
const SubjectCombination = require('../src/models/SubjectCombination');
const DegreeProgramme = require('../src/models/DegreeProgramme');
const Career = require('../src/models/Career');
const Skill = require('../src/models/Skill');
const CareerMapping = require('../src/models/CareerMapping');
const RecommendationRule = require('../src/models/RecommendationRule');

const DATASET_PATH = path.resolve(__dirname, '../../dataset/GuidanceDataset.xlsx');

function readSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`Sheet "${sheetName}" not found`);
    return [];
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function cleanBOM(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/^\uFEFF/, '').trim();
}

function getVal(row, ...keys) {
  for (const key of keys) {
    const found = Object.keys(row).find(
      (k) => cleanBOM(k).toLowerCase() === key.toLowerCase()
    );
    if (found !== undefined && row[found] !== '') return cleanBOM(String(row[found]));
  }
  return undefined;
}

async function upsertMany(Model, records, keyField, label) {
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const record of records) {
    try {
      const filter = {};
      if (typeof keyField === 'string') {
        filter[keyField] = record[keyField];
      } else {
        for (const k of keyField) {
          filter[k] = record[k];
        }
      }

      const result = await Model.updateOne(filter, { $set: record }, { upsert: true });

      if (result.upsertedCount > 0) inserted++;
      else if (result.modifiedCount > 0) updated++;
    } catch (err) {
      errors++;
      console.error(`  Error in ${label}: ${err.message}`);
    }
  }

  console.log(`  ${label}: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  return { inserted, updated, errors };
}

async function seedUniversities(workbook) {
  const rows = readSheet(workbook, 'Universities');
  const records = rows.map((row) => ({
    universityId: getVal(row, 'UniversityID'),
    name: getVal(row, 'UniversityName'),
    type: getVal(row, 'Type'),
    location: getVal(row, 'Location'),
  }));
  return upsertMany(University, records, 'universityId', 'Universities');
}

async function seedSubjectCombinations(workbook) {
  const rows = readSheet(workbook, 'Arts Subject Combinations');
  const records = rows.map((row) => ({
    combinationId: getVal(row, 'CombinationID'),
    subject1: getVal(row, 'Subject1'),
    subject2: getVal(row, 'Subject2'),
    subject3: getVal(row, 'Subject3'),
  }));
  return upsertMany(SubjectCombination, records, 'combinationId', 'Subject Combinations');
}

async function seedStateDegrees(workbook) {
  const rows = readSheet(workbook, 'State University Degree Program');
  const records = rows.map((row) => ({
    degreeId: getVal(row, 'DegreeID'),
    name: getVal(row, 'DegreeName'),
    universityId: getVal(row, 'UniversityID'),
    type: 'State',
    category: getVal(row, 'Category'),
  }));
  return upsertMany(DegreeProgramme, records, 'degreeId', 'State Degree Programmes');
}

async function seedPrivateDegrees(workbook) {
  const rows = readSheet(workbook, 'Private University Degree Progr');
  const records = rows.map((row) => ({
    degreeId: getVal(row, 'DegreeID'),
    name: getVal(row, 'DegreeName'),
    universityId: getVal(row, 'UniversityID'),
    type: 'Private',
    minimumRequirement: getVal(row, 'MinimumRequirement'),
  }));
  return upsertMany(DegreeProgramme, records, 'degreeId', 'Private Degree Programmes');
}

async function seedCareers(workbook) {
  const rows = readSheet(workbook, 'Careers');
  const records = rows.map((row) => ({
    careerId: getVal(row, 'CareerID'),
    name: getVal(row, 'CareerName'),
    category: getVal(row, 'Category'),
  }));
  return upsertMany(Career, records, 'careerId', 'Careers');
}

async function seedSkills(workbook) {
  const rows = readSheet(workbook, 'Skills');
  const records = rows.map((row) => ({
    skillId: getVal(row, 'SkillID'),
    name: getVal(row, 'SkillName'),
  }));
  return upsertMany(Skill, records, 'skillId', 'Skills');
}

async function seedCareerMappings(workbook) {
  const rows = readSheet(workbook, 'Career Mapping');
  const records = rows.map((row) => ({
    degreeId: getVal(row, 'DegreeID'),
    careerId: getVal(row, 'CareerID'),
    notes: getVal(row, 'Notes'),
  }));
  return upsertMany(CareerMapping, records, ['degreeId', 'careerId'], 'Career Mappings');
}

async function seedRecommendationRules(workbook) {
  const rows = readSheet(workbook, 'Recommendation Rules');
  const records = rows.map((row) => ({
    ruleId: getVal(row, 'RuleID'),
    subjects: getVal(row, 'Subjects'),
    interest: getVal(row, 'Interest'),
    recommend: getVal(row, 'Recommend'),
  }));
  return upsertMany(RecommendationRule, records, 'ruleId', 'Recommendation Rules');
}

async function seed() {
  console.log('Starting database seed...\n');

  await connectDB();

  console.log(`\nReading dataset: ${DATASET_PATH}\n`);
  const workbook = XLSX.readFile(DATASET_PATH);

  await seedUniversities(workbook);
  await seedSubjectCombinations(workbook);
  await seedStateDegrees(workbook);
  await seedPrivateDegrees(workbook);
  await seedCareers(workbook);
  await seedSkills(workbook);
  await seedCareerMappings(workbook);
  await seedRecommendationRules(workbook);

  console.log('\nVerifying record counts...');
  const counts = {
    Universities: await University.countDocuments(),
    'Subject Combinations': await SubjectCombination.countDocuments(),
    'Degree Programmes': await DegreeProgramme.countDocuments(),
    Careers: await Career.countDocuments(),
    Skills: await Skill.countDocuments(),
    'Career Mappings': await CareerMapping.countDocuments(),
    'Recommendation Rules': await RecommendationRule.countDocuments(),
  };

  console.log('\nCollection counts:');
  for (const [name, count] of Object.entries(counts)) {
    console.log(`  ${name}: ${count}`);
  }

  console.log('\nSeed completed successfully.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
