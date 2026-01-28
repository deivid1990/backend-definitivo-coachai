/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Propósito: Validar el JWT enviado por el frontend y extraer el usuario.
 */
const supabase = require('../config/supabaseClient');

const authenticateUser = async (req, res, next) => {
    // 1. EXTRAER EL HEADER DE AUTORIZACIÓN
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log("⚠️ Auth Middleware: No se recibió encabezado Authorization");
        return res.status(401).json({ error: 'Se requiere iniciar sesión para acceder a este recurso' });
    }

    // El formato suele ser "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token con formato incorrecto o no encontrado' });
    }

    try {
        // 2. VERIFICAR EL TOKEN CON SUPABASE
        // IMPORTANTE: getUser(token) es más seguro que el método de decodificación local
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.log("⚠️ Auth Middleware: Token inválido o expirado");
            return res.status(401).json({ error: 'Tu sesión ha expirado o el token es inválido' });
        }

        // 3. INYECTAR EL USUARIO EN LA PETICIÓN
        // Esto permite que el controlador use 'req.user.id'
        req.user = user;
        
        // Continuar al siguiente paso (el controlador)
        next();
        
    } catch (err) {
        console.error('🔥 Error crítico en Auth Middleware:', err.message);
        res.status(500).json({ error: 'Ocurrió un error al verificar la identidad del usuario' });
    }
};

module.exports = authenticateUser;