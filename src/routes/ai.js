const express = require('express');
const router = express.Router();

// 1. IMPORTACIÓN DE CONTROLADORES
// Asegúrate de que estos archivos existan en la carpeta 'controllers'
const aiController = require('../controllers/aiController');
const adjustmentController = require('../controllers/adjustmentController');
const authMiddleware = require('../middleware/auth');

/**
 * RUTAS DE INTELIGENCIA ARTIFICIAL
 * Prefijo base: /api/ai
 */

// Todas las rutas de IA requieren autenticación
router.use(authMiddleware);

// @route   POST /api/ai/chat
// @desc    Maneja la conversación fluida con el entrenador IA
router.post('/chat', aiController.chat);

// @route   POST /api/ai/generar-rutina
// @desc    Solicita a la IA que cree una rutina completa en formato JSON
router.post('/generar-rutina', aiController.generateRoutine);

// @route   POST /api/ai/adjust
// @desc    Analiza el progreso del usuario y ajusta las cargas o repeticiones
router.post('/adjust', adjustmentController.analyzeAndAdjust);

// 2. EXPORTACIÓN DEL ENRUTADOR
module.exports = router;