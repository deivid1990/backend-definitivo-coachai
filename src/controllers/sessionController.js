const supabase = require('../config/supabaseClient');

const getSessions = async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
            *,
            workout_sets (
                *,
                exercise:exercises (name)
            )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const createSession = async (req, res) => {
    const userId = req.user.id;
    const { routine_id, day_number, name, started_at, ended_at, exercises, notes, duration_minutes, rating } = req.body;

    try {
        // 1. Crear Sesión
        const { data: session, error: sessError } = await supabase
            .from('workout_sessions')
            .insert([{
                user_id: userId,
                routine_id,
                day_number,
                name,
                started_at,
                ended_at,
                notes,
                duration_minutes,
                rating
            }])
            .select()
            .single();

        if (sessError) throw sessError;

        // 2. Insertar Sets
        const allSets = [];
        exercises.forEach(ex => {
            ex.sets.forEach((set, idx) => {
                if (set.completed) {
                    allSets.push({
                        session_id: session.id,
                        exercise_id: ex.exercise_id,
                        set_number: idx + 1,
                        reps: set.reps,
                        weight: set.weight,
                        completed: set.completed
                    });
                }
            });
        });

        if (allSets.length > 0) {
            const { error: setsError } = await supabase
                .from('workout_sets')
                .insert(allSets);

            if (setsError) throw setsError;
        }

        res.status(201).json({ message: 'Sesión guardada', session });

    } catch (error) {
        console.error("Error saving session:", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteSession = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('workout_sessions')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: 'Sesión eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateSession = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, day_number, started_at, duration_minutes, rating } = req.body;

    try {
        const { data, error } = await supabase
            .from('workout_sessions')
            .update({
                name,
                day_number,
                started_at,
                duration_minutes,
                rating
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: 'Sesión actualizada correctamente', session: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getSessions,
    createSession,
    deleteSession,
    updateSession
};
