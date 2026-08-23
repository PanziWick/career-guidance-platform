const mongoose = require('mongoose');

const VALID_OL_GRADES = ['A', 'B', 'C', 'S', 'F'];
const VALID_AL_GRADES = ['A', 'B', 'C', 'S', 'F'];
const VALID_STREAMS = ['Arts'];

const resultEntrySchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      minlength: [1, 'Subject name cannot be empty'],
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true,
    },
  },
  { _id: false }
);

const academicProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    stream: {
      type: String,
      enum: {
        values: VALID_STREAMS,
        message: 'Unsupported stream: {VALUE}',
      },
      default: 'Arts',
    },
    subjectCombinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubjectCombination',
    },
    olResults: {
      type: [resultEntrySchema],
      default: [],
    },
    alResults: {
      type: [resultEntrySchema],
      default: [],
    },
    zScore: {
      type: Number,
    },
    districtRank: {
      type: Number,
    },
    interests: {
      type: [String],
      default: [],
    },
    careerPreferences: {
      type: [String],
      default: [],
    },
    existingSkills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Lightweight completeness check for downstream recommendation readiness
academicProfileSchema.methods.getProfileCompleteness = function () {
  const fields = {
    olResults: this.olResults && this.olResults.length > 0,
    alResults: this.alResults && this.alResults.length > 0,
    subjectCombinationId: !!this.subjectCombinationId,
    interests: this.interests && this.interests.length > 0,
    careerPreferences: this.careerPreferences && this.careerPreferences.length > 0,
  };
  const isComplete = Object.values(fields).every(Boolean);
  return { isComplete, fields };
};

academicProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AcademicProfile', academicProfileSchema);
module.exports.VALID_OL_GRADES = VALID_OL_GRADES;
module.exports.VALID_AL_GRADES = VALID_AL_GRADES;
module.exports.VALID_STREAMS = VALID_STREAMS;
