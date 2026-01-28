const express = require('express');
const router = express.Router();

/**
 * IMPORTACIÓN DE DEPENDENCIAS
 * - routineController: Contiene la lógica de Supabase para las rutinas.
 * - authMiddleware: Valida el token del usuario y rellena req.user.id.
 */
const routineController = require('../controllers/routineController'); 
const authMiddleware = require('../middleware/auth'); 

// 1. SEGURIDAD GLOBAL 🛡️
// Todas las rutas definidas debajo de esta línea requerirán un token válido de Supabase.
router.use(authMiddleware);

/**
 * DEFINICIÓN DE RUTAS (Prefijo base: /api/rutinas)
 * El flujo es: Cliente -> Router -> Middleware -> Controller -> Supabase
 */

// @route   GET /api/rutinas
// @desc    Obtiene todas las rutinas del usuario autenticado
router.get('/', routineController.getAllRoutines);

// @route   GET /api/rutinas/:id
// @desc    Obtiene el detalle de una rutina específica
router.get('/:id', routineController.getRoutineById);

// @route   POST /api/rutinas
// @desc    Crea una rutina nueva (con sus días y ejercicios)
router.post('/', routineController.createRoutine);

// @route   DELETE /api/rutinas/:id
// @desc    Elimina una rutina por su ID
router.delete('/:id', routineController.deleteRoutine);

// 2. EXPORTACIÓN
module.exports = router;