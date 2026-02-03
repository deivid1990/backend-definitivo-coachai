/**
 * Pruebas unitarias del controlador de entrenamiento (hoy y feedback).
 */

const trainingController = require('../../src/controllers/trainingController');
const supabase = require('../../src/config/supabaseClient');

jest.mock('../../src/config/supabaseClient');

describe('RF-04, RF-05: Registro de sesiones y Seguimiento del progreso', () => {
    describe('Training Controller', () => {
    let req;
    let res;
    let chainMock;

    beforeEach(() => {
        chainMock = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
        };
        supabase.from = jest.fn().mockReturnValue(chainMock);
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('getTodayRoutine', () => {
        it('debe devolver mensaje amigable si no hay rutinas', async () => {
            req = { user: { id: 'user-1' }, query: {} };
            chainMock.order.mockResolvedValue({ data: [], error: null });

            await trainingController.getTodayRoutine(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('No tienes rutinas activas'),
                    exercises: [],
                })
            );
        });

        it('debe devolver rutina del día con ejercicios formateados', async () => {
            const routines = [
                {
                    id: 'r1',
                    name: 'Rutina Principal',
                    routine_days: [
                        {
                            day_number: 1,
                            name: 'Pecho',
                            routine_exercises: [
                                {
                                    id: 're1',
                                    exercise_id: 'e1',
                                    sets: 3,
                                    reps: 10,
                                    target_weight: 60,
                                    notes: 'Técnica',
                                    exercise: { name: 'Press banca' },
                                },
                            ],
                        },
                    ],
                },
            ];
            req = { user: { id: 'user-1' }, query: {} };
            chainMock.order.mockResolvedValue({ data: routines, error: null });

            await trainingController.getTodayRoutine(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    routine_name: 'Rutina Principal',
                    day_name: 'Pecho',
                    exercises: expect.any(Array),
                })
            );
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    exercises: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'Press banca',
                            sets: 3,
                            reps: 10,
                        }),
                    ]),
                })
            );
        });
    });

    describe('submitFeedback', () => {
        it('debe devolver 400 si faltan exercise_id o rpe', async () => {
            req = { user: { id: 'user-1' }, body: {} };

            await trainingController.submitFeedback(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('Faltan datos obligatorios'),
                })
            );
        });

        it('debe sugerir subir peso cuando RPE <= 6', async () => {
            req = {
                user: { id: 'user-1' },
                body: { exercise_id: 'e1', rpe: 5 },
            };

            await trainingController.submitFeedback(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    suggested_adjustment: 2.5,
                    message: expect.stringContaining('subir 2.5kg'),
                })
            );
        });

        it('debe sugerir bajar peso cuando RPE >= 9', async () => {
            req = {
                user: { id: 'user-1' },
                body: { exercise_id: 'e1', rpe: 9 },
            };

            await trainingController.submitFeedback(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    suggested_adjustment: -2.5,
                    message: expect.stringContaining('bajar 2.5kg'),
                })
            );
        });

        it('debe devolver mensaje neutro para RPE entre 7 y 8', async () => {
            req = {
                user: { id: 'user-1' },
                body: { exercise_id: 'e1', rpe: 7 },
            };

            await trainingController.submitFeedback(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: '¡Buen esfuerzo!',
                    suggested_adjustment: 0,
                })
            );
        });
    });
    });
});
