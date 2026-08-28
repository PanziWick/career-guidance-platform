const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorise } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticate, authorise('admin'));

router.get('/dashboard-stats', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

// Universities
router.route('/universities')
  .get(adminController.getUniversities)
  .post(adminController.createUniversity);
router.route('/universities/:id')
  .get(adminController.getUniversity)
  .put(adminController.updateUniversity)
  .delete(adminController.deleteUniversity);

// Degrees
router.route('/degrees')
  .get(adminController.getDegrees)
  .post(adminController.createDegree);
router.route('/degrees/:id')
  .get(adminController.getDegree)
  .put(adminController.updateDegree)
  .delete(adminController.deleteDegree);

// Careers
router.route('/careers')
  .get(adminController.getCareers)
  .post(adminController.createCareer);
router.route('/careers/:id')
  .get(adminController.getCareer)
  .put(adminController.updateCareer)
  .delete(adminController.deleteCareer);

// Skills
router.route('/skills')
  .get(adminController.getSkills)
  .post(adminController.createSkill);
router.route('/skills/:id')
  .get(adminController.getSkill)
  .put(adminController.updateSkill)
  .delete(adminController.deleteSkill);

// Career Mappings
router.route('/career-mappings')
  .get(adminController.getCareerMappings)
  .post(adminController.createCareerMapping);
router.route('/career-mappings/:id')
  .get(adminController.getCareerMapping)
  .put(adminController.updateCareerMapping)
  .delete(adminController.deleteCareerMapping);

// Learning Resources
router.route('/learning-resources')
  .get(adminController.getLearningResources)
  .post(adminController.createLearningResource);
router.route('/learning-resources/:id')
  .get(adminController.getLearningResource)
  .put(adminController.updateLearningResource)
  .delete(adminController.deleteLearningResource);

// Recommendation Rules
router.route('/recommendation-rules')
  .get(adminController.getRecommendationRules)
  .post(adminController.createRecommendationRule);
router.route('/recommendation-rules/:id')
  .get(adminController.getRecommendationRule)
  .put(adminController.updateRecommendationRule)
  .delete(adminController.deleteRecommendationRule);

module.exports = router;
