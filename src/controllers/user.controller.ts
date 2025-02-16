import { Request, Response } from 'express';
import { UserService } from '../services/user/user.service';



export class UserController {

  // Instancia de UserService almacenada en `this`
  private userService: UserService;

  // Constructor donde inicializamos `userService`
  constructor() {
    this.userService = new UserService(); // Instanciamos el servicio una sola vez
  }

  // Controlador para registrar un nuevo usuario
  async register(req: Request, res: Response) {
    const { nombre, email } = req.body;
    try {
      const usuario = await this.userService.createUser(nombre, email);
      res.status(201).json({ mensaje: '¡Gracias por registrarte! Hemos enviado un correo electrónico con las indicaciones para completar tu registro. Por favor, revisa tu bandeja de entrada (y también la carpeta de spam).', usuario });
    } catch (error: unknown) {
      // Comprobamos si el error es una instancia de Error
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        // Si el error no es una instancia de Error, respondemos con un error genérico
        res.status(400).json({ error: 'Error desconocido al registrar el usuario' });
      }
    }
  }


  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Token is required"
      });
      
    }

    try {
      const result = await this.userService.verifyUserEmail(token as string);

      if (result.verificado) {
        const redirectUrl = result.redirectUrl ?? `${process.env.FRONTEND_URL}/error`;
        return res.redirect(redirectUrl);
      } else {
         return res.redirect(`${process.env.FRONTEND_URL}/error`);
      }
    } catch (error: unknown) {
      console.error("Error verifying email:", error);

      return res.redirect(`${process.env.FRONTEND_URL}/error`);
    }
  }

}