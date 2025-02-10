const mockDatabase: Record<string, { nombre: string; email: string }> = {};

export const UsuarioModel = {
  findOne: jest.fn(async (query: { email: string }) => {
    return Object.values(mockDatabase).find(user => user.email === query.email) || null;
  }),

  save: jest.fn(async function (this: { nombre: string; email: string }) {
    const { email, nombre } = this;
    if (mockDatabase[email]) {
      throw new Error('Duplicate email');
    }
    mockDatabase[email] = { nombre, email };
    return { nombre, email };
  }),

  // Métodos adicionales si son necesarios
  resetDatabase: () => {
    for (const key in mockDatabase) {
      delete mockDatabase[key];
    }
  },
};
