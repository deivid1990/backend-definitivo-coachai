const OpenAI = require('openai');
const supabase = require('../config/supabaseClient');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
    maxRetries: 2,
});

/**
 * Helper para reintentar promesas
 */
const withRetry = async (fn, retries = 2, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, retries - 1, delay * 2);
    }
};

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
                suggestion: "Tu núcleo de datos está vacío. Realiza al menos 5 sesiones de entrenamiento para que pueda calcular tus vectores de progresión.",
                status: "insufficient_data",
                analysis: "SISTEMA EN ESPERA: SIN DATOS DE SESIÓN DETECTADOS."
            });
        }

        // 3. Prepare Prompt for AI
        const prompt = `
            Actúa como un coach de fitness experto. Analiza estos datos de entrenamiento.
            Perfil: Objetivo ${profile.goal}, Nivel ${profile.fitness_level}.
            Datos: ${JSON.stringify(history.map(h => ({
            fecha: h.started_at,
            sets: h.workout_sets
        })))}

            Responde ÚNICAMENTE en JSON:
            {
                "status": "progressing" | "stalled" | "inconsistent",
                "analysis": "...",
                "safety_warning": "...",
                "suggestion": "...",
                "recommended_changes": [],
                "automatic_apply_available": true
            }
        `;

        // 4. Call OpenAI with Retry
        const analysis = await withRetry(async () => {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Cambiado de 3.5 a 4o-mini (más rápido y mejor)
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.5,
            });
            return JSON.parse(completion.choices[0].message.content);
        });

        console.log("✅ Análisis completado");
        res.json(analysis);

    } catch (error) {
        console.error("❌ Error en análisis:", error);
        res.status(500).json({ error: "Error analizando el progreso", details: error.message });
    }
};

module.exports = {
    analyzeAndAdjust
};
