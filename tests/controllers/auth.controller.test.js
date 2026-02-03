/**
 * Pruebas unitarias del controlador de autenticación.
 * Se mockea Supabase para no depender de la base real.
 */

const authController = require('../../src/controllers/auth.controller');
const supabase = require('../../src/config/supabaseClient');

jest.mock('../../src/config/supabaseClient');

describe('Auth Controller', () => {
    let req;
    let res;
    let jsonMock;
    let statusMock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    describe('login', () => {
        it('debe devolver 401 si Supabase devuelve error', async () => {
            req = { body: { email: 'test@test.com', password: '123456' } };
            supabase.auth = {
                signInWithPassword: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Invalid login credentials' },
                }),
            };

            await authController.login(req, res);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid login credentials' });
        });

        it('debe devolver user y session cuando el login es correcto', async () => {
            const user = { id: 'user-1', email: 'test@test.com' };
            const session = { access_token: 'token123' };
            req = { body: { email: 'test@test.com', password: '123456' } };
            supabase.auth = {
                signInWithPassword: jest.fn().mockResolvedValue({
                    data: { user, session },
                    error: null,
                }),
            };

            await authController.login(req, res);

            expect(jsonMock).toHaveBeenCalledWith({ user, session });
        });

        it('debe devolver 500 si ocurre una excepción', async () => {
            req = { body: { email: 'test@test.com', password: '123' } };
            supabase.auth = {
                signInWithPassword: jest.fn().mockRejectedValue(new Error('Error de red')),
            };

            await authController.login(req, res);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
        });
    });

    describe('register', () => {
        it('debe devolver 400 si Supabase devuelve error en registro', async () => {
            req = { body: { name: 'Usuario', email: 'user@test.com', password: '123456' } };
            supabase.auth = {
                signUp: jest.fn().mockResolvedValue({
                    data: { user: null },
                    error: { message: 'User already registered' },
                }),
            };

            await authController.register(req, res);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'User already registered' });
        });

        it('debe devolver 201 y el usuario cuando el registro es correcto', async () => {
            const user = { id: 'user-2', email: 'nuevo@test.com' };
            req = { body: { name: 'Nuevo', email: 'nuevo@test.com', password: '123456' } };
            supabase.auth = {
                signUp: jest.fn().mockResolvedValue({
                    data: { user },
                    error: null,
                }),
            };

            await authController.register(req, res);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(user);
        });

        it('debe devolver 500 si ocurre una excepción en registro', async () => {
            req = { body: { name: 'X', email: 'x@x.com', password: '123' } };
            supabase.auth = {
                signUp: jest.fn().mockRejectedValue(new Error('Error inesperado')),
            };

            await authController.register(req, res);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
        });
    });
});
