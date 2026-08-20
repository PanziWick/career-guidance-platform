const mongoose = require('mongoose');

const subjectCombinationSchema = new mongoose.Schema(
  {
    combinationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subject1: {
      type: String,
      required: true,
      trim: true,
    },
    subject2: {
      type: String,
      required: true,
      trim: true,
    },
    subject3: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubjectCombination', subjectCombinationSchema);
