// import { Request, Response } from "express";
// import { Queue } from "bullmq";
// import { UserService } from "../services/user/user.service";
// import { verifyToken } from "../utils/jwt.utils";

// const emailQueue = new Queue("emailQueue", {
//   connection: {
//     host: process.env.REDIS_HOST || "redis",
//     port: parseInt(process.env.REDIS_PORT || "6379", 10),
//     password: process.env.REDIS_PASSWORD || undefined,
//   },
// });

// export class UserController {
//   private userService: UserService;

//   constructor() {
//     this.userService = new UserService(emailQueue);
//   }

//   async register(req: Request, res: Response) {
//     const { nombre, email } = req.body;
//     try {
//       const usuario = await this.userService.createUser(nombre, email);
//       res.status(201).json({
//         mensaje:
//           "¡Gracias por registrarte! Hemos enviado un correo electrónico con las indicaciones para completar tu registro.",
//         usuario,
//       });
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         res.status(400).json({ error: error.message });
//       } else {
//         res
//           .status(400)
//           .json({ error: "Error desconocido al registrar el usuario" });
//       }
//     }
//   }

//   async verifyEmail(req: Request, res: Response): Promise<void> {
//     const { token } = req.query;

//     if (!token) {
//       res.redirect(`${process.env.FRONTEND_URL_LOCAL || "http://localhost:4321"}/error`);
//       return;
//     }

//     try {
//       const result = await this.userService.verifyUserEmail(token as string);
//       res.redirect(result.redirectUrl);
//     } catch (error: unknown) {
//       res.redirect(`${process.env.FRONTEND_URL_LOCAL || "http://localhost:4321"}/error`);
//     }
//   }

//   async resendFile(req: Request, res: Response): Promise<void> {
//     const { token } = req.query;

//     if (!token) {
//       res.redirect(`${process.env.FRONTEND_URL_LOCAL || "http://localhost:4321"}/error`);
//       return;
//     }

//     try {
//       const secretKey = process.env.JWT_SECRET_KEY;
//       if (!secretKey) throw new Error("JWT secret key not configured");

//       const decoded = verifyToken(token as string, secretKey);
//       const email = decoded.email;

//       const result = await this.userService.resendFile(email);
//       res.redirect(result.redirectUrl);
//     } catch (error: unknown) {
//       res.redirect(`${process.env.FRONTEND_URL_LOCAL || "http://localhost:4321"}/error`);
//     }
//   }
// }


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
    this.userService = new UserService(emailQueue);
  }

  async register(req: Request, res: Response) {
    const { nombre, email } = req.body;
    console.log("➡️ [register] Datos recibidos:", { nombre, email });

    try {
      const usuario = await this.userService.createUser(nombre, email);
      console.log("✅ [register] Usuario creado:", usuario);

      res.status(201).json({
        mensaje:
          "¡Gracias por registrarte! Hemos enviado un correo electrónico con las indicaciones para completar tu registro.",
        usuario,
      });
    } catch (error: unknown) {
      console.error("❌ [register] Error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res
          .status(400)
          .json({ error: "Error desconocido al registrar el usuario" });
      }
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.query;
    console.log("➡️ [verifyEmail] Token recibido:", token);

    if (!token) {
      console.log("❌ [verifyEmail] Token faltante");
      res.redirect(`${process.env.FRONTEND_URL_LOCAL || "http://localhost:4321"}/error`);
      return;
    }

    try {
      const result = await this.userService.verifyUserEmail(token as string);
      console.log("✅ [verifyEmail] Resultado del servicio:", result);

      res.redirect(result.redirectUrl);
    } catch (error: unknown) {
      console.error("❌ [verifyEmail] Error:", error);
      res.redirect(`${process.env.FRONTEND_URL_LOCAL || "http://localhost:4321"}/error`);
    }
  }

  async resendFile(req: Request, res: Response): Promise<void> {
    const { token } = req.query;
    console.log("➡️ [resendFile] Token recibido:", token);

    if (!token) {
      console.log("❌ [resendFile] Token faltante");
      res.redirect(`${process.env.FRONTEND_URL_LOCAL || "http://localhost:4321"}/error`);
      return;
    }

    try {
      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey) throw new Error("JWT secret key not configured");

      const decoded = verifyToken(token as string, secretKey);
      console.log("✅ [resendFile] Token decodificado:", decoded);

      const email = decoded.email;
      const result = await this.userService.resendFile(email);

      console.log("✅ [resendFile] Resultado del servicio:", result);

      res.redirect(result.redirectUrl);
    } catch (error: unknown) {
      console.error("❌ [resendFile] Error:", error);
      res.redirect(`${process.env.FRONTEND_URL_LOCAL || "http://localhost:4321"}/error`);
    }
  }
}
