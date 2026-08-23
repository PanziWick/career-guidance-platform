const express = require('express');
const { listCareers, getCareer } = require('../controllers/careerController');

const router = express.Router();

router.get('/', listCareers);
router.get('/:id', getCareer);

module.exports = router;
