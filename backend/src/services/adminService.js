const University = require('../models/University');
const DegreeProgramme = require('../models/DegreeProgramme');
const Career = require('../models/Career');
const Skill = require('../models/Skill');
const CareerMapping = require('../models/CareerMapping');
const LearningResource = require('../models/LearningResource');
const RecommendationRule = require('../models/RecommendationRule');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class AdminService {
  async getDashboardStats() {
    const [
      universities,
      degrees,
      careers,
      skills,
      careerMappings,
      learningResources,
      recommendationRules,
      totalUsers,
      activeUsers,
      inactiveUsers
    ] = await Promise.all([
      University.countDocuments(),
      DegreeProgramme.countDocuments(),
      Career.countDocuments(),
      Skill.countDocuments(),
      CareerMapping.countDocuments(),
      LearningResource.countDocuments(),
      RecommendationRule.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false })
    ]);

    return {
      universities,
      degrees,
      careers,
      skills,
      careerMappings,
      learningResources,
      recommendationRules,
      users: { total: totalUsers, active: activeUsers, inactive: inactiveUsers }
    };
  }

  // --- Users ---
  async getUsers(query = {}) {
    const filter = {};

    // Filter by role if provided
    if (query.role && ['student', 'admin'].includes(query.role)) {
      filter.role = query.role;
    }

    // Filter by active status if provided
    if (query.status === 'active') {
      filter.isActive = true;
    } else if (query.status === 'inactive') {
      filter.isActive = false;
    }

    // Search by name or email
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }

    return User.find(filter).sort({ createdAt: -1 });
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async toggleUserStatus(id, adminUserId) {
    // Prevent admins from deactivating themselves
    if (id === adminUserId) {
      throw new AppError('You cannot deactivate your own account', 400);
    }

    const user = await User.findById(id);
    if (!user) throw new AppError('User not found', 404);

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }

  // --- Universities ---
  async getUniversities(query = {}) {
    return University.find(query).sort({ name: 1 });
  }

  async getUniversityById(id) {
    const university = await University.findById(id);
    if (!university) throw new AppError('University not found', 404);
    return university;
  }

  async createUniversity(data) {
    const existing = await University.findOne({ universityId: data.universityId });
    if (existing) throw new AppError('University ID already exists', 400);
    return University.create(data);
  }

  async updateUniversity(id, data) {
    const university = await University.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!university) throw new AppError('University not found', 404);
    return university;
  }

  async deleteUniversity(id) {
    const university = await University.findById(id);
    if (!university) throw new AppError('University not found', 404);

    const referencedDegrees = await DegreeProgramme.countDocuments({ universityId: university.universityId });
    if (referencedDegrees > 0) {
      throw new AppError('Cannot delete university. It is referenced by one or more degree programmes.', 400);
    }

    await University.findByIdAndDelete(id);
    return { message: 'University deleted successfully' };
  }

  // --- Degrees ---
  async getDegrees(query = {}) {
    return DegreeProgramme.find(query).sort({ name: 1 });
  }

  async getDegreeById(id) {
    const degree = await DegreeProgramme.findById(id);
    if (!degree) throw new AppError('Degree not found', 404);
    return degree;
  }

  async createDegree(data) {
    const existing = await DegreeProgramme.findOne({ degreeId: data.degreeId });
    if (existing) throw new AppError('Degree ID already exists', 400);
    return DegreeProgramme.create(data);
  }

  async updateDegree(id, data) {
    const degree = await DegreeProgramme.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!degree) throw new AppError('Degree not found', 404);
    return degree;
  }

  async deleteDegree(id) {
    const degree = await DegreeProgramme.findById(id);
    if (!degree) throw new AppError('Degree not found', 404);

    const referencedMappings = await CareerMapping.countDocuments({ degreeId: degree.degreeId });
    if (referencedMappings > 0) {
      throw new AppError('Cannot delete degree. It is referenced by one or more career mappings.', 400);
    }

    await DegreeProgramme.findByIdAndDelete(id);
    return { message: 'Degree deleted successfully' };
  }

  // --- Careers ---
  async getCareers(query = {}) {
    return Career.find(query).sort({ name: 1 });
  }

  async getCareerById(id) {
    const career = await Career.findById(id);
    if (!career) throw new AppError('Career not found', 404);
    return career;
  }

  async createCareer(data) {
    const existing = await Career.findOne({ careerId: data.careerId });
    if (existing) throw new AppError('Career ID already exists', 400);
    return Career.create(data);
  }

  async updateCareer(id, data) {
    const career = await Career.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!career) throw new AppError('Career not found', 404);
    return career;
  }

  async deleteCareer(id) {
    const career = await Career.findById(id);
    if (!career) throw new AppError('Career not found', 404);

    const referencedMappings = await CareerMapping.countDocuments({ careerId: career.careerId });
    if (referencedMappings > 0) {
      throw new AppError('Cannot delete career. It is referenced by one or more career mappings.', 400);
    }

    await Career.findByIdAndDelete(id);
    return { message: 'Career deleted successfully' };
  }

  // --- Skills ---
  async getSkills(query = {}) {
    return Skill.find(query).sort({ name: 1 });
  }

  async getSkillById(id) {
    const skill = await Skill.findById(id);
    if (!skill) throw new AppError('Skill not found', 404);
    return skill;
  }

  async createSkill(data) {
    const existing = await Skill.findOne({ skillId: data.skillId });
    if (existing) throw new AppError('Skill ID already exists', 400);
    return Skill.create(data);
  }

  async updateSkill(id, data) {
    const skill = await Skill.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!skill) throw new AppError('Skill not found', 404);
    return skill;
  }

  async deleteSkill(id) {
    const skill = await Skill.findById(id);
    if (!skill) throw new AppError('Skill not found', 404);

    // Check Career references (requiredSkills array)
    const referencedCareers = await Career.countDocuments({ requiredSkills: skill.skillId });
    if (referencedCareers > 0) {
      throw new AppError('Cannot delete skill. It is required by one or more careers.', 400);
    }

    // Check LearningResource references
    const referencedResources = await LearningResource.countDocuments({ skillId: skill._id });
    if (referencedResources > 0) {
      throw new AppError('Cannot delete skill. It is referenced by one or more learning resources.', 400);
    }

    await Skill.findByIdAndDelete(id);
    return { message: 'Skill deleted successfully' };
  }

  // --- Career Mappings ---
  async getCareerMappings(query = {}) {
    return CareerMapping.find(query);
  }

  async getCareerMappingById(id) {
    const mapping = await CareerMapping.findById(id);
    if (!mapping) throw new AppError('Career mapping not found', 404);
    return mapping;
  }

  async createCareerMapping(data) {
    const existing = await CareerMapping.findOne({ degreeId: data.degreeId, careerId: data.careerId });
    if (existing) throw new AppError('This career mapping already exists', 400);
    
    // Verify degree and career exist
    const degree = await DegreeProgramme.findOne({ degreeId: data.degreeId });
    if (!degree) throw new AppError('Degree not found', 404);

    const career = await Career.findOne({ careerId: data.careerId });
    if (!career) throw new AppError('Career not found', 404);

    return CareerMapping.create(data);
  }

  async updateCareerMapping(id, data) {
    const mapping = await CareerMapping.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!mapping) throw new AppError('Career mapping not found', 404);
    return mapping;
  }

  async deleteCareerMapping(id) {
    const mapping = await CareerMapping.findByIdAndDelete(id);
    if (!mapping) throw new AppError('Career mapping not found', 404);
    return { message: 'Career mapping deleted successfully' };
  }

  // --- Learning Resources ---
  async getLearningResources(query = {}) {
    return LearningResource.find(query).populate('skillId', 'name skillId');
  }

  async getLearningResourceById(id) {
    const resource = await LearningResource.findById(id);
    if (!resource) throw new AppError('Learning resource not found', 404);
    return resource;
  }

  async createLearningResource(data) {
    const existing = await LearningResource.findOne({ resourceId: data.resourceId });
    if (existing) throw new AppError('Resource ID already exists', 400);

    // Validate URL basic structure
    if (data.url && !/^https?:\/\//.test(data.url)) {
      throw new AppError('Invalid URL provided', 400);
    }

    const skill = await Skill.findById(data.skillId);
    if (!skill) throw new AppError('Referenced skill not found', 404);

    return LearningResource.create(data);
  }

  async updateLearningResource(id, data) {
    if (data.url && !/^https?:\/\//.test(data.url)) {
      throw new AppError('Invalid URL provided', 400);
    }

    // if skillId is changing, we must verify the new one exists
    if (data.skillId) {
      const skill = await Skill.findById(data.skillId);
      if (!skill) throw new AppError('Referenced skill not found', 404);
    }

    const resource = await LearningResource.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!resource) throw new AppError('Learning resource not found', 404);
    return resource;
  }

  async deleteLearningResource(id) {
    const resource = await LearningResource.findByIdAndDelete(id);
    if (!resource) throw new AppError('Learning resource not found', 404);
    return { message: 'Learning resource deleted successfully' };
  }

  // --- Recommendation Rules ---
  async getRecommendationRules(query = {}) {
    return RecommendationRule.find(query);
  }

  async getRecommendationRuleById(id) {
    const rule = await RecommendationRule.findById(id);
    if (!rule) throw new AppError('Recommendation rule not found', 404);
    return rule;
  }

  async createRecommendationRule(data) {
    const existing = await RecommendationRule.findOne({ ruleId: data.ruleId });
    if (existing) throw new AppError('Rule ID already exists', 400);
    return RecommendationRule.create(data);
  }

  async updateRecommendationRule(id, data) {
    const rule = await RecommendationRule.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!rule) throw new AppError('Recommendation rule not found', 404);
    return rule;
  }

  async deleteRecommendationRule(id) {
    const rule = await RecommendationRule.findByIdAndDelete(id);
    if (!rule) throw new AppError('Recommendation rule not found', 404);
    return { message: 'Recommendation rule deleted successfully' };
  }
}

module.exports = new AdminService();
