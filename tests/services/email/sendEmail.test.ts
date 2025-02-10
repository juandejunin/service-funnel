
import { EmailService } from '../../../src/services/email/email.service';

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mockedToken'), // Devuelve siempre el mismo token
}));

describe('EmailService - Correo de verificación', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();

    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Interceptar el método sendEmail con un mock por defecto
    jest.spyOn(emailService, 'sendEmail').mockResolvedValue({
      envelope: { from: 'no-reply@example.com', to: ['juan@example.com'] },
      accepted: ['juan@example.com'],
      rejected: [],
      pending: [],
      response: '250 OK',
      messageId: '12345',
    });

  });

  

  it('should include the correct token in the verification email', async () => {
  // Mock explícito de token generado
  const expectedToken = 'mockedToken';
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // Ejecutar el método
  await emailService.sendVerificationEmail('user@example.com');

  // Verificar que el token se incluye correctamente en el enlace
  expect(emailService.sendEmail).toHaveBeenCalledWith(
    'user@example.com',
    'Verifica tu correo electrónico',
    expect.stringContaining(`${baseUrl}/api/users/verify-email?token=${expectedToken}`)
  );
});


  it('should handle errors when sending an email fails', async () => {
    // Simular un error al enviar el correo
    const mockError = new Error('Error al enviar el correo de verificación');
    jest.spyOn(emailService, 'sendEmail').mockRejectedValue(mockError);
  
    try {
      // Intentar enviar un correo
      await emailService.sendVerificationEmail('user@example.com');
      // Si no lanza un error, forzamos fallo en la prueba
      fail('Se esperaba que lanzara un error, pero no lo hizo');
    } catch (error: unknown) {
      // Asegurarse de que el error sea una instancia de Error
      if (error instanceof Error) {
        // Validar que el error sea el esperado
        expect(error.message).toBe(mockError.message);
      } else {
        // Si el error no es una instancia de Error, forzamos fallo
        fail('El error no es una instancia de Error');
      }
    }
  
    // Verificar que el método `sendEmail` fue llamado con los parámetros correctos
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'user@example.com',
      'Verifica tu correo electrónico',
      expect.stringContaining('http://localhost:3000/api/users/verify-email?token='), // Asegura que contiene el enlace
    );
  });
  
  

  it('should generate the correct verification link', async () => {
    const baseUrl = 'http://localhost:3000';
    process.env.BASE_URL = baseUrl;

    // Ejecuta la función que envía el correo
    await emailService.sendVerificationEmail('user@example.com');

    // Verifica que el cuerpo del correo sea el esperado
    const expectedLink = `${baseUrl}/api/users/verify-email?token=mockedToken`;
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'user@example.com',
      'Verifica tu correo electrónico',
      expect.stringContaining(expectedLink) // Verifica que el enlace esté incluido.
    );

  });

  it('should send a verification email successfully', async () => {
    const verificationContent = `
      Hola Juan,
      Por favor, haz clic en el enlace para verificar tu correo electrónico:
      https://example.com/verify?token=abc123
    `;

    const mockResponse = {
      envelope: { from: 'no-reply@example.com', to: ['juan@example.com'] },
      accepted: ['juan@example.com'],
      rejected: [],
      response: '250 OK',
      messageId: '12345',
    };

    // Mockear la función sendEmail para devolver el resultado esperado
    emailService.sendEmail = jest.fn().mockResolvedValue(mockResponse);

    const result = await emailService.sendEmail(
      'juan@example.com',
      'Verifica tu correo electrónico',
      verificationContent
    );

    // Comprobar que el resultado sea el esperado
    expect(result).toEqual(mockResponse);

    // Verificar que sendEmail fue llamado con los parámetros correctos
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'juan@example.com',
      'Verifica tu correo electrónico',
      verificationContent
    );
  });

  it('should handle errors during sending verification email', async () => {
    const mockError = new Error('Error al enviar correo de verificación');
    emailService.sendEmail = jest.fn().mockRejectedValue(mockError);

    try {
      await emailService.sendEmail(
        'juan@example.com',
        'Verifica tu correo electrónico',
        'Por favor verifica tu correo electrónico'
      );
    } catch (error) {
      // Asegurarse de que el error sea el esperado
      expect(error).toEqual(mockError);
    }

    // Verificar que sendEmail fue llamado
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'juan@example.com',
      'Verifica tu correo electrónico',
      'Por favor verifica tu correo electrónico'
    );
  });
  
});
