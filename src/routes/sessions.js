const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', sessionController.getSessions);
router.post('/', sessionController.createSession);
router.delete('/:id', sessionController.deleteSession);
router.put('/:id', sessionController.updateSession);

module.exports = router;