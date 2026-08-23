const express = require('express');
const { listDegrees, getDegree } = require('../controllers/degreeController');

const router = express.Router();

router.get('/', listDegrees);
router.get('/:id', getDegree);

module.exports = router;
