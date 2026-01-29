const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 1. CONFIGURACIÓN DE VARIABLES DE ENTORNO
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// 2. MIDDLEWARES GLOBALES - CONFIGURACIÓN DE CORS MEJORADA
// Esta configuración permite que tu frontend en Vercel se comunique sin bloqueos
app.use(cors({
    origin: '*', // Permite peticiones desde cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

// Permitir que Express lea cuerpos de mensajes en formato JSON
app.use(express.json());

// 3. RUTAS (Endpoints)
// Conectamos cada prefijo de URL con su respectivo archivo de rutas
app.use('/api/ai', require('./routes/ai'));
app.use('/api/rutinas', require('./routes/routines'));
app.use('/api/ejercicios', require('./routes/exercises'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/sesiones', require('./routes/sessions'));
app.use('/api/training', require('./routes/training'));

// 4. RUTA DE COMPROBACIÓN (Health Check)
app.get('/', (req, res) => {
    res.json({
        status: 'GymAI Coach Backend Online',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// 5. MANEJO DE ERRORES BÁSICO
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// 6. INICIO DEL SERVIDOR
app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 SERVIDOR LISTO EN PUERTO: ${PORT}`);
    console.log(`📍 URL Base: http://localhost:${PORT}`);
    console.log(`🔗 Rutas activas:`);
    console.log(`   - AI:         /api/ai`);
    console.log(`   - Rutinas:    /api/rutinas`);
    console.log(`   - Ejercicios: /api/ejercicios`);
    console.log(`=========================================\n`);
});

module.exports = app;