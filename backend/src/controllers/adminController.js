const adminService = require('../services/adminService');

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      res.status(200).json({ status: 'success', data: stats });
    } catch (err) {
      next(err);
    }
  }

  // --- Users ---
  async getUsers(req, res, next) {
    try {
      const users = await adminService.getUsers(req.query);
      res.status(200).json({ status: 'success', data: users });
    } catch (err) {
      next(err);
    }
  }

  async getUser(req, res, next) {
    try {
      const user = await adminService.getUserById(req.params.id);
      res.status(200).json({ status: 'success', data: user });
    } catch (err) {
      next(err);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const user = await adminService.toggleUserStatus(req.params.id, req.user._id.toString());
      res.status(200).json({
        status: 'success',
        data: user,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (err) {
      next(err);
    }
  }

  // --- Universities ---
  async getUniversities(req, res, next) {
    try {
      const universities = await adminService.getUniversities(req.query);
      res.status(200).json({ status: 'success', data: universities });
    } catch (err) {
      next(err);
    }
  }

  async getUniversity(req, res, next) {
    try {
      const university = await adminService.getUniversityById(req.params.id);
      res.status(200).json({ status: 'success', data: university });
    } catch (err) {
      next(err);
    }
  }

  async createUniversity(req, res, next) {
    try {
      const university = await adminService.createUniversity(req.body);
      res.status(201).json({ status: 'success', data: university });
    } catch (err) {
      next(err);
    }
  }

  async updateUniversity(req, res, next) {
    try {
      const university = await adminService.updateUniversity(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: university });
    } catch (err) {
      next(err);
    }
  }

  async deleteUniversity(req, res, next) {
    try {
      await adminService.deleteUniversity(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  }

  // --- Degrees ---
  async getDegrees(req, res, next) {
    try {
      const degrees = await adminService.getDegrees(req.query);
      res.status(200).json({ status: 'success', data: degrees });
    } catch (err) {
      next(err);
    }
  }

  async getDegree(req, res, next) {
    try {
      const degree = await adminService.getDegreeById(req.params.id);
      res.status(200).json({ status: 'success', data: degree });
    } catch (err) {
      next(err);
    }
  }

  async createDegree(req, res, next) {
    try {
      const degree = await adminService.createDegree(req.body);
      res.status(201).json({ status: 'success', data: degree });
    } catch (err) {
      next(err);
    }
  }

  async updateDegree(req, res, next) {
    try {
      const degree = await adminService.updateDegree(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: degree });
    } catch (err) {
      next(err);
    }
  }

  async deleteDegree(req, res, next) {
    try {
      await adminService.deleteDegree(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  }

  // --- Careers ---
  async getCareers(req, res, next) {
    try {
      const careers = await adminService.getCareers(req.query);
      res.status(200).json({ status: 'success', data: careers });
    } catch (err) {
      next(err);
    }
  }

  async getCareer(req, res, next) {
    try {
      const career = await adminService.getCareerById(req.params.id);
      res.status(200).json({ status: 'success', data: career });
    } catch (err) {
      next(err);
    }
  }

  async createCareer(req, res, next) {
    try {
      const career = await adminService.createCareer(req.body);
      res.status(201).json({ status: 'success', data: career });
    } catch (err) {
      next(err);
    }
  }

  async updateCareer(req, res, next) {
    try {
      const career = await adminService.updateCareer(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: career });
    } catch (err) {
      next(err);
    }
  }

  async deleteCareer(req, res, next) {
    try {
      await adminService.deleteCareer(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  }

  // --- Skills ---
  async getSkills(req, res, next) {
    try {
      const skills = await adminService.getSkills(req.query);
      res.status(200).json({ status: 'success', data: skills });
    } catch (err) {
      next(err);
    }
  }

  async getSkill(req, res, next) {
    try {
      const skill = await adminService.getSkillById(req.params.id);
      res.status(200).json({ status: 'success', data: skill });
    } catch (err) {
      next(err);
    }
  }

  async createSkill(req, res, next) {
    try {
      const skill = await adminService.createSkill(req.body);
      res.status(201).json({ status: 'success', data: skill });
    } catch (err) {
      next(err);
    }
  }

  async updateSkill(req, res, next) {
    try {
      const skill = await adminService.updateSkill(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: skill });
    } catch (err) {
      next(err);
    }
  }

  async deleteSkill(req, res, next) {
    try {
      await adminService.deleteSkill(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  }

  // --- Career Mappings ---
  async getCareerMappings(req, res, next) {
    try {
      const mappings = await adminService.getCareerMappings(req.query);
      res.status(200).json({ status: 'success', data: mappings });
    } catch (err) {
      next(err);
    }
  }

  async getCareerMapping(req, res, next) {
    try {
      const mapping = await adminService.getCareerMappingById(req.params.id);
      res.status(200).json({ status: 'success', data: mapping });
    } catch (err) {
      next(err);
    }
  }

  async createCareerMapping(req, res, next) {
    try {
      const mapping = await adminService.createCareerMapping(req.body);
      res.status(201).json({ status: 'success', data: mapping });
    } catch (err) {
      next(err);
    }
  }

  async updateCareerMapping(req, res, next) {
    try {
      const mapping = await adminService.updateCareerMapping(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: mapping });
    } catch (err) {
      next(err);
    }
  }

  async deleteCareerMapping(req, res, next) {
    try {
      await adminService.deleteCareerMapping(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  }

  // --- Learning Resources ---
  async getLearningResources(req, res, next) {
    try {
      const resources = await adminService.getLearningResources(req.query);
      res.status(200).json({ status: 'success', data: resources });
    } catch (err) {
      next(err);
    }
  }

  async getLearningResource(req, res, next) {
    try {
      const resource = await adminService.getLearningResourceById(req.params.id);
      res.status(200).json({ status: 'success', data: resource });
    } catch (err) {
      next(err);
    }
  }

  async createLearningResource(req, res, next) {
    try {
      const resource = await adminService.createLearningResource(req.body);
      res.status(201).json({ status: 'success', data: resource });
    } catch (err) {
      next(err);
    }
  }

  async updateLearningResource(req, res, next) {
    try {
      const resource = await adminService.updateLearningResource(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: resource });
    } catch (err) {
      next(err);
    }
  }

  async deleteLearningResource(req, res, next) {
    try {
      await adminService.deleteLearningResource(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  }

  // --- Recommendation Rules ---
  async getRecommendationRules(req, res, next) {
    try {
      const rules = await adminService.getRecommendationRules(req.query);
      res.status(200).json({ status: 'success', data: rules });
    } catch (err) {
      next(err);
    }
  }

  async getRecommendationRule(req, res, next) {
    try {
      const rule = await adminService.getRecommendationRuleById(req.params.id);
      res.status(200).json({ status: 'success', data: rule });
    } catch (err) {
      next(err);
    }
  }

  async createRecommendationRule(req, res, next) {
    try {
      const rule = await adminService.createRecommendationRule(req.body);
      res.status(201).json({ status: 'success', data: rule });
    } catch (err) {
      next(err);
    }
  }

  async updateRecommendationRule(req, res, next) {
    try {
      const rule = await adminService.updateRecommendationRule(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: rule });
    } catch (err) {
      next(err);
    }
  }

  async deleteRecommendationRule(req, res, next) {
    try {
      await adminService.deleteRecommendationRule(req.params.id);
      res.status(204).json({ status: 'success', data: null });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
