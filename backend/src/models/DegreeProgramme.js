const mongoose = require('mongoose');

const degreeProgrammeSchema = new mongoose.Schema(
  {
    degreeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    universityId: {
      type: String,
      required: true,
      ref: 'University',
    },
    type: {
      type: String,
      enum: ['State', 'Private'],
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    minimumRequirement: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DegreeProgramme', degreeProgrammeSchema);
