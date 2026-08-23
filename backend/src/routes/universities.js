const express = require('express');
const { listUniversities, getUniversity } = require('../controllers/universityController');

const router = express.Router();

router.get('/', listUniversities);
router.get('/:id', getUniversity);

module.exports = router;
