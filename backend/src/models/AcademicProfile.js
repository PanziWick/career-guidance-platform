const mongoose = require('mongoose');

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
      default: 'Arts',
    },
    subjectCombinationId: {
      type: String,
      ref: 'SubjectCombination',
    },
    olResults: {
      type: Map,
      of: String,
    },
    alResults: {
      type: Map,
      of: String,
    },
    zScore: {
      type: Number,
    },
    districtRank: {
      type: Number,
    },
    interests: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AcademicProfile', academicProfileSchema);
