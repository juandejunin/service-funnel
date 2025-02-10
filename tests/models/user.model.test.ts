import { jest } from '@jest/globals';
import { UsuarioModel } from '../../src/models/user.model';

// Mock del modelo
jest.mock('../../src/models/user.model');
const mockUsuarioModel = UsuarioModel as unknown as jest.Mock;

// Prueba básica para verificar el mock
describe('UsuarioModel', () => {
  it('debería estar definido', () => {
    expect(mockUsuarioModel).toBeDefined();
  });
});
