const OpenAI = require('openai');
const supabase = require('../config/supabaseClient');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const analyzeAndAdjust = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Sesión de usuario no válida" });
    }

    const userId = req.user.id;
    const { routineId } = req.body;

    try {
        console.log(`🔍 Analizando progreso para usuario ${userId}...`);

        // 1. Fetch User Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) throw new Error("Error fetching profile: " + profileError.message);

        // 2. Fetch Recent Workout History (Last 5 sessions)
        const { data: history, error: historyError } = await supabase
            .from('workout_sessions')
            .select(`
                *,
                workout_sets (
                    exercise_id,
                    weight,
                    reps,
                    completed
                )
            `)
            .eq('user_id', userId)
            .order('started_at', { ascending: false })
            .limit(5);

        if (historyError) throw new Error("Error fetching history: " + historyError.message);

        if (!history || history.length === 0) {
            return res.json({
                suggestion: "Tu núcleo de datos está vacío. Realiza al menos 5 sesiones de entrenamiento para que pueda calcular tus vectores de progresión y optimizar tu plan. ¡El primer paso es la constancia!",
                status: "insufficient_data",
                analysis: "SISTEMA EN ESPERA: SIN DATOS DE SESIÓN DETECTADOS."
            });
        }

        // 3. Prepare Prompt for AI with Safety Focus
        const prompt = `
            Actúa como un coach de fitness de élite y experto en seguridad biomecánica. Analiza los datos de entrenamiento de este usuario.
            
            PERFIL DEL USUARIO:
            - Objetivo: ${profile.goal}
            - Nivel: ${profile.fitness_level}

            DATOS HISTÓRICOS (Últimas 5 sesiones):
            ${JSON.stringify(history.map(h => ({
            fecha: h.started_at,
            ejercicios: h.workout_sets.map(s => ({
                peso: s.weight,
                reps: s.reps,
                completado: s.completed
            }))
        })))}

            REGLAS CRÍTICAS DE SEGURIDAD:
            - SIEMPRE prioriza la técnica sobre el peso.
            - Si el progreso está estancado, considera cambiar el tiempo o las series antes de aumentar el peso.
            - Nunca sugieras aumentos de peso superiores al 10% semanal.

            OBJETIVO:
            Basado en la consistencia y el rendimiento, determina el estado del progreso.

            IMPORTANTE: Responde ÚNICAMENTE en ESPAÑOL y devuelve un objeto JSON VÁLIDO con esta estructura:
            {
                "status": "progressing" | "stalled" | "inconsistent",
                "analysis": "Análisis breve de las métricas (máx. 2 frases).",
                "safety_warning": "Un consejo de seguridad OBLIGATORIO basado en la intensidad actual.",
                "suggestion": "Plan de acción concreto y motivador (máx. 2 frases).",
                "recommended_changes": [
                    { "type": "increase_weight", "exercise": "Nombre del Ejercicio", "value": "+2.5kg", "reason": "Reps altas consistentes" }
                ],
                "automatic_apply_available": true
            }
        `;

        // 4. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.6,
        });

        const analysis = JSON.parse(completion.choices[0].message.content);

        console.log("✅ Análisis de Seguridad y Progreso completado");
        res.json(analysis);

    } catch (error) {
        console.error("❌ Error en análisis:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    analyzeAndAdjust
};
