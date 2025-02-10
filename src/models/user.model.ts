import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";

// Interfaz para definir las propiedades de un Usuario
export interface IUser extends Document {
  nombre: string;
  email: string;
  fechaDeRegistro: Date;
  isVerified: boolean; // Nuevo campo
}

// Definimos el esquema para MongoDB
const usuarioSchema = new Schema<IUser>(
  {
    nombre: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      match: /^[a-zA-ZáéíóúÁÉÍÓÚüÜ\s]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: { unique: true, collation: { locale: "en", strength: 2 } },
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "El email no es válido.",
      },
      minlength: 5,
      maxlength: 100,
    },
    fechaDeRegistro: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    isVerified: {
      type: Boolean,
      default: false, // Por defecto es false
    },
  },
  { strict: true }
);

// Pre-guardado para sanitizar entradas
usuarioSchema.pre<IUser>("save", function (next) {
  this.nombre = validator.escape(this.nombre.trim());
  this.email = validator.normalizeEmail(this.email.trim()) as string;
  next();
});

// Modelo de Mongoose
export const UsuarioModel = mongoose.model<IUser>("Usuario", usuarioSchema);

// Clase Usuario con métodos y propiedades
export class Usuario {
  private nombre: string;
  private email: string;
  private readonly fechaDeRegistro: Date;
  private isVerified: boolean;

  constructor(nombre: string, email: string) {
    this.nombre = nombre;
    this.email = email;
    this.fechaDeRegistro = new Date();
    this.isVerified = false; // Inicializa como no verificado
  }

  getNombre(): string {
    return this.nombre;
  }

  setEmail(email: string): void {
    this.email = email;
  }

  setIsVerified(isVerified: boolean): void {
    this.isVerified = isVerified;
  }

  getIsVerified(): boolean {
    return this.isVerified;
  }

  async toObject(): Promise<IUser> {
    let usuario = await UsuarioModel.findOne({ email: this.email });
    if (!usuario) {
      usuario = new UsuarioModel({
        nombre: this.nombre,
        email: this.email,
        fechaDeRegistro: this.fechaDeRegistro,
        isVerified: this.isVerified,
      });
      await usuario.save();
    }
    return usuario.toObject();
  }
}
