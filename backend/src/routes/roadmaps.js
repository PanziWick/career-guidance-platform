const express = require('express');
const { generateRoadmap, getRoadmaps } = require('../controllers/roadmapController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, generateRoadmap);
router.get('/', authenticate, getRoadmaps);

module.exports = router;
