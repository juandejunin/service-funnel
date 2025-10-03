import path from "path";
import { Queue } from "bullmq";
import { IUser, UsuarioModel } from "../../models/user.model";
import { verifyToken } from "../../utils/jwt.utils";

// Clases de error personalizadas para mejorar la claridad
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

// Ruta del PDF que se envía a los usuarios
const PATHS = {
  PDF_FILE: path.join(
    __dirname,
    "../../files/Guía_gratuita_para_emprendedores_que_quieren_crecer_sin_complicaciones.pdf"
  ),
};

export class UserService {
  constructor(private emailQueue: Queue) {}

  /**
   * Devuelve la URL base del frontend, considerando local, prod o default
   */
  private getFrontendBaseUrl(): string {
    return (
      process.env.FRONTEND_URL_LOCAL ||
      process.env.FRONTEND_URL_PROD ||
      "http://localhost:4321"
    );
  }

  /**
   * Procesa la solicitud del usuario: nuevo registro o usuario existente
   */
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

  /**
   * Busca un usuario por email en la base de datos
   */
  private async findUserByEmail(email: string): Promise<IUser | null> {
    return await UsuarioModel.findOne({ email });
  }

  /**
   * Maneja el caso de un usuario existente
   * - Reenvía verificación si no está verificado
   * - Reenvía PDF si el nombre cambió
   * - Pregunta si desea recibir PDF si ya estaba verificado
   */
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

    await this.emailQueue.add("askForFileEmail", { email, nombre });
    return {
      mensaje:
        "Te hemos enviado un correo para confirmar si deseas recibir el archivo nuevamente",
    };
  }

  /**
   * Maneja el registro de un nuevo usuario
   */
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

  /**
   * Actualiza el nombre del usuario si cambió
   * Devuelve true si hubo cambios
   */
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

  /**
   * Elimina un usuario recién creado en caso de error
   */
  private async rollbackUserCreation(usuario: IUser): Promise<void> {
    if (usuario._id) {
      await UsuarioModel.findByIdAndDelete(usuario._id);
    }
  }

  /**
   * Valida que el nombre y email estén presentes
   */
  private validateInput(nombre: string, email: string): void {
    if (!nombre || !email) {
      throw new ValidationError("Nombre y email son requeridos");
    }
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(error: unknown): never {
    if (error instanceof ValidationError) throw error;
    if (error instanceof Error)
      throw new DatabaseError(`Error al procesar el usuario: ${error.message}`);
    throw new DatabaseError("Error desconocido al procesar la solicitud");
  }

  /**
   * Método público para registrar usuario
   */
  async createUser(
    nombre: string,
    email: string
  ): Promise<{ mensaje: string }> {
    return this.processUserRequest(nombre, email);
  }

  /**
   * Verifica el email del usuario usando token JWT
   * Devuelve URL de redirección al frontend según el resultado
   */
  async verifyUserEmail(
    token: string
  ): Promise<{ verificado: boolean; mensaje: string; redirectUrl: string }> {
    try {
      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey)
        throw new Error("La clave secreta JWT no está configurada.");

      const decoded = verifyToken(token, secretKey);
      const usuario = await this.findUserByEmail(decoded.email);

      if (!usuario) throw new ValidationError("Usuario no encontrado");
      if (usuario.isVerified) {
        return {
          verificado: true,
          mensaje: "El usuario ya estaba verificado",
          redirectUrl: `${this.getFrontendBaseUrl()}/success`,
        };
      }

      usuario.isVerified = true;
      await usuario.save();

      await this.emailQueue.add("sendFileEmail", {
        email: usuario.email,
        nombre: usuario.nombre || "amigo",
        filePath: PATHS.PDF_FILE,
      });

      return {
        verificado: true,
        mensaje: "Email verificado correctamente",
        redirectUrl: `${this.getFrontendBaseUrl()}/success`,
      };
    } catch (error) {
      return {
        verificado: false,
        mensaje: error instanceof Error ? error.message : "Error desconocido",
        redirectUrl: `${this.getFrontendBaseUrl()}/error`,
      };
    }
  }

  /**
   * Reenvía la guía PDF al usuario verificado
   */
  async resendFile(
    email: string
  ): Promise<{ mensaje: string; redirectUrl: string }> {
    try {
      const usuario = await this.findUserByEmail(email);
      if (!usuario) throw new ValidationError("Usuario no encontrado");
      if (!usuario.isVerified)
        throw new ValidationError("Usuario no verificado");

      await this.emailQueue.add("sendFileEmail", {
        email,
        nombre: usuario.nombre,
        filePath: PATHS.PDF_FILE,
      });

      return {
        mensaje: "PDF reenviado exitosamente",
        redirectUrl: `${this.getFrontendBaseUrl()}/success`,
      };
    } catch (error) {
      return {
        mensaje: error instanceof Error ? error.message : "Error desconocido",
        redirectUrl: `${this.getFrontendBaseUrl()}/error`,
      };
    }
  }
}

// Configuración de la cola de emails con Redis
const emailQueue = new Queue("emailQueue", {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

export const userService = new UserService(emailQueue);
