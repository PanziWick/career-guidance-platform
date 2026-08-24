const XLSX = require('xlsx');
const path = require('path');

const DATASET_PATH = path.resolve(__dirname, '../../dataset/GuidanceDataset.xlsx');

// The curated mappings
const mappings = [
  // C001 : Software Engineer
  { CareerID: 'C001', SkillID: 'S004' }, // Programming
  { CareerID: 'C001', SkillID: 'S005' }, // Database Management
  { CareerID: 'C001', SkillID: 'S008' }, // Problem Solving
  { CareerID: 'C001', SkillID: 'S002' }, // Critical Thinking
  { CareerID: 'C001', SkillID: 'S009' }, // Teamwork

  // C002 : Business Analyst
  { CareerID: 'C002', SkillID: 'S002' }, // Critical Thinking
  { CareerID: 'C002', SkillID: 'S001' }, // Communication
  { CareerID: 'C002', SkillID: 'S008' }, // Problem Solving
  { CareerID: 'C002', SkillID: 'S005' }, // Database Management

  // C003 : Systems Analyst
  { CareerID: 'C003', SkillID: 'S005' }, // Database Management
  { CareerID: 'C003', SkillID: 'S008' }, // Problem Solving
  { CareerID: 'C003', SkillID: 'S001' }, // Communication
  { CareerID: 'C003', SkillID: 'S004' }, // Programming

  // C004 : Data Analyst
  { CareerID: 'C004', SkillID: 'S014' }, // Qualitative Data Analysis
  { CareerID: 'C004', SkillID: 'S005' }, // Database Management
  { CareerID: 'C004', SkillID: 'S007' }, // Research
  { CareerID: 'C004', SkillID: 'S002' }, // Critical Thinking

  // C005 : Teacher
  { CareerID: 'C005', SkillID: 'S001' }, // Communication
  { CareerID: 'C005', SkillID: 'S006' }, // Public Speaking
  { CareerID: 'C005', SkillID: 'S003' }, // Leadership
  { CareerID: 'C005', SkillID: 'S015' }, // Conflict Resolution & Mediation

  // C006 : Lecturer
  { CareerID: 'C006', SkillID: 'S006' }, // Public Speaking
  { CareerID: 'C006', SkillID: 'S007' }, // Research
  { CareerID: 'C006', SkillID: 'S001' }, // Communication
  { CareerID: 'C006', SkillID: 'S003' }, // Leadership

  // C007 : Social Worker
  { CareerID: 'C007', SkillID: 'S015' }, // Conflict Resolution & Mediation
  { CareerID: 'C007', SkillID: 'S001' }, // Communication
  { CareerID: 'C007', SkillID: 'S008' }, // Problem Solving

  // C008 : Diplomatic Officer
  { CareerID: 'C008', SkillID: 'S017' }, // Intercultural Communication
  { CareerID: 'C008', SkillID: 'S015' }, // Conflict Resolution & Mediation
  { CareerID: 'C008', SkillID: 'S006' }, // Public Speaking
  { CareerID: 'C008', SkillID: 'S003' }, // Leadership

  // C009 : Journalist
  { CareerID: 'C009', SkillID: 'S010' }, // Writing Skills
  { CareerID: 'C009', SkillID: 'S001' }, // Communication
  { CareerID: 'C009', SkillID: 'S007' }, // Research
  { CareerID: 'C009', SkillID: 'S006' }, // Public Speaking

  // C010 : Human Resource Executive
  { CareerID: 'C010', SkillID: 'S015' }, // Conflict Resolution & Mediation
  { CareerID: 'C010', SkillID: 'S001' }, // Communication
  { CareerID: 'C010', SkillID: 'S018' }, // Professional Ethics
  { CareerID: 'C010', SkillID: 'S009' }, // Teamwork

  // C011 : Economist
  { CareerID: 'C011', SkillID: 'S014' }, // Qualitative Data Analysis
  { CareerID: 'C011', SkillID: 'S007' }, // Research
  { CareerID: 'C011', SkillID: 'S002' }, // Critical Thinking
  { CareerID: 'C011', SkillID: 'S008' }, // Problem Solving

  // C012 : Tourism Officer
  { CareerID: 'C012', SkillID: 'S017' }, // Intercultural Communication
  { CareerID: 'C012', SkillID: 'S001' }, // Communication
  { CareerID: 'C012', SkillID: 'S006' }, // Public Speaking
  { CareerID: 'C012', SkillID: 'S011' }, // Linguistic Proficiency (Multi-lingual)

  // C013 : Lawyer/Attorney-at-Law
  { CareerID: 'C013', SkillID: 'S012' }, // Legal Research & Drafting
  { CareerID: 'C013', SkillID: 'S002' }, // Critical Thinking
  { CareerID: 'C013', SkillID: 'S006' }, // Public Speaking
  { CareerID: 'C013', SkillID: 'S018' }, // Professional Ethics

  // C014 : Professional Translator
  { CareerID: 'C014', SkillID: 'S011' }, // Linguistic Proficiency (Multi-lingual)
  { CareerID: 'C014', SkillID: 'S010' }, // Writing Skills
  { CareerID: 'C014', SkillID: 'S017' }, // Intercultural Communication

  // C015 : Content Creator/Film Producer
  { CareerID: 'C015', SkillID: 'S013' }, // Creative Content Production
  { CareerID: 'C015', SkillID: 'S010' }, // Writing Skills
  { CareerID: 'C015', SkillID: 'S009' }, // Teamwork

  // C016 : Diplomat/Foreign Service
  { CareerID: 'C016', SkillID: 'S017' }, // Intercultural Communication
  { CareerID: 'C016', SkillID: 'S011' }, // Linguistic Proficiency (Multi-lingual)
  { CareerID: 'C016', SkillID: 'S015' }, // Conflict Resolution & Mediation
  { CareerID: 'C016', SkillID: 'S018' }, // Professional Ethics

  // C017 : GIS Specialist
  { CareerID: 'C017', SkillID: 'S016' }, // GIS and Mapping
  { CareerID: 'C017', SkillID: 'S014' }, // Qualitative Data Analysis
  { CareerID: 'C017', SkillID: 'S005' }, // Database Management

  // C018 : Musician/Performer
  { CareerID: 'C018', SkillID: 'S013' }, // Creative Content Production
  { CareerID: 'C018', SkillID: 'S006' }, // Public Speaking
  { CareerID: 'C018', SkillID: 'S009' }, // Teamwork

  // C019 : Archeologist/Historian
  { CareerID: 'C019', SkillID: 'S007' }, // Research
  { CareerID: 'C019', SkillID: 'S014' }, // Qualitative Data Analysis
  { CareerID: 'C019', SkillID: 'S002' }, // Critical Thinking
  { CareerID: 'C019', SkillID: 'S010' }, // Writing Skills

  // C020 : UX/UI Designer
  { CareerID: 'C020', SkillID: 'S013' }, // Creative Content Production
  { CareerID: 'C020', SkillID: 'S008' }, // Problem Solving
  { CareerID: 'C020', SkillID: 'S001' }, // Communication
  { CareerID: 'C020', SkillID: 'S009' }, // Teamwork
];

console.log('Loading workbook...');
const workbook = XLSX.readFile(DATASET_PATH);

if (workbook.SheetNames.includes('Career Skills')) {
  console.log('Sheet "Career Skills" already exists. Updating it...');
  workbook.Sheets['Career Skills'] = XLSX.utils.json_to_sheet(mappings);
} else {
  console.log('Appending new sheet "Career Skills"...');
  const newSheet = XLSX.utils.json_to_sheet(mappings);
  XLSX.utils.book_append_sheet(workbook, newSheet, 'Career Skills');
}

XLSX.writeFile(workbook, DATASET_PATH);
console.log(`Successfully saved dataset with ${mappings.length} mappings!`);
