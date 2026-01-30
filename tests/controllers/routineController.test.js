/**
 * Pruebas unitarias del controlador de rutinas.
 */

const routineController = require('../../src/controllers/routineController');
const supabase = require('../../src/config/supabaseClient');

jest.mock('../../src/config/supabaseClient');

describe('RF-02: Gestión de rutinas de entrenamiento', () => {
    describe('Routine Controller', () => {
    let req;
    let res;
    let chainMock;

    beforeEach(() => {
        chainMock = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
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

    describe('getAllRoutines', () => {
        it('debe devolver las rutinas del usuario', async () => {
            const rutinas = [{ id: 'r1', name: 'Rutina A', user_id: 'user-1' }];
            req = { user: { id: 'user-1' } };
            chainMock.order.mockResolvedValue({ data: rutinas, error: null });

            await routineController.getAllRoutines(req, res);

            expect(res.json).toHaveBeenCalledWith(rutinas);
        });

        it('debe devolver 500 si hay error', async () => {
            req = { user: { id: 'user-1' } };
            chainMock.order.mockResolvedValue({
                data: null,
                error: { message: 'Error DB' },
            });

            await routineController.getAllRoutines(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getRoutineById', () => {
        it('debe devolver 404 si la rutina no existe', async () => {
            req = { user: { id: 'user-1' }, params: { id: 'r99' } };
            chainMock.eq.mockReturnValue(chainMock);
            // 404 cuando single devuelve data null sin error (no encontrado)
            chainMock.single.mockResolvedValue({
                data: null,
                error: null,
            });

            await routineController.getRoutineById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Rutina no encontrada' });
        });

        it('debe devolver la rutina si existe', async () => {
            const rutina = { id: 'r1', name: 'Rutina A' };
            req = { user: { id: 'user-1' }, params: { id: 'r1' } };
            chainMock.eq.mockReturnValue(chainMock);
            chainMock.single.mockResolvedValue({ data: rutina, error: null });

            await routineController.getRoutineById(req, res);

            expect(res.json).toHaveBeenCalledWith(rutina);
        });
    });

    describe('createRoutine', () => {
        it('debe crear una rutina y devolver 201', async () => {
            const routineData = { id: 'r-new', name: 'Nueva', user_id: 'user-1' };
            req = {
                user: { id: 'user-1' },
                body: {
                    name: 'Nueva',
                    goal: 'Fuerza',
                    days_per_week: 3,
                    days: [],
                },
            };
            chainMock.insert.mockReturnValue(chainMock);
            chainMock.select = jest.fn().mockReturnValue(chainMock);
            chainMock.single.mockResolvedValue({
                data: routineData,
                error: null,
            });

            await routineController.createRoutine(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Rutina creada exitosamente',
                    routine: routineData,
                })
            );
        });
    });

    describe('deleteRoutine', () => {
        it('debe eliminar y devolver mensaje de éxito', async () => {
            req = { user: { id: 'user-1' }, params: { id: 'r1' } };
            chainMock.delete.mockReturnValue(chainMock);
            // delete().eq().eq() - la segunda eq debe devolver Promise para await
            chainMock.eq.mockImplementation(function () {
                if (chainMock.eq.mock.calls.length >= 2) {
                    return Promise.resolve({ error: null });
                }
                return chainMock;
            });

            await routineController.deleteRoutine(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Rutina eliminada correctamente',
            });
        });
    });
    });
});
