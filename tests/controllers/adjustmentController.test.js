/**
 * Pruebas unitarias del controlador de análisis y ajuste (IA + historial).
 */
const mockCreate = jest.fn();
jest.mock('../../src/config/supabaseClient');
jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: mockCreate,
            },
        },
    }));
});

const adjustmentController = require('../../src/controllers/adjustmentController');
const supabase = require('../../src/config/supabaseClient');

describe('RF-01, RF-05, RF-06: Coach IA, Seguimiento y Estadísticas', () => {
    describe('Adjustment Controller', () => {
    let req;
    let res;
    let fromMock;

    beforeEach(() => {
        mockCreate.mockClear();
        fromMock = jest.fn();
        supabase.from = fromMock;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('debe devolver 401 si no hay usuario autenticado', async () => {
        req = { user: null, body: {} };

        await adjustmentController.analyzeAndAdjust(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Sesión de usuario no válida',
        });
    });

    it('debe devolver 401 si req.user no tiene id', async () => {
        req = { user: {}, body: {} };

        await adjustmentController.analyzeAndAdjust(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debe devolver sugerencia cuando no hay historial de sesiones', async () => {
        req = { user: { id: 'user-1' }, body: { routineId: 'r1' } };
        const chain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: { id: 'user-1', goal: 'Fuerza', fitness_level: 'Intermedio' },
                error: null,
            }),
        };
        const historyChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
        fromMock.mockImplementation((table) => {
            if (table === 'profiles') return chain;
            if (table === 'workout_sessions') return historyChain;
            return chain;
        });

        await adjustmentController.analyzeAndAdjust(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                suggestion: expect.stringContaining('Realiza al menos 5 sesiones'),
                status: 'insufficient_data',
            })
        );
    });

    it('debe devolver análisis de la IA cuando hay historial', async () => {
        const analysis = {
            status: 'progressing',
            analysis: 'Buen progreso',
            suggestion: 'Sigue así',
            safety_warning: 'Cuida la técnica',
        };
        mockCreate.mockResolvedValue({
            choices: [{ message: { content: JSON.stringify(analysis) } }],
        });
        req = { user: { id: 'user-1' }, body: {} };
        const profileChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: { id: 'user-1', goal: 'Fuerza', fitness_level: 'Intermedio' },
                error: null,
            }),
        };
        const historyChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
                data: [
                    {
                        started_at: '2025-01-01',
                        workout_sets: [{ weight: 60, reps: 10, completed: true }],
                    },
                ],
                error: null,
            }),
        };
        fromMock.mockImplementation((table) => {
            if (table === 'profiles') return profileChain;
            if (table === 'workout_sessions') return historyChain;
            return profileChain;
        });

        await adjustmentController.analyzeAndAdjust(req, res);

        expect(res.json).toHaveBeenCalledWith(analysis);
    });
    });
});
