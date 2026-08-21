const mongoose = require('mongoose');

const academicProfileSchema = new mongoose.Schema(
  {
    // One profile per student — enforced at DB level
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
    // Map of subject → grade (e.g. { "Mathematics": "A", "English": "B" })
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
