const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getMyAcademicProfile,
  updateMyAcademicProfile,
} = require('../controllers/academicProfileController');

const router = express.Router();

router.get('/me', authenticate, getMyAcademicProfile);
router.put('/me', authenticate, updateMyAcademicProfile);

module.exports = router;
