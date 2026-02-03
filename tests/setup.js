/**
 * Configuración global para las pruebas.
 * Se ejecuta antes de cada archivo de test.
 */
process.env.NODE_ENV = 'test';
// Evitar que supabaseClient haga process.exit(1) por falta de .env
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
// Evitar error de OpenAI al cargar app en tests de integración
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';
