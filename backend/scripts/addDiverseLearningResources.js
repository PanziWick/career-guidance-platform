const XLSX = require('xlsx');
const path = require('path');

const DATASET_PATH = path.resolve(__dirname, '../../dataset/GuidanceDataset.xlsx');

const diverseResources = [
  // S004: Programming
  { ResourceID: 'R020', SkillID: 'S004', Title: 'CS50: Introduction to Computer Science', Provider: 'edX / Harvard', URL: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x', Type: 'Course', Level: 'Beginner', Access: 'Free', Duration: '12 weeks' },
  { ResourceID: 'R021', SkillID: 'S004', Title: '100 Days of Code: The Complete Python Pro Bootcamp', Provider: 'Udemy', URL: 'https://www.udemy.com/course/100-days-of-code/', Type: 'Course', Level: 'Beginner', Access: 'Paid', Duration: '60 hours' },
  // S005: Database Management
  { ResourceID: 'R022', SkillID: 'S005', Title: 'Intro to Relational Databases', Provider: 'Udacity', URL: 'https://www.udacity.com/course/intro-to-relational-databases--ud197', Type: 'Course', Level: 'Intermediate', Access: 'Free', Duration: '4 weeks' },
  { ResourceID: 'R023', SkillID: 'S005', Title: 'SQL Tutorial Full Database Course for Beginners', Provider: 'YouTube (freeCodeCamp)', URL: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', Type: 'Video', Level: 'Beginner', Access: 'Free', Duration: '4 hours' },
  // S001: Communication
  { ResourceID: 'R024', SkillID: 'S001', Title: 'Communicating with Confidence', Provider: 'LinkedIn Learning', URL: 'https://www.linkedin.com/learning/communicating-with-confidence', Type: 'Course', Level: 'Beginner', Access: 'Subscription', Duration: '1 hour' },
  // S008: Problem Solving
  { ResourceID: 'R025', SkillID: 'S008', Title: 'Problem Solving (Basic)', Provider: 'HackerRank', URL: 'https://www.hackerrank.com/skills-verification/problem_solving_basic', Type: 'Practice/Certification', Level: 'Beginner', Access: 'Free', Duration: 'Self-paced' },
  // S009: Teamwork
  { ResourceID: 'R026', SkillID: 'S009', Title: 'Teamwork & Collaboration', Provider: 'Coursera', URL: 'https://www.coursera.org/learn/leadership-collaboration', Type: 'Course', Level: 'Intermediate', Access: 'Free', Duration: '3 weeks' },
  // S002: Critical Thinking
  { ResourceID: 'R027', SkillID: 'S002', Title: 'Critical Thinking Masterclass', Provider: 'Udemy', URL: 'https://www.udemy.com/course/critical-thinking-masterclass/', Type: 'Course', Level: 'Mixed', Access: 'Paid', Duration: '2.5 hours' },
  // S003: Leadership
  { ResourceID: 'R028', SkillID: 'S003', Title: 'Exercising Leadership: Foundational Principles', Provider: 'edX / Harvard', URL: 'https://www.edx.org/course/exercising-leadership-foundational-principles', Type: 'Course', Level: 'Beginner', Access: 'Free', Duration: '4 weeks' },
  // S006: Public Speaking
  { ResourceID: 'R029', SkillID: 'S006', Title: 'TED Masterclass: The Official Guide to Public Speaking', Provider: 'TED', URL: 'https://masterclass.ted.com/', Type: 'Course', Level: 'Mixed', Access: 'Paid', Duration: 'Self-paced' },
  // S007: Research
  { ResourceID: 'R030', SkillID: 'S007', Title: 'Clinical Research', Provider: 'Coursera', URL: 'https://www.coursera.org/learn/clinical-research', Type: 'Course', Level: 'Beginner', Access: 'Free', Duration: '3 weeks' },
  // S010: Writing Skills
  { ResourceID: 'R031', SkillID: 'S010', Title: 'Ninja Writing: The Four Levels Of Writing Mastery', Provider: 'Udemy', URL: 'https://www.udemy.com/course/ninja-writing-the-four-levels-of-writing-mastery/', Type: 'Course', Level: 'Intermediate', Access: 'Paid', Duration: '4.5 hours' },
  // S011: Linguistic Proficiency
  { ResourceID: 'R032', SkillID: 'S011', Title: 'Babbel Language Learning', Provider: 'Babbel', URL: 'https://www.babbel.com/', Type: 'Learning Platform', Level: 'Mixed', Access: 'Paid/Subscription', Duration: 'Self-paced' },
  { ResourceID: 'R033', SkillID: 'S011', Title: 'Rosetta Stone', Provider: 'Rosetta Stone', URL: 'https://www.rosettastone.com/', Type: 'Learning Platform', Level: 'Mixed', Access: 'Paid', Duration: 'Self-paced' },
  // S012: Legal Research
  { ResourceID: 'R034', SkillID: 'S012', Title: 'American Law', Provider: 'Coursera', URL: 'https://www.coursera.org/learn/american-law', Type: 'Course', Level: 'Intermediate', Access: 'Free', Duration: '4 weeks' },
  // S013: Creative Content Production
  { ResourceID: 'R035', SkillID: 'S013', Title: 'Premiere Pro CC for Beginners: Video Editing in Premiere', Provider: 'Udemy', URL: 'https://www.udemy.com/course/adobe-premiere-pro-video-editing/', Type: 'Course', Level: 'Beginner', Access: 'Paid', Duration: '25 hours' },
  // S014: Qualitative Data Analysis
  { ResourceID: 'R036', SkillID: 'S014', Title: 'Data Analysis with R Programming', Provider: 'Coursera / Google', URL: 'https://www.coursera.org/learn/data-analysis-with-r', Type: 'Course', Level: 'Beginner', Access: 'Free', Duration: '36 hours' },
  // S015: Conflict Resolution
  { ResourceID: 'R037', SkillID: 'S015', Title: 'Negotiation Skills', Provider: 'Coursera', URL: 'https://www.coursera.org/learn/negotiation-skills', Type: 'Course', Level: 'Intermediate', Access: 'Free', Duration: '4 weeks' },
  // S016: GIS and Mapping
  { ResourceID: 'R038', SkillID: 'S016', Title: 'QGIS for Beginners', Provider: 'YouTube (Klas Karlsson)', URL: 'https://www.youtube.com/playlist?list=PL7MWEc0SRNQTQ4Hw6P_F9t2X-C4g-oQ3u', Type: 'Playlist', Level: 'Beginner', Access: 'Free', Duration: '3 hours' },
  // S017: Intercultural Communication
  { ResourceID: 'R039', SkillID: 'S017', Title: 'Intercultural Communication Courses', Provider: 'Coursera', URL: 'https://www.coursera.org/courses?query=intercultural+communication', Type: 'Course Catalog', Level: 'Mixed', Access: 'Mixed', Duration: 'Variable' },
  // S018: Professional Ethics
  { ResourceID: 'R040', SkillID: 'S018', Title: 'Ethics in Action', Provider: 'edX / SDG Academy', URL: 'https://www.edx.org/course/ethics-in-action', Type: 'Course', Level: 'Mixed', Access: 'Free', Duration: '6 weeks' }
];

console.log('Loading workbook...');
const workbook = XLSX.readFile(DATASET_PATH);

if (!workbook.SheetNames.includes('Learning Resources')) {
  console.log('Sheet "Learning Resources" does not exist!');
  process.exit(1);
}

console.log('Appending more resources...');
const existingData = XLSX.utils.sheet_to_json(workbook.Sheets['Learning Resources']);
const updatedData = [...existingData, ...diverseResources];

workbook.Sheets['Learning Resources'] = XLSX.utils.json_to_sheet(updatedData);

XLSX.writeFile(workbook, DATASET_PATH);
console.log(`Successfully appended ${diverseResources.length} diverse resources! Total is now ${updatedData.length}.`);
