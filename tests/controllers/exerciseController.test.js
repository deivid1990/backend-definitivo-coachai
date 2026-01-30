/**
 * Pruebas unitarias del controlador de ejercicios.
 */

const exerciseController = require('../../src/controllers/exerciseController');
const supabase = require('../../src/config/supabaseClient');

jest.mock('../../src/config/supabaseClient');

describe('RF-03: Consulta de biblioteca de ejercicios', () => {
    describe('Exercise Controller', () => {
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
        };
        supabase.from = jest.fn().mockReturnValue(chainMock);
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('getAllExercises', () => {
        it('debe devolver la lista de ejercicios del usuario', async () => {
            const ejercicios = [
                { id: '1', name: 'Press banca', user_id: 'user-1' },
            ];
            req = { user: { id: 'user-1' } };
            chainMock.select.mockReturnValue(chainMock);
            chainMock.eq.mockReturnValue(chainMock);
            chainMock.order.mockResolvedValue({ data: ejercicios, error: null });

            await exerciseController.getAllExercises(req, res);

            expect(supabase.from).toHaveBeenCalledWith('exercises');
            expect(res.json).toHaveBeenCalledWith(ejercicios);
        });

        it('debe devolver 500 si Supabase devuelve error', async () => {
            req = { user: { id: 'user-1' } };
            chainMock.order.mockResolvedValue({
                data: null,
                error: { message: 'Error de conexión' },
            });

            await exerciseController.getAllExercises(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error de conexión' });
        });
    });

    describe('createExercise', () => {
        it('debe crear un ejercicio y devolver 201', async () => {
            const nuevoEjercicio = {
                id: 'ex-1',
                name: 'Sentadilla',
                muscle_group: 'Piernas',
                user_id: 'user-1',
            };
            req = {
                user: { id: 'user-1' },
                body: {
                    name: 'Sentadilla',
                    muscle_group: 'Piernas',
                    equipment: 'Barra',
                    description: 'Desc',
                    video_url: null,
                },
            };
            chainMock.insert.mockReturnValue(chainMock);
            chainMock.select = jest.fn().mockResolvedValue({
                data: [nuevoEjercicio],
                error: null,
            });

            await exerciseController.createExercise(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(nuevoEjercicio);
        });

        it('debe devolver 500 si falla la inserción', async () => {
            req = {
                user: { id: 'user-1' },
                body: { name: 'Ej', muscle_group: 'Pecho' },
            };
            chainMock.insert.mockReturnValue(chainMock);
            chainMock.select = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Constraint violation' },
            });

            await exerciseController.createExercise(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('updateExercise', () => {
        it('debe devolver mensaje de actualizado cuando no hay error', async () => {
            req = {
                user: { id: 'user-1' },
                params: { id: 'ex-1' },
                body: { name: 'Press banca inclinado' },
            };
            // update().eq().eq() - la segunda eq debe devolver Promise para await
            chainMock.eq.mockImplementation(function () {
                if (chainMock.eq.mock.calls.length >= 2) {
                    return Promise.resolve({ error: null });
                }
                return chainMock;
            });

            await exerciseController.updateExercise(req, res);

            expect(res.json).toHaveBeenCalledWith({ message: 'Actualizado' });
        });
    });

    describe('deleteExercise', () => {
        it('debe devolver mensaje de eliminado cuando no hay error', async () => {
            req = { user: { id: 'user-1' }, params: { id: 'ex-1' } };
            // delete().eq().eq() - la segunda eq debe devolver Promise para await
            chainMock.eq.mockImplementation(function () {
                if (chainMock.eq.mock.calls.length >= 2) {
                    return Promise.resolve({ error: null });
                }
                return chainMock;
            });

            await exerciseController.deleteExercise(req, res);

            expect(res.json).toHaveBeenCalledWith({ message: 'Eliminado' });
        });
    });
    });
});
