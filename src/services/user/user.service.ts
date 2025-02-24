import path from "path";
import { Queue } from "bullmq";
import { IUser, UsuarioModel } from "../../models/user.model";
import { verifyToken } from "../../utils/jwt.utils";

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

const PATHS = {
  PDF_FILE: path.join(__dirname, "../../files/archivo.pdf"),
};

export class UserService {
  constructor(private emailQueue: Queue) {}

  async processUserRequest(
    nombre: string,
    email: string
  ): Promise<{ mensaje: string }> {
    this.validateInput(nombre, email);
    try {
      const usuarioExistente = await this.findUserByEmail(email);
      return usuarioExistente
        ? await this.handleExistingUser(usuarioExistente, nombre, email)
        : await this.handleNewUser(nombre, email);
    } catch (error) {
      this.handleError(error);
    }
  }

  private async findUserByEmail(email: string): Promise<IUser | null> {
    return await UsuarioModel.findOne({ email });
  }

  private async handleExistingUser(
    usuario: IUser,
    nombre: string,
    email: string
  ): Promise<{ mensaje: string }> {
    const nombreActualizado = await this.updateNameIfChanged(usuario, nombre);
    if (!usuario.isVerified) {
      await this.emailQueue.add("sendVerificationEmail", { email, nombre });
      return { mensaje: "Correo de verificación reenviado" };
    }
    if (nombreActualizado) {
      await this.emailQueue.add("sendFileEmail", {
        email,
        filePath: PATHS.PDF_FILE,
      });
      return { mensaje: "Nombre actualizado y PDF reenviado" };
    }

    // Caso: usuario verificado, sin cambios en el nombre
    await this.emailQueue.add("askForFileEmail", { email, nombre });
    return {
      mensaje:
        "Te hemos enviado un correo para confirmar si deseas recibir el archivo nuevamente",
    };
  }

  private async handleNewUser(
    nombre: string,
    email: string
  ): Promise<{ mensaje: string }> {
    const nuevoUsuario = new UsuarioModel({ nombre, email });
    try {
      await nuevoUsuario.save();
      await this.emailQueue.add("sendVerificationEmail", { email, nombre });
      return { mensaje: "Usuario registrado y correo de verificación enviado" };
    } catch (error) {
      await this.rollbackUserCreation(nuevoUsuario);
      throw error;
    }
  }

  private async updateNameIfChanged(
    usuario: IUser,
    nombre: string
  ): Promise<boolean> {
    if (usuario.nombre !== nombre) {
      usuario.nombre = nombre;
      await usuario.save();
      return true;
    }
    return false;
  }

  private async rollbackUserCreation(usuario: IUser): Promise<void> {
    if (usuario._id) {
      await UsuarioModel.findByIdAndDelete(usuario._id);
    }
  }

  private validateInput(nombre: string, email: string): void {
    if (!nombre || !email) {
      throw new ValidationError("Nombre y email son requeridos");
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof ValidationError) throw error;
    if (error instanceof Error)
      throw new DatabaseError(`Error al procesar el usuario: ${error.message}`);
    throw new DatabaseError("Error desconocido al procesar la solicitud");
  }

  async createUser(
    nombre: string,
    email: string
  ): Promise<{ mensaje: string }> {
    return this.processUserRequest(nombre, email);
  }

  async updateUser(email: string, nombre: string): Promise<IUser> {
    try {
      const usuario = await this.findUserByEmail(email);
      if (!usuario) throw new ValidationError("Usuario no encontrado");
      usuario.nombre = nombre;
      await usuario.save();
      return usuario;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteUser(email: string): Promise<{ message: string }> {
    try {
      const usuario = await this.findUserByEmail(email);
      if (!usuario) throw new ValidationError("Usuario no encontrado");
      await UsuarioModel.findByIdAndDelete(usuario._id);
      return { message: "Usuario eliminado exitosamente" };
    } catch (error) {
      this.handleError(error);
    }
  }

  // async verifyUserEmail(
  //   token: string
  // ): Promise<{ verificado: boolean; mensaje: string; redirectUrl?: string }> {
  //   try {
  //     const secretKey = process.env.JWT_SECRET_KEY;
  //     if (!secretKey)
  //       throw new Error("La clave secreta JWT no está configurada.");
  //     const decoded = jwt.verify(token, secretKey) as { email: string };
  //     const usuario = await this.findUserByEmail(decoded.email);

  //     if (!usuario) throw new ValidationError("Usuario no encontrado");
  //     if (usuario.isVerified)
  //       return { verificado: true, mensaje: "El usuario ya estaba verificado" };

  //     usuario.isVerified = true;
  //     await usuario.save();

  //     await this.emailQueue.add("sendFileEmail", {
  //       email: usuario.email,
  //       nombre: usuario.nombre,
  //       filePath: PATHS.PDF_FILE,
  //     });

  //     return {
  //       verificado: true,
  //       mensaje: "Email verificado correctamente",
  //       redirectUrl: `${process.env.FRONTEND_URL}/success`,
  //     };
  //   } catch (error) {
  //     if (error instanceof jwt.JsonWebTokenError) {
  //       return { verificado: false, mensaje: "Token inválido o expirado" };
  //     }
  //     this.handleError(error);
  //   }
  // }

  async verifyUserEmail(token: string): Promise<{ verificado: boolean; mensaje: string; redirectUrl?: string }> {
    try {
      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey) throw new Error("La clave secreta JWT no está configurada.");

      const decoded = verifyToken(token, secretKey);
      const usuario = await this.findUserByEmail(decoded.email);

      if (!usuario) throw new ValidationError("Usuario no encontrado");
      if (usuario.isVerified) return { verificado: true, mensaje: "El usuario ya estaba verificado" };

      usuario.isVerified = true;
      await usuario.save();

      await this.emailQueue.add("sendFileEmail", {
        email: usuario.email,
        nombre: usuario.nombre,
        filePath: PATHS.PDF_FILE,
      });

      return {
        verificado: true,
        mensaje: "Email verificado correctamente",
        redirectUrl: `${process.env.FRONTEND_URL}/success`,
      };
    } catch (error) {
      if (error instanceof Error) {
        return { verificado: false, mensaje: error.message };
      }
      this.handleError(error);
    }
  }
  async resendFile(email: string): Promise<{ mensaje: string, redirectUrl?: string }> {
    try {
      const usuario = await this.findUserByEmail(email);
      if (!usuario) throw new ValidationError("Usuario no encontrado");
      if (!usuario.isVerified) throw new ValidationError("Usuario no verificado");
  
      await this.emailQueue.add("sendFileEmail", {
        email,
        filePath: PATHS.PDF_FILE,
      });
      return { mensaje: "PDF reenviado exitosamente", redirectUrl: `${process.env.FRONTEND_URL}/success` };
    } catch (error) {
      if (error instanceof Error) {
        return { mensaje: error.message }; // Devolvemos un objeto en caso de error
      }
      return { mensaje: "Error desconocido al reenviar el archivo" };
    }
  }
}

const emailQueue = new Queue("emailQueue", {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

export const userService = new UserService(emailQueue);
