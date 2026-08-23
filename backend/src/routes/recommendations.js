const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

router.post('/', authenticate, recommendationController.generate);
router.get('/', authenticate, recommendationController.getHistory);


module.exports = router;
