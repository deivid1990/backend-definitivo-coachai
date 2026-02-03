/**
 * Mock de Supabase para pruebas unitarias.
 * Simula las respuestas de la base de datos sin conectar a Supabase real.
 * Útil para probar controladores de forma aislada.
 */

const mockFrom = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
}));

const mockAuth = {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    getUser: jest.fn(),
};

const supabaseMock = {
    from: mockFrom,
    auth: mockAuth,
};

module.exports = supabaseMock;
