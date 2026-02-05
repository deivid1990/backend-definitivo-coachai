const OpenAI = require('openai');
const supabase = require('../config/supabaseClient');

// Configuración de OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000, // 30 segundos de timeout máximo
    maxRetries: 2, // Intentos automáticos de la librería
});

/**
 * Helper para reintentar promesas en caso de error
 */
const withRetry = async (fn, retries = 2, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        console.warn(`⚠️ Error en IA. Reintentando en ${delay}ms... (Quedan ${retries} intentos)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, retries - 1, delay * 2);
    }
};

// 1. CHAT
const chat = async (req, res) => {
    console.log("🌐 AI CHAT REQUEST RECEIVED");
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            console.error("❌ Invalid messages format");
            return res.status(400).json({ error: "Formato de mensajes inválido" });
        }

        // Limitamos el historial para evitar latencia excesiva (últimos 10 mensajes)
        const chatHistory = messages.slice(-10);

        const systemPrompt = {
            role: "system",
            content: `Eres Gymy V2, el Coach de Fitness experto de GymAI. 💪🔥
            
            REGLA DE ORO DE RESPUESTA:
            SIEMPRE responde con un JSON que tenga "content" y "suggested_routine".
            
            1. Si el usuario pide una rutina (ej: "necesito rutina de 5 días"):
               - Diseña una rutina COMPLETA de alta densidad para el número de días solicitado.
               - El array "days" DEBE tener un objeto por cada día (ej: 5 días = 5 objetos).
               - "content" debe ser un saludo motivador.
            
            2. Si el usuario SOLO charla:
               - "content" es tu respuesta amigable.
               - "suggested_routine" debe ser null.

            ESTRUCTURA JSON:
            {
                "content": "...",
                "suggested_routine": {
                    "name": "...",
                    "goal": "...",
                    "days_per_week": 5,
                    "days": [
                        { "day_number": 1, "name": "...", "exercises": [{ "name": "...", "sets": 3, "reps": "12", "target_weight": 50, "notes": "..." }] }
                    ]
                }
            }`
        };

        const result = await withRetry(async () => {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [systemPrompt, ...chatHistory],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 2000,
            });
            console.log("✅ OpenAI Response received");
            return JSON.parse(response.choices[0].message.content);
        });

        res.json({
            role: "assistant",
            content: result.content,
            routine: result.suggested_routine || null
        });

    } catch (error) {
        console.error("❌ Error OpenAI Chat:", error.message);
        res.status(500).json({
            error: "Error comunicando con la IA",
            details: error.message
        });
    }
};

// 2. GENERAR RUTINA
const generateRoutine = async (req, res) => {
    const { goal, level, days, equipment } = req.body;
    const requestedDays = parseInt(days) || 3;

    console.log(`🚀 GENERATING ROUTINE: ${requestedDays} days, Goal: ${goal}, Level: ${level}`);

    try {
        const prompt = `
            Actúa como un entrenador experto de élite. Diseña una rutina de entrenamiento de ALTA DENSIDAD completa para ${requestedDays} DÍAS INDEPENDIENTES.
            
            PARÁMETROS:
            - Objetivo: ${goal}
            - Nivel: ${level}
            - Días de entrenamiento: ${requestedDays}
            - Equipo: ${equipment}

            REQUERIMIENTOS CRÍTICOS:
            1. El array "days" DEBE tener exactamente ${requestedDays} objetos, uno por cada día de entrenamiento.
            2. Cada día debe tener un "day_number" correlativo (1, 2, 3, 4, 5...).
            3. Cada día debe tener un enfoque diferente (ej: día 1 pecho, día 2 espalda, etc. o según el objetivo).
            4. Cada día DEBE incluir de 6 a 8 ejercicios con "name", "sets", "reps" (ej: "10-12"), "target_weight" (kg numérico) y "notes".

            ESTRUCTURA JSON OBLIGATORIA:
            {
                "name": "Nombre motivador de la rutina",
                "goal": "${goal}",
                "days_per_week": ${requestedDays},
                "days": [
                    {
                        "day_number": 1,
                        "name": "Enfoque del Día",
                        "exercises": [
                            { "name": "Ej", "sets": 3, "reps": "12", "target_weight": 40, "notes": "...", "muscle_group": "..." }
                        ]
                    }
                ]
            }
        `;

        const routineJson = await withRetry(async () => {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Eres un experto en fitness que genera planes de entrenamiento estructurados y completos en JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
            });

            const parsed = JSON.parse(completion.choices[0].message.content);

            // Validación básica de días
            if (!parsed.days || parsed.days.length < requestedDays) {
                console.warn(`⚠️ IA generó menos días de los pedidos (${parsed.days?.length}/${requestedDays}). Reintentando...`);
                throw new Error("Días insuficientes generados");
            }

            return parsed;
        });

        console.log(`✅ Routine generated successfully with ${routineJson.days.length} days.`);
        res.json(routineJson);

    } catch (error) {
        console.error("❌ Error generando rutina:", error.message);
        res.status(500).json({ error: "No se pudo generar la rutina completa", details: error.message });
    }
};

module.exports = {
    chat,
    generateRoutine
};
