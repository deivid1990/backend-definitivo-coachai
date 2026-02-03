/**
 * Pruebas unitarias de la aplicación Express (app.js)
 * Verifican que el servidor esté configurado correctamente y las rutas respondan.
 */

const request = require('supertest');

// Importamos la app sin levantar el servidor (no llama a app.listen en test)
const app = require('../src/app');

describe('Infraestructura (soporte RF-01 a RF-06)', () => {
    describe('Aplicación Express - GymAI Coach Backend', () => {
    describe('GET / (Health Check)', () => {
        it('debe responder con status 200', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(200);
        });

        it('debe devolver un JSON con status del backend', async () => {
            const res = await request(app).get('/');
            expect(res.body).toHaveProperty('status');
            expect(res.body.status).toContain('GymAI');
        });

        it('debe indicar si Supabase está configurado', async () => {
            const res = await request(app).get('/');
            expect(res.body).toHaveProperty('supabase_ready');
            expect(typeof res.body.supabase_ready).toBe('boolean');
        });

        it('debe indicar si la IA (OpenAI) está configurada', async () => {
            const res = await request(app).get('/');
            expect(res.body).toHaveProperty('ia_ready');
            expect(typeof res.body.ia_ready).toBe('boolean');
        });
    });

    describe('Rutas montadas', () => {
        it('ruta /api/ai debe existir (responde 401 sin token)', async () => {
            const res = await request(app).post('/api/ai/chat').send({});
            expect(res.status).toBe(401);
        });

        it('ruta /api/auth debe existir', async () => {
            const res = await request(app).post('/api/auth/login').send({});
            expect([400, 401, 500]).toContain(res.status);
        });

        it('ruta /api/ejercicios requiere autenticación', async () => {
            const res = await request(app).get('/api/ejercicios');
            expect(res.status).toBe(401);
        });

        it('ruta /api/rutinas requiere autenticación', async () => {
            const res = await request(app).get('/api/rutinas');
            expect(res.status).toBe(401);
        });

        it('ruta /api/sesiones requiere autenticación', async () => {
            const res = await request(app).get('/api/sesiones');
            expect(res.status).toBe(401);
        });

        it('ruta /api/training requiere autenticación', async () => {
            const res = await request(app).get('/api/training/hoy');
            expect(res.status).toBe(401);
        });
    });
    });
});
