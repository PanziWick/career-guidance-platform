const express = require('express');
const { listSkills, getSkill, analyzeGap } = require('../controllers/skillController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', listSkills);
router.post('/gap-analysis', authenticate, analyzeGap);
router.get('/:id', getSkill);

module.exports = router;
