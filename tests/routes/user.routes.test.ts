import { MockUserController } from '../../tests/mocks/mock.user.controller'; // Importa el controlador falso
import express from 'express';
import request from 'supertest';
import * as nodemailer from 'nodemailer';

// Configurar la app con el controlador falso
const app = express();
app.use(express.json());

// Usa el controlador falso para las rutas
const mockUserController = new MockUserController();
app.post('/api/users/register', (req, res) => mockUserController.register(req, res));

// Mock de nodemailer
jest.mock('nodemailer', () => {
  const sendMailMock = jest.fn().mockResolvedValue({
    envelope: { from: 'no-reply@example.com', to: ['carlos@example.com'] },
    accepted: ['carlos@example.com'],
    rejected: [],
    pending: [],
    response: '250 OK',
    messageId: '12345',
  });

  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: sendMailMock,
    }),
  };
});

describe('UserController - Register (Mock)', () => {
  it('should return 201 for successful user registration', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({ nombre: 'Carlos', email: 'carlos@example.com' });

    // Verifica la respuesta
    console.log(response.body); // Verifica la estructura de la respuesta

    // Valida que el código de estado sea 201
    expect(response.status).toBe(201);

    // Verifica que el mensaje de respuesta sea el esperado
    expect(response.body.mensaje).toBe('Usuario registrado correctamente');

    // Verifica que el usuario tenga el nombre y email esperados
    expect(response.body.usuario).toMatchObject({
      nombre: 'Carlos',
      email: 'carlos@example.com',
      _id: '12345', // ID ficticio del controlador falso
    });

    // Verificar que sendMail haya sido llamado correctamente
    const sendMailMock = nodemailer.createTransport().sendMail;
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'carlos@example.com',
        subject: 'Bienvenido a nuestra plataforma',
        text: 'Hola Carlos, gracias por registrarte en nuestra plataforma.',
        from: '"No-Reply" <juandejunin75@gmail.com>',
      })
    );
  });
  
});
