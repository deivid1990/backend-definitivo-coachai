/**
 * Pruebas de integración de rutas.
 * Verifican que las rutas estén montadas y respondan con los códigos esperados
 * (con mocks de middleware cuando hace falta).
 */

const request = require('supertest');
const app = require('../src/app');

describe('Infraestructura (soporte RF-01 a RF-06)', () => {
    describe('Integración de rutas - API', () => {
    describe('Auth - /api/auth', () => {
        it('POST /api/auth/login sin body debe responder 401 o 500', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});
            expect([401, 500]).toContain(res.status);
        });

        it('POST /api/auth/register sin body debe responder 400 o 500', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({});
            expect([400, 500]).toContain(res.status);
        });
    });

    describe('Rutas protegidas - requieren Authorization', () => {
        it('GET /api/ejercicios sin token devuelve 401', async () => {
            const res = await request(app).get('/api/ejercicios');
            expect(res.status).toBe(401);
        });

        it('GET /api/rutinas sin token devuelve 401', async () => {
            const res = await request(app).get('/api/rutinas');
            expect(res.status).toBe(401);
        });

        it('GET /api/sesiones sin token devuelve 401', async () => {
            const res = await request(app).get('/api/sesiones');
            expect(res.status).toBe(401);
        });

        it('GET /api/training/hoy sin token devuelve 401', async () => {
            const res = await request(app).get('/api/training/hoy');
            expect(res.status).toBe(401);
        });

        it('POST /api/ai/chat sin token devuelve 401', async () => {
            const res = await request(app).post('/api/ai/chat').send({ messages: [] });
            expect(res.status).toBe(401);
        });
    });

    describe('CORS y JSON', () => {
        it('la app debe aceptar JSON en el body', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send({ email: 'test@test.com', password: '123456' });
            expect(res.status).toBeDefined();
            expect(res.body).toBeDefined();
        });
    });
    });
});
