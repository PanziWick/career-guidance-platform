const mongoose = require('mongoose');
const SubjectCombination = require('../models/SubjectCombination');
const { VALID_OL_GRADES, VALID_AL_GRADES, VALID_STREAMS } = require('../models/AcademicProfile');

/**
 * Each validator returns { valid: boolean, errors: string[] }.
 * The controller collects all errors before responding.
 */

function validateStream(stream) {
  const errors = [];
  if (typeof stream !== 'string') {
    errors.push('Stream must be a string');
  } else if (!VALID_STREAMS.includes(stream)) {
    errors.push(`Unsupported stream: ${stream}. Allowed: ${VALID_STREAMS.join(', ')}`);
  }
  return { valid: errors.length === 0, errors };
}

function validateResultEntries(entries, label, validGrades) {
  const errors = [];

  if (!Array.isArray(entries)) {
    errors.push(`${label} must be an array`);
    return { valid: false, errors };
  }

  const seen = new Set();
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${label}[${i}] must be an object with subject and grade`);
      continue;
    }

    if (!entry.subject || typeof entry.subject !== 'string' || entry.subject.trim().length === 0) {
      errors.push(`${label}[${i}].subject must be a non-empty string`);
      continue;
    }

    if (!entry.grade || typeof entry.grade !== 'string') {
      errors.push(`${label}[${i}].grade must be a string`);
      continue;
    }

    const grade = entry.grade.trim().toUpperCase();
    if (!validGrades.includes(grade)) {
      errors.push(`${label}[${i}].grade '${entry.grade}' is invalid. Allowed: ${validGrades.join(', ')}`);
    }

    const subjectKey = entry.subject.trim().toLowerCase();
    if (seen.has(subjectKey)) {
      errors.push(`${label} contains duplicate subject: ${entry.subject.trim()}`);
    }
    seen.add(subjectKey);
  }

  return { valid: errors.length === 0, errors };
}

function validateOlResults(olResults) {
  return validateResultEntries(olResults, 'olResults', VALID_OL_GRADES);
}

function validateAlResults(alResults) {
  return validateResultEntries(alResults, 'alResults', VALID_AL_GRADES);
}

async function validateSubjectCombination(subjectCombinationId, alSubjects) {
  const errors = [];

  if (!mongoose.Types.ObjectId.isValid(subjectCombinationId)) {
    errors.push('subjectCombinationId must be a valid ID');
    return { valid: false, errors };
  }

  const combination = await SubjectCombination.findById(subjectCombinationId);
  if (!combination) {
    errors.push('Subject combination not found in the dataset');
    return { valid: false, errors };
  }

  // When A/L subjects are provided, verify they match the combination (order-independent)
  if (alSubjects && alSubjects.length > 0) {
    const combinationSubjects = new Set(
      [combination.subject1, combination.subject2, combination.subject3]
        .map((s) => s.toLowerCase().trim())
    );
    const studentSubjects = new Set(
      alSubjects.map((s) => s.toLowerCase().trim())
    );

    if (combinationSubjects.size !== studentSubjects.size) {
      errors.push('A/L subjects do not match the selected subject combination');
    } else {
      for (const s of studentSubjects) {
        if (!combinationSubjects.has(s)) {
          errors.push('A/L subjects do not match the selected subject combination');
          break;
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateStringArray(arr, label) {
  const errors = [];

  if (!Array.isArray(arr)) {
    errors.push(`${label} must be an array`);
    return { valid: false, errors };
  }

  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'string' || arr[i].trim().length === 0) {
      errors.push(`${label}[${i}] must be a non-empty string`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateInterests(interests) {
  return validateStringArray(interests, 'interests');
}

function validateSkills(skills) {
  return validateStringArray(skills, 'existingSkills');
}

function validateCareerPreferences(prefs) {
  return validateStringArray(prefs, 'careerPreferences');
}

module.exports = {
  validateStream,
  validateOlResults,
  validateAlResults,
  validateSubjectCombination,
  validateInterests,
  validateSkills,
  validateCareerPreferences,
};
