const express = require('express');
const cors = require('cors');
// Eliminamos dotenv y path porque en Railway las variables ya vienen en el sistema
const app = express();

// 1. CONFIGURACIÓN DE PUERTO
const PORT = process.env.PORT || 5000;

// 2. MIDDLEWARES GLOBALES (Configuración ultra-compatible para producción)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

app.use(express.json());

// 3. RUTAS (Endpoints)
app.use('/api/ai', require('./routes/ai'));
app.use('/api/rutinas', require('./routes/routines'));
app.use('/api/ejercicios', require('./routes/exercises'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/sesiones', require('./routes/sessions'));
app.use('/api/training', require('./routes/training'));

// 4. HEALTH CHECK
app.get('/', (req, res) => {
    res.json({
        status: 'GymAI Coach Backend Online',
        supabase_ready: !!process.env.SUPABASE_URL,
        ia_ready: !!process.env.OPENAI_API_KEY
    });
});

// 5. INICIO DEL SERVIDOR (no levantar en tests)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 SERVIDOR ACTIVO EN PUERTO: ${PORT}`);
        console.log(`✅ IA Endpoint: /api/ai`);
    });
}

module.exports = app;