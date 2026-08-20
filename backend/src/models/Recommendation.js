const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recommendedDegrees: [
      {
        degreeId: { type: String, ref: 'DegreeProgramme' },
        score: Number,
        reason: String,
      },
    ],
    recommendedCareers: [
      {
        careerId: { type: String, ref: 'Career' },
        score: Number,
        reason: String,
      },
    ],
    appliedRules: [
      {
        ruleId: { type: String, ref: 'RecommendationRule' },
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
