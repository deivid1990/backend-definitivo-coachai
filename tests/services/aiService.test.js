/**
 * Pruebas unitarias del servicio de IA (aiService.js).
 * Mockeamos OpenAI para no llamar a la API real.
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

const aiService = require('../../src/services/aiService');

describe('RF-01: Interacción con Coach Virtual IA', () => {
    describe('AI Service', () => {
    beforeEach(() => {
        mockCreate.mockClear();
    });

    describe('chatWithAI', () => {
        it('debe devolver el contenido de la respuesta de la IA', async () => {
            const respuesta = 'Puedes hacer 3 series de 10 repeticiones.';
            mockCreate.mockResolvedValue({
                choices: [{ message: { content: respuesta } }],
            });

            const result = await aiService.chatWithAI([
                { role: 'user', content: '¿Cuántas series hacer?' },
            ]);

            expect(result).toBe(respuesta);
        });

        it('debe lanzar error si OpenAI falla', async () => {
            mockCreate.mockRejectedValue(new Error('API Error'));

            await expect(
                aiService.chatWithAI([{ role: 'user', content: 'Hola' }])
            ).rejects.toThrow('Error al comunicarse con la IA');
        });
    });

    describe('generateRoutinePlan', () => {
        it('debe devolver un objeto JSON con la rutina generada', async () => {
            const rutina = {
                name: 'Rutina Principiante',
                goal: 'Hipertrofia',
                days_per_week: 3,
                days: [
                    {
                        day_number: 1,
                        name: 'Pecho y Tríceps',
                        exercises: [
                            { name: 'Press banca', sets: 3, reps: 10, rest_seconds: 60, notes: '' },
                        ],
                    },
                ],
            };
            mockCreate.mockResolvedValue({
                choices: [{ message: { content: JSON.stringify(rutina) } }],
            });

            const result = await aiService.generateRoutinePlan(
                { fitness_level: 'Principiante', goal: 'Hipertrofia' },
                { days_per_week: 3 }
            );

            expect(result).toEqual(rutina);
            expect(result.name).toBe('Rutina Principiante');
            expect(result.days).toHaveLength(1);
        });

        it('debe lanzar error si falla la generación', async () => {
            mockCreate.mockRejectedValue(new Error('OpenAI error'));

            await expect(
                aiService.generateRoutinePlan(
                    { fitness_level: 'Principiante' },
                    { days_per_week: 3 }
                )
            ).rejects.toThrow('Error generando la rutina');
        });
    });
    });
});
