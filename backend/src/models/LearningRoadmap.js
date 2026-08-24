const mongoose = require('mongoose');

const learningRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetCareer: {
      careerId: { type: String, ref: 'Career' },
      name: String,
    },
    targetDegree: {
      degreeId: { type: String, ref: 'DegreeProgramme' },
      name: String,
    },
    milestones: [
      {
        title: String,
        description: String,
        order: Number,
        isCompleted: { type: Boolean, default: false },
        unavailableResources: { type: Boolean, default: false },
        resources: [
          {
            title: String,
            url: String,
            provider: String,
            type: { type: String },
            level: String,
            access: String,
            duration: String,
          }
        ],
      },
    ],
    skills: [
      {
        skillId: { type: String, ref: 'Skill' },
        name: String,
        currentLevel: {
          type: String,
          enum: ['none', 'beginner', 'intermediate', 'advanced'],
          default: 'none',
        },
        targetLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
          default: 'intermediate',
        },
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningRoadmap', learningRoadmapSchema);
