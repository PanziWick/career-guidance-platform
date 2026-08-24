const XLSX = require('xlsx');
const path = require('path');

const DATASET_PATH = path.resolve(__dirname, '../../dataset/GuidanceDataset.xlsx');

const resources = [
  {
    ResourceID: 'R001',
    SkillID: 'S004', // Programming
    Title: 'JavaScript Algorithms and Data Structures',
    Provider: 'freeCodeCamp',
    URL: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '300 hours'
  },
  {
    ResourceID: 'R002',
    SkillID: 'S004', // Programming
    Title: 'Python for Everybody',
    Provider: 'freeCodeCamp',
    URL: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '300 hours'
  },
  {
    ResourceID: 'R003',
    SkillID: 'S005', // Database Management
    Title: 'Azure Data Fundamentals',
    Provider: 'Microsoft Learn',
    URL: 'https://learn.microsoft.com/en-us/training/paths/azure-data-fundamentals-explore-core-data-concepts/',
    Type: 'Learning Path',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '2 hours'
  },
  {
    ResourceID: 'R004',
    SkillID: 'S016', // GIS and Mapping
    Title: 'GIS Training Catalog',
    Provider: 'Esri',
    URL: 'https://www.esri.com/training/catalog/search/',
    Type: 'Course Catalog',
    Level: 'Mixed',
    Access: 'Mixed',
    Duration: ''
  },
  {
    ResourceID: 'R005',
    SkillID: 'S012', // Legal Research & Drafting
    Title: 'Introduction to Law',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/society-politics-law/law',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: ''
  },
  {
    ResourceID: 'R006',
    SkillID: 'S014', // Qualitative Data Analysis
    Title: 'Data Analysis in Business',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/money-business/qualitative-data-analysis',
    Type: 'Course',
    Level: 'Intermediate',
    Access: 'Free',
    Duration: '10 hours'
  },
  {
    ResourceID: 'R007',
    SkillID: 'S015', // Conflict Resolution & Mediation
    Title: 'Conflict Resolution',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/money-business/leadership-management/conflict-resolution',
    Type: 'Course',
    Level: 'Intermediate',
    Access: 'Free',
    Duration: '6 hours'
  },
  {
    ResourceID: 'R008',
    SkillID: 'S001', // Communication
    Title: 'Effective Communication',
    Provider: 'OpenLearn',
    URL: 'https://www.open.edu/openlearn/money-business/leadership-management/effective-communication-the-workplace',
    Type: 'Course',
    Level: 'Beginner',
    Access: 'Free',
    Duration: '12 hours'
  }
];

console.log('Loading workbook...');
const workbook = XLSX.readFile(DATASET_PATH);

if (workbook.SheetNames.includes('Learning Resources')) {
  console.log('Sheet "Learning Resources" already exists. Updating it...');
  workbook.Sheets['Learning Resources'] = XLSX.utils.json_to_sheet(resources);
} else {
  console.log('Appending new sheet "Learning Resources"...');
  const newSheet = XLSX.utils.json_to_sheet(resources);
  XLSX.utils.book_append_sheet(workbook, newSheet, 'Learning Resources');
}

XLSX.writeFile(workbook, DATASET_PATH);
console.log(`Successfully saved dataset with ${resources.length} verified learning resources!`);
