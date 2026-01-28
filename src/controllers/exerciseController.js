const supabase = require('../config/supabaseClient'); // ✅ USAMOS LA CONEXIÓN CENTRAL

const getAllExercises = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Obtenemos ejercicios del usuario
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('user_id', userId)
            .order('name', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createExercise = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, muscle_group, equipment, description, video_url } = req.body;

        const { data, error } = await supabase
            .from('exercises')
            .insert([{ 
                user_id: userId, 
                name, 
                muscle_group, 
                equipment, 
                description, 
                video_url 
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Funciones opcionales (por si las usas en el futuro)
const updateExercise = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { error } = await supabase
        .from('exercises')
        .update(req.body)
        .eq('id', id)
        .eq('user_id', userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Actualizado" });
};

const deleteExercise = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Eliminado" });
};

module.exports = {
    getAllExercises,
    createExercise,
    updateExercise,
    deleteExercise
};