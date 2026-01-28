const supabase = require('../config/supabaseClient');

// 1. Obtener la rutina que toca hoy (Día 1 de la rutina más reciente o por parámetro)
const getTodayRoutine = async (req, res) => {
    try {
        const userId = req.user.id;
        const { routineId } = req.query; // Opcional: permitir elegir rutina

        let query = supabase
            .from('routines')
            .select(`
                *,
                routine_days (
                    *,
                    routine_exercises (
                        *,
                        exercise:exercises (name)
                    )
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (routineId) {
            query = query.eq('id', routineId);
        }

        const { data: routines, error } = await query;

        if (error || !routines || routines.length === 0) {
            return res.json({ message: "No tienes rutinas activas. ¡Crea una con el Coach IA!", exercises: [] });
        }

        const latestRoutine = routines[0];
        // Por defecto tomamos el primer día si no se especifica
        const todayDay = latestRoutine.routine_days.find(d => d.day_number === 1) || latestRoutine.routine_days[0];

        const formattedExercises = todayDay.routine_exercises.map(re => ({
            id: re.id,
            exercise_id: re.exercise_id,
            name: re.exercise?.name || 'Ejercicio desconocido',
            sets: re.sets,
            reps: re.reps,
            weight: re.target_weight || 0,
            notes: re.notes || ''
        }));

        res.json({
            routine_name: latestRoutine.name,
            day_name: todayDay.name,
            exercises: formattedExercises
        });

    } catch (err) {
        console.error("Error en getTodayRoutine:", err);
        res.status(500).json({ error: 'Error cargando entrenamiento diario' });
    }
};

// 2. Recibir Feedback y Ajustar Pesos (Lógica de micro-ajuste)
const submitFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercise_id, rpe, weight, reps, session_id } = req.body;

        if (!exercise_id || !rpe) {
            return res.status(400).json({ error: "Faltan datos obligatorios (exercise_id, rpe)" });
        }

        const rpeNum = Number(rpe);
        let message = "¡Buen esfuerzo!";
        let suggested_adjustment = 0;

        if (rpeNum <= 6) {
            suggested_adjustment = 2.5;
            message = "¡Demasiado fácil! El Coach sugiere subir 2.5kg en la próxima sesión.";
        } else if (rpeNum >= 9) {
            suggested_adjustment = -2.5;
            message = "Entrenamiento intenso. Quizás sea mejor bajar 2.5kg para mantener la técnica perfecta.";
        }

        // Guardamos el log específico del set si se desea, o solo devolvemos el tip
        // Aquí podríamos disparar el análisis de adjustmentController si es el final de la sesión

        res.json({
            success: true,
            message,
            suggested_adjustment,
            analysis_preview: `RPE ${rpeNum} detectado.`
        });

    } catch (err) {
        console.error("Error en submitFeedback:", err);
        res.status(500).json({ error: 'Error procesando feedback de entrenamiento' });
    }
};

module.exports = {
    getTodayRoutine,
    submitFeedback
};
