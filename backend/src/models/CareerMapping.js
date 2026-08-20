const mongoose = require('mongoose');

const careerMappingSchema = new mongoose.Schema(
  {
    degreeId: {
      type: String,
      required: true,
      ref: 'DegreeProgramme',
    },
    careerId: {
      type: String,
      required: true,
      ref: 'Career',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

careerMappingSchema.index({ degreeId: 1, careerId: 1 }, { unique: true });

module.exports = mongoose.model('CareerMapping', careerMappingSchema);
