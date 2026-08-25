const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const studentRoutes = require('./students');
const academicProfileRoutes = require('./academicProfile');
const universityRoutes = require('./universities');
const degreeRoutes = require('./degrees');
const recommendationRoutes = require('./recommendations');
const skillRoutes = require('./skills');
const roadmapRoutes = require('./roadmaps');
const adminRoutes = require('./admin');
const careerRoutes = require('./careers');
const subjectCombinationRoutes = require('./subjectCombinations');

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/academic-profile', academicProfileRoutes);
router.use('/universities', universityRoutes);
router.use('/degrees', degreeRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/skills', skillRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/admin', adminRoutes);
router.use('/careers', careerRoutes);
router.use('/subject-combinations', subjectCombinationRoutes);

module.exports = router;
