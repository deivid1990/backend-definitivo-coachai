/**
 * Pruebas unitarias del controlador de sesiones de entrenamiento.
 */

const sessionController = require('../../src/controllers/sessionController');
const supabase = require('../../src/config/supabaseClient');

jest.mock('../../src/config/supabaseClient');

describe('RF-04, RF-05: Registro de sesiones y Seguimiento del progreso', () => {
    describe('Session Controller', () => {
    let req;
    let res;
    let chainMock;

    beforeEach(() => {
        chainMock = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn(),
        };
        supabase.from = jest.fn().mockReturnValue(chainMock);
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('getSessions', () => {
        it('debe devolver la lista de sesiones del usuario', async () => {
            const sesiones = [{ id: 's1', name: 'Sesión 1', user_id: 'user-1' }];
            req = { user: { id: 'user-1' } };
            chainMock.order.mockResolvedValue({ data: sesiones, error: null });

            await sessionController.getSessions(req, res);

            expect(res.json).toHaveBeenCalledWith(sesiones);
        });

        it('debe devolver 500 si hay error', async () => {
            req = { user: { id: 'user-1' } };
            chainMock.order.mockResolvedValue({
                data: null,
                error: { message: 'Error' },
            });

            await sessionController.getSessions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('createSession', () => {
        it('debe crear una sesión y devolver 201', async () => {
            const session = { id: 's-new', name: 'Sesión nueva', user_id: 'user-1' };
            req = {
                user: { id: 'user-1' },
                body: {
                    routine_id: 'r1',
                    day_number: 1,
                    name: 'Sesión nueva',
                    exercises: [],
                },
            };
            chainMock.insert.mockReturnValue(chainMock);
            chainMock.select = jest.fn().mockReturnValue(chainMock);
            chainMock.single.mockResolvedValue({ data: session, error: null });

            await sessionController.createSession(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Sesión guardada',
                    session,
                })
            );
        });
    });

    describe('deleteSession', () => {
        it('debe eliminar y devolver mensaje de éxito', async () => {
            req = { user: { id: 'user-1' }, params: { id: 's1' } };
            chainMock.delete.mockReturnValue(chainMock);
            // delete().eq().eq() - la segunda eq debe devolver Promise para await
            chainMock.eq.mockImplementation(function () {
                if (chainMock.eq.mock.calls.length >= 2) {
                    return Promise.resolve({ error: null });
                }
                return chainMock;
            });

            await sessionController.deleteSession(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Sesión eliminada correctamente',
            });
        });
    });

    describe('updateSession', () => {
        it('debe actualizar y devolver mensaje con session', async () => {
            const updated = { id: 's1', name: 'Sesión actualizada' };
            req = {
                user: { id: 'user-1' },
                params: { id: 's1' },
                body: { name: 'Sesión actualizada', duration_minutes: 45 },
            };
            chainMock.update.mockReturnValue(chainMock);
            chainMock.eq.mockReturnValue(chainMock);
            chainMock.select = jest.fn().mockReturnValue(chainMock);
            chainMock.single.mockResolvedValue({ data: updated, error: null });

            await sessionController.updateSession(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Sesión actualizada correctamente',
                    session: updated,
                })
            );
        });
    });
    });
});
