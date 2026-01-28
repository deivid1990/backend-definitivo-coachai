// 1. IMPORTACIÓN DEL CLIENTE CONFIGURADO
// Usamos el cliente centralizado para evitar errores de llaves faltantes
const supabase = require('../config/supabaseClient');

/**
 * CONTROLADOR DE RUTINAS
 * Maneja la lógica de base de datos para los entrenamientos
 */

// Obtener todas las rutinas del usuario con sus días y ejercicios
const getAllRoutines = async (req, res) => {
    try {
        const userId = req.user.id; // Viene del middleware de autenticación

        const { data, error } = await supabase
            .from('routines')
            .select(`
                *,
                routine_days (
                    *,
                    routine_exercises (
                        *,
                        exercise:exercises (name, muscle_group)
                    )
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error("Error en getAllRoutines:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Obtener una rutina específica por su ID
const getRoutineById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { data, error } = await supabase
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
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Rutina no encontrada' });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una rutina nueva (incluye creación automática de ejercicios si no existen)
const createRoutine = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, goal, days_per_week, days } = req.body;

        // 1. Crear la cabecera de la Rutina
        const { data: routineData, error: routineError } = await supabase
            .from('routines')
            .insert([{ user_id: userId, name, goal, days_per_week }])
            .select()
            .single();

        if (routineError) throw routineError;
        const routineId = routineData.id;

        // 2. Procesar los Días (si se enviaron)
        if (days && Array.isArray(days) && days.length > 0) {
            for (const day of days) {
                const { data: dayData, error: dayError } = await supabase
                    .from('routine_days')
                    .insert([{ routine_id: routineId, day_number: day.day_number, name: day.name }])
                    .select()
                    .single();

                if (dayError) {
                    console.error("Error al crear día:", dayError.message);
                    continue;
                }

                const dayId = dayData.id;

                // 3. Procesar Ejercicios para este día
                if (day.exercises && Array.isArray(day.exercises)) {
                    for (const [index, ex] of day.exercises.entries()) {
                        let exerciseId = ex.exercise_id;

                        // Si no viene ID, buscamos por nombre o creamos uno nuevo
                        if (!exerciseId && ex.name) {
                            const { data: existing } = await supabase
                                .from('exercises')
                                .select('id')
                                .eq('user_id', userId)
                                .ilike('name', ex.name)
                                .limit(1)
                                .maybeSingle();

                            if (existing) {
                                exerciseId = existing.id;
                            } else {
                                const { data: newEx, error: createError } = await supabase
                                    .from('exercises')
                                    .insert([{
                                        user_id: userId,
                                        name: ex.name,
                                        muscle_group: ex.muscle_group || 'General',
                                        description: ex.notes || 'Generado por IA'
                                    }])
                                    .select().single();

                                if (!createError && newEx) exerciseId = newEx.id;
                            }
                        }

                        // Vincular ejercicio a la rutina_día
                        if (exerciseId) {
                            const { error: exError } = await supabase
                                .from('routine_exercises')
                                .insert({
                                    routine_day_id: dayId,
                                    exercise_id: exerciseId,
                                    sets: Number(ex.sets) || 3,
                                    reps: Number(ex.reps) || 10,
                                    rest_seconds: Number(ex.rest_seconds) || 60,
                                    target_weight: Number(ex.target_weight) || 0,
                                    order_index: ex.order_index || index,
                                    notes: ex.notes
                                });
                            if (exError) console.error("Error al vincular ejercicio:", exError.message);
                        }
                    }
                }
            }
        }

        res.status(201).json({ message: "Rutina creada exitosamente", routine: routineData });
    } catch (error) {
        console.error("Error en createRoutine:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una rutina
const deleteRoutine = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { error } = await supabase
            .from('routines')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: 'Rutina eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. EXPORTACIÓN DE FUNCIONES
module.exports = {
    getAllRoutines,
    getRoutineById,
    createRoutine,
    deleteRoutine
};
