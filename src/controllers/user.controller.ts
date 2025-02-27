import { Request, Response } from "express";
import { Queue } from "bullmq";
import { UserService } from "../services/user/user.service";
import { verifyToken } from "../utils/jwt.utils";

const emailQueue = new Queue("emailQueue", {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService(emailQueue); // Usamos Queue directamente
  }

  async register(req: Request, res: Response) {
    const { nombre, email } = req.body;
    try {
      const usuario = await this.userService.createUser(nombre, email);
      res.status(201).json({
        mensaje:
          "¡Gracias por registrarte! Hemos enviado un correo electrónico con las indicaciones para completar tu registro. Por favor, revisa tu bandeja de entrada (y también la carpeta de spam).",
        usuario,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Error desconocido al registrar el usuario" });
      }
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Token is required",
      });
      return;
    }

    try {
      const result = await this.userService.verifyUserEmail(token as string);

      if (result.verificado) {
        const redirectUrl = result.redirectUrl ?? `${process.env.FRONTEND_URL}/error`;
        res.redirect(redirectUrl);
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/error`);
      }
    } catch (error: unknown) {
      console.error("Error verifying email:", error);
      res.redirect(`${process.env.FRONTEND_URL}/error`);
    }
  }

  // async resendFile(req: Request, res: Response): Promise<void> {
  //   const { token } = req.query;

  //   if (!token) {
  //     res.status(400).json({ error: "Token is required" });
  //     return;
  //   }

  //   try {
  //     const secretKey = process.env.JWT_SECRET_KEY;
  //     if (!secretKey) throw new Error("JWT secret key not configured");

  //     // Usamos verifyToken de jwt.utils.ts
  //     const decoded = verifyToken(token as string, secretKey);
  //     const email = decoded.email; // Extraemos el email del payload

  //     const result = await this.userService.resendFile(email);
  //     res.status(200).json({ mensaje: result.mensaje });
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       // Los errores de verifyToken ya están personalizados, así que usamos el mensaje directamente
  //       res.status(400).json({ error: error.message });
  //     } else {
  //       res.status(500).json({ error: "Error desconocido al reenviar el archivo" });
  //     }
  //   }
  // }

  async resendFile(req: Request, res: Response): Promise<void> {
    const { token } = req.query;
  
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }
  
    try {
      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey) throw new Error("JWT secret key not configured");
      const decoded = verifyToken(token as string, secretKey);
      const email = decoded.email;
  
      const result = await this.userService.resendFile(email);
      if (result.redirectUrl) {
        res.redirect(result.redirectUrl); // Redirige si hay URL
      } else {
        res.status(400).json({ error: result.mensaje }); // Error si no hay redirectUrl
      }
    } catch (error: unknown) {
      console.error("Error resending file:", error);
      res.redirect(`${process.env.FRONTEND_URL}/error`); // Redirige a error en caso de excepción
    }
  }
}
