const express = require('express');
const { listCombinations, getCombination } = require('../controllers/subjectCombinationController');

const router = express.Router();

router.get('/', listCombinations);
router.get('/:id', getCombination);

module.exports = router;
