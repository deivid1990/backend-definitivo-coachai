/**
 * Pruebas unitarias del controlador de IA (chat y generar rutina).
 * Se mockea OpenAI para no llamar a la API real.
 */
const mockCreate = jest.fn();
jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: mockCreate,
            },
        },
    }));
});

const aiController = require('../../src/controllers/aiController');

describe('RF-01: Interacción con Coach Virtual IA', () => {
    describe('AI Controller', () => {
    let req;
    let res;

    beforeEach(() => {
        mockCreate.mockClear();
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('chat', () => {
        it('debe devolver content y routine cuando la IA responde JSON válido', async () => {
            const content = '¡Vamos con esa rutina!';
            const suggested_routine = { name: 'Rutina Pro', days: [] };
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                content: content,
                                suggested_routine: suggested_routine,
                            }),
                        },
                    },
                ],
            });
            req = { body: { messages: [{ role: 'user', content: 'Dame una rutina' }] } };

            await aiController.chat(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    role: 'assistant',
                    content: content,
                    routine: suggested_routine,
                })
            );
        });

        it('debe devolver 500 si OpenAI falla', async () => {
            mockCreate.mockRejectedValue(new Error('API Error'));
            req = { body: { messages: [] } };

            await aiController.chat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Error comunicando con la IA',
            });
        });
    });

    describe('generateRoutine', () => {
        it('debe devolver la rutina en JSON generada por la IA', async () => {
            const routineJson = {
                name: 'Rutina Épica',
                goal: 'Fuerza',
                days_per_week: 3,
                days: [{ day_number: 1, name: 'Pecho', exercises: [] }],
            };
            mockCreate.mockResolvedValue({
                choices: [
                    { message: { content: JSON.stringify(routineJson) } },
                ],
            });
            req = {
                body: {
                    goal: 'Fuerza',
                    level: 'Intermedio',
                    days: 3,
                    equipment: 'Gimnasio completo',
                },
            };

            await aiController.generateRoutine(req, res);

            expect(res.json).toHaveBeenCalledWith(routineJson);
        });

        it('debe devolver 500 si hay error al generar', async () => {
            mockCreate.mockRejectedValue(new Error('OpenAI error'));
            req = { body: {} };

            await aiController.generateRoutine(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.any(String) })
            );
        });
    });
    });
});
