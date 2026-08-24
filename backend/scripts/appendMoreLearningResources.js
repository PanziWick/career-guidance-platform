const XLSX = require('xlsx');
const path = require('path');

const DATASET_PATH = path.resolve(__dirname, '../../dataset/GuidanceDataset.xlsx');

const moreResources = [
  {
    ResourceID: 'R009',
    SkillID: 'S002', // Critical Thinking
    Title: 'Critical Thinking Skills',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/money-business/leadership-management/critical-thinking',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '10 hours'
  },
  {
    ResourceID: 'R010',
    SkillID: 'S003', // Leadership
    Title: 'Leadership and Followership',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/money-business/leadership-management/leadership-and-followership',
    Type: 'Course',
    Level: 'Intermediate',
    Access: 'Free',
    Duration: '8 hours'
  },
  {
    ResourceID: 'R011',
    SkillID: 'S006', // Public Speaking
    Title: 'Learning to Teach, Learning to Speak',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/education-development/learning-teach-learning-speak',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '4 hours'
  },
  {
    ResourceID: 'R012',
    SkillID: 'S007', // Research
    Title: 'Understanding Health and Social Care Research',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/health-sports-psychology/health/understanding-health-and-social-care-research',
    Type: 'Course',
    Level: 'Intermediate',
    Access: 'Free',
    Duration: '15 hours'
  },
  {
    ResourceID: 'R013',
    SkillID: 'S008', // Problem Solving
    Title: 'Problem Solving and Decision Making',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/money-business/leadership-management/problem-solving-and-decision-making',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '12 hours'
  },
  {
    ResourceID: 'R014',
    SkillID: 'S009', // Teamwork
    Title: 'Working in Teams',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/money-business/leadership-management/working-teams',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '15 hours'
  },
  {
    ResourceID: 'R015',
    SkillID: 'S010', // Writing Skills
    Title: 'English: Skills for Learning',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/education-development/english-skills-learning',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '24 hours'
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
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/history-the-arts/digital-storytelling',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '20 hours'
  },
  {
    ResourceID: 'R018',
    SkillID: 'S017', // Intercultural Communication
    Title: 'Intercultural Competence in the Workplace',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/languages/intercultural-competence-the-workplace',
    Type: 'Course',
    Level: 'Intermediate',
    Access: 'Free',
    Duration: '12 hours'
  },
  {
    ResourceID: 'R019',
    SkillID: 'S018', // Professional Ethics
    Title: 'Business Ethics',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/money-business/business-ethics',
    Type: 'Course',
    Level: 'Intermediate',
    Access: 'Free',
    Duration: '5 hours'
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
