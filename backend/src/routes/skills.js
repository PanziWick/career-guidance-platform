const express = require('express');
const { listSkills, getSkill } = require('../controllers/skillController');

const router = express.Router();

router.get('/', listSkills);
router.get('/:id', getSkill);

module.exports = router;
