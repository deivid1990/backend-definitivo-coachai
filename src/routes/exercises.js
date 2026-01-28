const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController'); 
const authMiddleware = require('../middleware/auth'); 

router.use(authMiddleware);

router.get('/', exerciseController.getAllExercises);
router.post('/', exerciseController.createExercise);
// router.delete('/:id', exerciseController.deleteExercise); // Descomenta si lo implementaste

module.exports = router;