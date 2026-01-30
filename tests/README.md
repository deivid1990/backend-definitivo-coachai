# Pruebas unitarias - GymAI Coach Backend

Este directorio contiene las **pruebas unitarias y de integración** del proyecto, pensadas para un nivel de estudiante de analista programador.

Las pruebas están **desglosadas por requerimientos funcionales (RF)**. Cada grupo de tests está etiquetado con el RF que cubre (RF-01 a RF-06). La trazabilidad detallada está en **`tests/REQUERIMIENTOS.md`**.

## Desglose por requerimientos

| RF | Descripción | Ejecutar solo este RF |
|----|-------------|------------------------|
| **RF-01** | Interacción con Coach Virtual IA | `npm run test:rf01` |
| **RF-02** | Gestión de rutinas de entrenamiento | `npm run test:rf02` |
| **RF-03** | Consulta de biblioteca de ejercicios | `npm run test:rf03` |
| **RF-04** | Registro de sesiones de entrenamiento | `npm run test:rf04` |
| **RF-05** | Seguimiento y visualización del progreso | `npm run test:rf05` |
| **RF-06** | Visualización de resultados y estadísticas | `npm run test:rf06` |

Ver **`REQUERIMIENTOS.md`** para la lista de archivos y casos de prueba por cada RF.

## Estructura

```
tests/
├── setup.js                    # Configuración global (NODE_ENV=test)
├── app.test.js                 # Pruebas de la aplicación Express (health check, rutas)
├── routes.integration.test.js  # Pruebas de integración de rutas con Supertest
├── controllers/               # Pruebas de controladores
│   ├── auth.controller.test.js
│   ├── aiController.test.js
│   ├── adjustmentController.test.js
│   ├── exerciseController.test.js
│   ├── routineController.test.js
│   ├── sessionController.test.js
│   ├── trainingController.test.js
├── middleware/
│   └── auth.test.js            # Pruebas del middleware de autenticación
├── services/
│   └── aiService.test.js       # Pruebas del servicio de IA
└── __mocks__/
    └── supabaseMock.js         # Mock de Supabase (referencia)
```

## Cómo ejecutar las pruebas

1. **Instalar dependencias** (si aún no lo has hecho):
   ```bash
   npm install
   ```

2. **Ejecutar todas las pruebas**:
   ```bash
   npm test
   ```

3. **Ejecutar pruebas con cobertura**:
   ```bash
   npm test
   ```
   (El script `test` ya incluye `--coverage`.)

4. **Modo watch** (re-ejecuta al guardar cambios):
   ```bash
   npm run test:watch
   ```

## Qué se prueba

- **app.js**: Health check (`GET /`), existencia de rutas y que las rutas protegidas exijan autenticación.
- **Auth**: Login y registro con Supabase mockeado (éxito, error, excepciones).
- **Middleware auth**: Rechazo sin token, token mal formado, token inválido; aceptación con token válido.
- **Controladores**: Ejercicios, rutinas, sesiones, entrenamiento (hoy y feedback), IA (chat y generar rutina), ajuste (análisis). En todos se mockea Supabase (y OpenAI donde aplica) para no depender de servicios externos.
- **Servicio AI**: `chatWithAI` y `generateRoutinePlan` con OpenAI mockeado.
- **Integración**: Rutas de auth y rutas protegidas responden con los códigos esperados.

## Mocks

- **Supabase**: Se usa `jest.mock('../../src/config/supabaseClient')` en cada archivo de test y se define el comportamiento de `supabase.auth` y `supabase.from()` según el caso.
- **OpenAI**: Se mockea el módulo `openai` para que `chat.completions.create` sea una función controlada y no se llame a la API real.

## Nivel estudiante analista

- Uso de **describe** e **it** para organizar pruebas.
- **expect** para comprobar códigos de estado, cuerpo de respuesta y mensajes.
- **Mocks** para aislar lógica y no depender de BD ni APIs externas.
- Comentarios en los archivos explicando qué se prueba y por qué.

Si algo no te queda claro, revisa primero `app.test.js` y `auth.controller.test.js`; son los más sencillos para seguir el patrón del resto.
