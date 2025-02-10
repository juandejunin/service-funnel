jest.mock('../../src/utils/jwt.utils', () => ({
  generateToken: jest.fn(() => 'fixedToken'), // Mock de token fijo
}));

jest.mock('../../src/models/user.model');
jest.mock('../../src/services/email/email.service');

import { UsuarioModel } from '../../src/models/user.model';
import { UserService } from '../../src/services/user.service';
import { EmailService } from '../../src/services/email/email.service';
import path from 'path';

describe('UserService', () => {
  let userService: UserService;
  let mockSave: jest.Mock;
  let mockFindOne: jest.Mock;
  let mockSendVerificationEmail: jest.Mock;
  let mockSendEmailWithAttachment: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar mocks
    mockFindOne = jest.fn();
    mockSave = jest.fn();
    mockSendVerificationEmail = jest.fn();
    mockSendEmailWithAttachment = jest.fn();

    // Reemplazar métodos con mocks
    (UsuarioModel.findOne as jest.Mock) = mockFindOne;
    UsuarioModel.prototype.save = mockSave;
    EmailService.prototype.sendVerificationEmail = mockSendVerificationEmail;
    EmailService.prototype.sendEmailWithAttachment = mockSendEmailWithAttachment;

    // Instanciar el servicio
    userService = new UserService(new EmailService());
  });

  it('should resend verification email if user exists but is not verified', async () => {
    // Simular usuario no verificado
    const unverifiedUser = { email: 'test@example.com', isVerified: false };
    mockFindOne.mockResolvedValueOnce(unverifiedUser);

    const result = await userService.createUser('Test User', 'test@example.com');

    expect(mockFindOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockSendVerificationEmail).toHaveBeenCalledWith('test@example.com');
    expect(result).toEqual({ mensaje: 'Correo de verificación reenviado' });
  });

  it('should send PDF if user exists and is verified', async () => {
    // Simular usuario verificado
    const verifiedUser = { email: 'test@example.com', isVerified: true };
    mockFindOne.mockResolvedValueOnce(verifiedUser);

    const filePath = path.join(__dirname, '../../src/files/archivo.pdf');

    const result = await userService.createUser('Test User', 'test@example.com');

    expect(mockFindOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockSendEmailWithAttachment).toHaveBeenCalledWith(
      'test@example.com',
      'Tu archivo adjunto',
      'Gracias por tu interés. Aquí tienes tu archivo.',
      filePath
    );
    expect(result).toEqual({ mensaje: 'PDF reenviado al usuario verificado' });
  });

  it('should create a new user and send a verification email if user does not exist', async () => {
    // Simular que no se encuentra al usuario
    mockFindOne.mockResolvedValueOnce(null);
    mockSave.mockResolvedValueOnce({ nombre: 'Test User', email: 'test@example.com' });

    const result = await userService.createUser('Test User', 'test@example.com');

    expect(mockFindOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockSave).toHaveBeenCalled();
    expect(mockSendVerificationEmail).toHaveBeenCalledWith('test@example.com');
    expect(result).toEqual({ mensaje: 'Usuario registrado y correo de verificación enviado' });
  });

});
