import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

export class MockUserController {
  async register(req: Request, res: Response) {
    const { nombre, email } = req.body;

    try {
      // Simula el envío del correo electrónico
      const transporter = nodemailer.createTransport();
      await transporter.sendMail({
        from: '"No-Reply" <juandejunin75@gmail.com>',
        to: email,
        subject: 'Bienvenido a nuestra plataforma',
        text: `Hola ${nombre}, gracias por registrarte en nuestra plataforma.`,
      });

      // Responde con un usuario ficticio
      res.status(201).json({
        mensaje: 'Usuario registrado correctamente',
        usuario: { nombre, email, _id: '12345' },
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al registrar el usuario' });
    }
  }
}
