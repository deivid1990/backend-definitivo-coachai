const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/hoy', trainingController.getTodayRoutine);
router.post('/feedback', trainingController.submitFeedback);

module.exports = router;