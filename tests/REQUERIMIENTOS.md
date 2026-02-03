# Trazabilidad: Requerimientos Funcionales → Pruebas

Este documento desglosa las **pruebas unitarias y de integración** por requerimiento funcional (RF), para facilitar la cobertura y la ejecución por RF.

---

## RF-01: Interacción con Coach Virtual IA

**Requerimiento:** El sistema debe permitir al usuario interactuar con un Coach Virtual mediante texto para recibir asesoría y recomendaciones personalizadas de entrenamiento.

| Archivo | Casos de prueba |
|---------|-----------------|
| `controllers/aiController.test.js` | chat: devolver content y routine cuando la IA responde JSON válido; devolver 500 si OpenAI falla. generateRoutine: devolver rutina en JSON; devolver 500 si hay error. |
| `services/aiService.test.js` | chatWithAI: devolver contenido de la respuesta; lanzar error si OpenAI falla. generateRoutinePlan: devolver objeto JSON con rutina; lanzar error si falla. |
| `controllers/adjustmentController.test.js` | devolver 401 si no hay usuario; devolver sugerencia cuando no hay historial; devolver análisis de la IA cuando hay historial. |
| `routes.integration.test.js` | POST /api/ai/chat sin token devuelve 401. |
| `app.test.js` | ruta /api/ai debe existir (responde 401 sin token). |

**Ejecutar solo pruebas de RF-01:**
```bash
npm test -- --testPathPattern="aiController|aiService|adjustmentController" --testNamePattern="RF-01"
```
O ejecutar los archivos que cubren RF-01:
```bash
npm test -- tests/controllers/aiController.test.js tests/services/aiService.test.js tests/controllers/adjustmentController.test.js
```

---

## RF-02: Gestión de rutinas de entrenamiento

**Requerimiento:** El sistema debe permitir al usuario crear, visualizar y gestionar rutinas de entrenamiento personalizadas según sus objetivos y nivel físico.

| Archivo | Casos de prueba |
|---------|-----------------|
| `controllers/routineController.test.js` | getAllRoutines: devolver rutinas del usuario; devolver 500 si hay error. getRoutineById: 404 si no existe; devolver rutina si existe. createRoutine: crear y devolver 201. deleteRoutine: eliminar y mensaje de éxito. |
| `routes.integration.test.js` | GET /api/rutinas sin token devuelve 401. |
| `app.test.js` | ruta /api/rutinas requiere autenticación. |

**Ejecutar solo pruebas de RF-02:**
```bash
npm test -- tests/controllers/routineController.test.js
```

---

## RF-03: Consulta de biblioteca de ejercicios

**Requerimiento:** El sistema debe permitir al usuario visualizar una biblioteca de ejercicios disponibles, con información básica de cada ejercicio.

| Archivo | Casos de prueba |
|---------|-----------------|
| `controllers/exerciseController.test.js` | getAllExercises: devolver lista de ejercicios; 500 si error. createExercise: crear y 201; 500 si falla. updateExercise: mensaje actualizado. deleteExercise: mensaje eliminado. |
| `routes.integration.test.js` | GET /api/ejercicios sin token devuelve 401. |
| `app.test.js` | ruta /api/ejercicios requiere autenticación. |

**Ejecutar solo pruebas de RF-03:**
```bash
npm test -- tests/controllers/exerciseController.test.js
```

---

## RF-04: Registro de sesiones de entrenamiento

**Requerimiento:** El sistema debe permitir al usuario registrar sus sesiones de entrenamiento, incluyendo ejercicios realizados, series, repeticiones y peso utilizado.

| Archivo | Casos de prueba |
|---------|-----------------|
| `controllers/sessionController.test.js` | createSession: crear sesión y devolver 201. getSessions: lista de sesiones; 500 si error. updateSession: actualizar y devolver mensaje con session. deleteSession: eliminar y mensaje de éxito. |
| `controllers/trainingController.test.js` | getTodayRoutine: rutina del día con ejercicios formateados (para ejecutar sesión). submitFeedback: 400 si faltan exercise_id o rpe; sugerir subir/bajar peso según RPE; mensaje neutro para RPE 7-8. |
| `routes.integration.test.js` | GET /api/sesiones sin token devuelve 401. GET /api/training/hoy sin token devuelve 401. |
| `app.test.js` | ruta /api/sesiones y /api/training requieren autenticación. |

**Ejecutar solo pruebas de RF-04:**
```bash
npm test -- tests/controllers/sessionController.test.js tests/controllers/trainingController.test.js
```

---

## RF-05: Seguimiento y visualización del progreso

**Requerimiento:** El sistema debe permitir al usuario visualizar su progreso físico a través del historial de entrenamientos y métricas básicas.

| Archivo | Casos de prueba |
|---------|-----------------|
| `controllers/sessionController.test.js` | getSessions: devolver lista de sesiones del usuario (historial). |
| `controllers/trainingController.test.js` | getTodayRoutine: mensaje si no hay rutinas; rutina del día con ejercicios formateados. |
| `controllers/adjustmentController.test.js` | devolver sugerencia cuando no hay historial; devolver análisis de la IA cuando hay historial (progreso). |

**Ejecutar solo pruebas de RF-05:**
```bash
npm test -- tests/controllers/sessionController.test.js tests/controllers/trainingController.test.js tests/controllers/adjustmentController.test.js
```

---

## RF-06: Visualización de resultados y estadísticas

**Requerimiento:** El sistema debe permitir al usuario visualizar resultados y estadísticas de su rendimiento, facilitando el análisis de su evolución en el tiempo.

| Archivo | Casos de prueba |
|---------|-----------------|
| `controllers/adjustmentController.test.js` | devolver análisis de la IA cuando hay historial (status, analysis, suggestion, safety_warning, recommended_changes). devolver 401 si no hay usuario. |

**Ejecutar solo pruebas de RF-06:**
```bash
npm test -- tests/controllers/adjustmentController.test.js
```

---

## Resumen por archivo

| Archivo | RF que cubre |
|---------|----------------|
| `controllers/aiController.test.js` | RF-01 |
| `services/aiService.test.js` | RF-01 |
| `controllers/adjustmentController.test.js` | RF-01, RF-05, RF-06 |
| `controllers/routineController.test.js` | RF-02 |
| `controllers/exerciseController.test.js` | RF-03 |
| `controllers/sessionController.test.js` | RF-04, RF-05 |
| `controllers/trainingController.test.js` | RF-04, RF-05 |
| `app.test.js` | Infraestructura (rutas para todos los RF) |
| `routes.integration.test.js` | Integración (auth y rutas protegidas para todos los RF) |
| `middleware/auth.test.js` | Seguridad (acceso a recursos por RF) |
| `controllers/auth.controller.test.js` | Autenticación (requerida para todos los RF) |

---

## Ejecutar todas las pruebas

```bash
npm test
```

## Ejecutar por nombre de grupo (describe RF)

Si en los tests usas `describe('RF-XX: ...', ...)`, puedes filtrar por RF:

```bash
npm test -- --testNamePattern="RF-01"
npm test -- --testNamePattern="RF-02"
# etc.
```
