const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 1. CARGA DE VARIABLES (Ruta absoluta mejorada)
// Buscamos el .env subiendo dos niveles desde /src/config para llegar a la raíz /backend
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// 2. OBTENER LAS CLAVES (Compatibilidad total)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// 3. DEBUG EN CONSOLA (omitir en tests)
if (process.env.NODE_ENV !== 'test') {
    console.log("--- DEBUG SUPABASE CLIENT ---");
    console.log("Ruta buscada:", envPath);
    console.log("URL:", supabaseUrl ? "✅ OK" : "❌ NO ENCONTRADA");
    console.log("KEY:", supabaseKey ? "✅ OK" : "❌ NO ENCONTRADA");
    console.log("---------------------------");
}

// 4. VERIFICACIÓN Y CREACIÓN
if (!supabaseUrl || !supabaseKey) {
    console.error("🔥 ERROR FATAL: Faltan credenciales de Supabase en el .env");
    process.exit(1); // Detiene el servidor si no hay conexión
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;