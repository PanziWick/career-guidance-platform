const mongoose = require('mongoose');

const recommendationRuleSchema = new mongoose.Schema(
  {
    ruleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subjects: {
      type: String,
      required: true,
      trim: true,
    },
    interest: {
      type: String,
      required: true,
      trim: true,
    },
    recommend: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecommendationRule', recommendationRuleSchema);
