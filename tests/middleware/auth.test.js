/**
 * Pruebas unitarias del middleware de autenticación.
 * Verifica que rechace peticiones sin token y acepte con token válido.
 */

const authenticateUser = require('../../src/middleware/auth');
const supabase = require('../../src/config/supabaseClient');

jest.mock('../../src/config/supabaseClient');

describe('Middleware de autenticación', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        next = jest.fn();
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('debe devolver 401 si no hay header Authorization', async () => {
        req = { headers: {} };

        await authenticateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Se requiere iniciar sesión para acceder a este recurso',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('debe devolver 401 si el header no tiene formato Bearer token', async () => {
        req = { headers: { authorization: 'InvalidFormat' } };

        await authenticateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Token con formato incorrecto o no encontrado',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('debe devolver 401 si el token es inválido o expirado', async () => {
        req = { headers: { authorization: 'Bearer token-invalido' } };
        supabase.auth = {
            getUser: jest.fn().mockResolvedValue({
                data: { user: null },
                error: { message: 'Token expired' },
            }),
        };

        await authenticateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Tu sesión ha expirado o el token es inválido',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('debe llamar a next() e inyectar req.user cuando el token es válido', async () => {
        const user = { id: 'user-123', email: 'user@test.com' };
        req = { headers: { authorization: 'Bearer token-valido' } };
        supabase.auth = {
            getUser: jest.fn().mockResolvedValue({
                data: { user },
                error: null,
            }),
        };

        await authenticateUser(req, res, next);

        expect(req.user).toEqual(user);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});
