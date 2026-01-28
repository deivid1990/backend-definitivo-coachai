const supabase = require('../config/supabaseClient');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        res.json({
            user: data.user,
            session: data.session
        });
    } catch (err) {
        console.error('Error en login backend:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(data.user);
    } catch (err) {
        console.error('Error en registro backend:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
