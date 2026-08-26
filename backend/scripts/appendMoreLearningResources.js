const XLSX = require('xlsx');
const path = require('path');

const DATASET_PATH = path.resolve(__dirname, '../../dataset/GuidanceDataset.xlsx');

const moreResources = [
  {
    ResourceID: 'R009',
    SkillID: 'S002', // Critical Thinking
    Title: 'Critical Thinking Skills',
    Provider: 'Coursera',
    URL: 'https://www.coursera.org/learn/critical-thinking-skills',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '10 hours'
  },
  {
    ResourceID: 'R010',
    SkillID: 'S003', // Leadership
    Title: 'Leadership Courses',
    Provider: 'Coursera',
    URL: 'https://www.coursera.org/courses?query=leadership',
    Type: 'Course Catalog',
    Level: 'Mixed',
    Access: 'Mixed',
    Duration: 'Variable'
  },
  {
    ResourceID: 'R011',
    SkillID: 'S006', // Public Speaking
    Title: 'Introduction to Public Speaking',
    Provider: 'Coursera',
    URL: 'https://www.coursera.org/learn/public-speaking',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '12 hours'
  },
  {
    ResourceID: 'R012',
    SkillID: 'S007', // Research
    Title: 'Understanding Research Methods',
    Provider: 'Coursera',
    URL: 'https://www.coursera.org/learn/research-methods',
    Type: 'Course',
    Level: 'Intermediate',
    Access: 'Free',
    Duration: '20 hours'
  },
  {
    ResourceID: 'R013',
    SkillID: 'S008', // Problem Solving
    Title: 'Effective Problem-Solving and Decision-Making',
    Provider: 'Coursera',
    URL: 'https://www.coursera.org/learn/problem-solving',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '15 hours'
  },
  {
    ResourceID: 'R014',
    SkillID: 'S009', // Teamwork
    Title: 'Teamwork Skills: Communicating Effectively in Groups',
    Provider: 'Coursera',
    URL: 'https://www.coursera.org/learn/teamwork-skills-effective-communication',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '10 hours'
  },
  {
    ResourceID: 'R015',
    SkillID: 'S010', // Writing Skills
    Title: 'Business Writing',
    Provider: 'Coursera',
    URL: 'https://www.coursera.org/learn/business-writing',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '13 hours'
  },
  {
    ResourceID: 'R016',
    SkillID: 'S011', // Linguistic Proficiency (Multi-lingual)
    Title: 'Duolingo Language Courses',
    Provider: 'Duolingo',
    URL: 'https://www.duolingo.com/',
    Type: 'Learning Platform',
    Level: 'Mixed',
    Access: 'Free access',
    Duration: 'Self-paced'
  },
  {
    ResourceID: 'R017',
    SkillID: 'S013', // Creative Content Production
    Title: 'Digital Storytelling',
    Provider: 'Coursera',
    URL: 'https://www.coursera.org/learn/digital-storytelling',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '16 hours'
  },
  {
    ResourceID: 'R018',
    SkillID: 'S017', // Intercultural Communication
    Title: 'Intercultural Communication and Conflict Resolution',
    Provider: 'Coursera',
    URL: 'https://www.coursera.org/learn/intercultural-communication',
    Type: 'Course',
    Level: 'Intermediate',
    Access: 'Free',
    Duration: '10 hours'
  },
  {
    ResourceID: 'R019',
    SkillID: 'S018', // Professional Ethics
    Title: 'Business Ethics',
    Provider: 'Coursera',
    URL: 'https://www.coursera.org/learn/business-ethics',
    Type: 'Course',
    Level: 'Intermediate',
    Access: 'Free',
    Duration: '8 hours'
  }
];

console.log('Loading workbook...');
const workbook = XLSX.readFile(DATASET_PATH);

if (!workbook.SheetNames.includes('Learning Resources')) {
  console.log('Sheet "Learning Resources" does not exist!');
  process.exit(1);
}

console.log('Appending more resources...');
const existingData = XLSX.utils.sheet_to_json(workbook.Sheets['Learning Resources']);
const updatedData = [...existingData, ...moreResources];

workbook.Sheets['Learning Resources'] = XLSX.utils.json_to_sheet(updatedData);

XLSX.writeFile(workbook, DATASET_PATH);
console.log(`Successfully appended 11 new resources! Total is now ${updatedData.length}.`);
