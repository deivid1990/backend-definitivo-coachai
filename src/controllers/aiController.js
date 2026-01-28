const OpenAI = require('openai');
const supabase = require('../config/supabaseClient');

// Configuración de OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 1. CHAT
const chat = async (req, res) => {
    try {
        const { messages } = req.body;

        // Inyectamos un sistema de instrucciones para que la IA sepa proponer rutinas
        const systemPrompt = {
            role: "system",
            content: `Eres un Coach de Fitness de élite. Tu objetivo es ayudar al usuario con su entrenamiento.
            
            REGLA CRÍTICA: 
            Si el usuario te pide una rutina o sugerencias, DEBES generar una rutina de ALTA DENSIDAD.
            1. Cada día debe tener entre 6 y 8 ejercicios variados.
            2. DEBES incluir "sets", "reps", "target_weight" (estimado según el nivel del usuario) y "notes" técnicos.
            3. Estructura: 2 ejercicios multiarticulares pesados, 3-4 accesorios, 1-2 de core/estabilidad.
            
            Tu respuesta DEBE ser un JSON válido:
            {
                "content": "Mensaje motivador...",
                "suggested_routine": {
                    "name": "Nombre Pro",
                    "goal": "Objetivo",
                    "days_per_week": 3,
                    "days": [
                        {
                            "day_number": 1, // 1=Lunes, 2=Martes, ..., 7=Domingo
                            "name": "Enfoque (ej: Pecho y Espalda)",
                            "exercises": [
                                { "name": "Ej", "sets": 4, "reps": "8-10", "target_weight": 60, "notes": "...", "muscle_group": "..." }
                            ]
                        }
                    ]
                }
            }`
        };

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [systemPrompt, ...messages],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const result = JSON.parse(response.choices[0].message.content);
        res.json({
            role: "assistant",
            content: result.content,
            routine: result.suggested_routine
        });

    } catch (error) {
        console.error("Error OpenAI Chat:", error);
        res.status(500).json({ error: "Error comunicando con la IA" });
    }
};

// 2. GENERAR RUTINA
const generateRoutine = async (req, res) => {
    const { goal, level, days, equipment } = req.body;

    try {
        const prompt = `
            Actúa como un entrenador personal experto de élite.
            Crea una rutina de entrenamiento de ALTA DENSIDAD en formato JSON.
            
            PARÁMETROS:
            - Objetivo: ${goal || 'General'}
            - Nivel: ${level || 'Principiante'}
            - Días: ${days || 3}
            - Equipo: ${equipment || 'Capacidad total'}

            REQUERIMIENTOS:
            - Mínimo 6-8 ejercicios por día.
            - Incluye "target_weight" (en kg) sugerido para el nivel ${level}.
            - Incluye "reps" como string (ej: "10-12" o "al fallo").
            - Incluye "notes" con técnica profesional.

            JSON ESTRUCTURA:
            {
                "name": "Nombre Épico",
                "goal": "${goal}",
                "days_per_week": ${days},
                "days": [
                    {
                        "day_number": 1,
                        "name": "Enfoque",
                        "exercises": [
                            { "name": "Ej", "sets": 3, "reps": "12", "target_weight": 50, "notes": "...", "muscle_group": "..." }
                        ]
                    }
                ]
            }
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview", // Usamos un modelo más capaz para rutinas densas
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const routineJson = JSON.parse(completion.choices[0].message.content);

        // Devolvemos el JSON al frontend. EL frontend se encarga de llamar a /api/rutinas para guardar.
        res.json(routineJson);

    } catch (error) {
        console.error("❌ Error generando rutina:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    chat,
    generateRoutine
};