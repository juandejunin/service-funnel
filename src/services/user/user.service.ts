import path from "path";
import { Queue } from "bullmq";
import { UsuarioModel } from "../../models/user.model";
import { EmailService } from "../email/email.service";
// import { DatabaseError } from '../errors/DatabaseError';
import jwt from "jsonwebtoken";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class UserService {
  private emailQueue: Queue;

  constructor(private emailService = new EmailService()) {
    // Configurar la cola de emails con Redis
    this.emailQueue = new Queue('emailQueue', {
      connection: {
        host: process.env.REDIS_HOST || 'redis',// Ajustar según configuración
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined
      }
    });
  }

  // Método para manejar solicitudes de usuario
  async processUserRequest(nombre: string, email: string) {
    try {
      // Buscar si el usuario ya existe en la a de datos
      const usuarioExistente = await UsuarioModel.findOne({ email });

      if (usuarioExistente) {
        // Caso 1: Usuario existe pero no está verificado
        if (!usuarioExistente.isVerified) {
          await this.emailQueue.add('sendVerificationEmail', { email });
          return { mensaje: "Correo de verificación reenviado" };
        }

        // Caso 2: Usuario existe y está verificado
        const filePath = path.join(__dirname, "../../files/archivo.pdf"); // Ruta al archivo PDF
        await this.emailQueue.add('sendFileEmail', { email, filePath });
        return { mensaje: "PDF reenviado al usuario verificado" };
      }

      // Caso 3: Usuario no existe, crear nuevo usuario y enviar correo de verificación
      const nuevoUsuario = new UsuarioModel({ nombre, email });
      try {
        await nuevoUsuario.save(); // Guardar el usuario
        await this.emailQueue.add('sendVerificationEmail', { email });

      } catch (error) {
        // Si el envío de correo falla, eliminamos el usuario creado
        if (nuevoUsuario._id) {
          await UsuarioModel.findByIdAndDelete(nuevoUsuario._id);
        }
        throw error; // Repropagar el error
      }

      return { mensaje: "Usuario registrado y correo de verificación enviado" };
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw error; // Repropagar errores de validación
      }
      if (error instanceof Error) {
        throw new DatabaseError(
          `Error al guardar el usuario: ${error.message}`
        );
      }
      throw new DatabaseError("Error desconocido al procesar la solicitud");
    }
  }

  // Método para crear un usuario (delegado a processUserRequest)
  async createUser(nombre: string, email: string) {
    return this.processUserRequest(nombre, email);
  }

  // Método para actualizar un usuario
  async updateUser(email: string, nombre: string) {
    try {
      const usuario = await UsuarioModel.findOne({ email });
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      usuario.nombre = nombre;
      await usuario.save();

      return usuario;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(
          `Error al actualizar el usuario: ${error.message}`
        );
      } else {
        throw new DatabaseError("Error desconocido al actualizar el usuario");
      }
    }
  }

  // Método para eliminar un usuario
  async deleteUser(email: string) {
    try {
      const usuario = await UsuarioModel.findOne({ email });
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      await UsuarioModel.findByIdAndDelete(usuario._id);

      return { message: "Usuario eliminado exitosamente" };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(
          `Error al eliminar el usuario: ${error.message}`
        );
      } else {
        throw new DatabaseError("Error desconocido al eliminar el usuario");
      }
    }
  }

  // Método para verificar el email del usuario
  // async verifyUserEmail(token: string) {
  //   try {
  //     const secretKey = process.env.JWT_SECRET_KEY;

  //     if (!secretKey) {
  //       throw new Error("La clave secreta JWT no está configurada.");
  //     }

  //     // Decodificar el token para obtener el email
  //     const decoded = jwt.verify(token, secretKey) as { email: string };

  //     const usuario = await UsuarioModel.findOne({ email: decoded.email });
  //     if (!usuario) {
  //       throw new Error("Usuario no encontrado");
  //     }

  //     // Verificar si ya está verificado
  //     if (usuario.isVerified) {
  //       return { verificado: true, mensaje: "El usuario ya estaba verificado" };
  //     }

  //     // Actualizar el estado de verificación
  //     usuario.isVerified = true;
  //     await usuario.save();

  //     const filePath = path.join(__dirname, "../files/archivo.pdf"); // Ruta al archivo PDF

  //     await this.emailService.sendEmailWithAttachment(
  //       usuario.email,
  //       "Tu archivo adjunto",
  //       "Gracias por verificar tu correo. Aquí tienes tu archivo.",
  //       filePath
  //     );

  //     return { verificado: true, mensaje: "Email verificado correctamente" };
  //   } catch (error: unknown) {
  //     if (error instanceof jwt.JsonWebTokenError) {
  //       return { verificado: false, mensaje: "Token inválido o expirado" };
  //     }
  //     throw error;
  //   }
  // }
  async verifyUserEmail(token: string) {
    try {
      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey) {
        throw new Error("La clave secreta JWT no está configurada.");
      }

      const decoded = jwt.verify(token, secretKey) as { email: string };
      const usuario = await UsuarioModel.findOne({ email: decoded.email });

      if (!usuario) throw new Error("Usuario no encontrado");
      if (usuario.isVerified) return { verificado: true, mensaje: "El usuario ya estaba verificado" };

      usuario.isVerified = true;
      await usuario.save();

      const filePath = path.join(__dirname, '../files/archivo.pdf');
      await this.emailQueue.add('sendFileEmail', { email: usuario.email, filePath });

      return { verificado: true, mensaje: "Email verificado correctamente" };
    } catch (error: unknown) {
      if (error instanceof jwt.JsonWebTokenError) {
        return { verificado: false, mensaje: "Token inválido o expirado" };
      }
      throw error;
    }
  }
}
