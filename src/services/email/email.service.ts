import nodemailer from "nodemailer";
import { generateToken } from "../../utils/jwt.utils";
import path from "path";
import fs from "fs";

export class EmailService {
  private transporter;

  constructor() {
    if (process.env.NODE_ENV === "production") {
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // Ethereal no usa SSL en este puerto
        auth: {
          user: process.env.ETHEREAL_USER,
          pass: process.env.ETHEREAL_PASS,
        },
      });
    }
  }

  /**
   * Envía un correo electrónico genérico.
   */
  async sendEmail(to: string, subject: string, body: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"No-Reply" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: body,
      });

      // Solo para pruebas: mostrar info si está en desarrollo
      if (process.env.NODE_ENV !== "production") {
        console.log("Mensaje enviado:", info.messageId);
        console.log("Vista previa en:", nodemailer.getTestMessageUrl(info));
      }

      return info;
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      throw new Error("Error al enviar el correo");
    }
  }

  /**
   * Envía un correo de verificación con un enlace que incluye un token.
   */
  async sendVerificationEmail(to: string, nombre: string) {
    try {
      const token = generateToken({ email: to }, "1h");
      const verificationLink = `${process.env.BASE_URL}/api/users/verify-email?token=${token}`;
      const emailBody = `
    <html>
  <body style="font-family: Arial, sans-serif; color: #ffffff; margin: 0; padding: 0; text-align: center;">
    <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: center;">
      <div class="header" style="background-color: #0056b3; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="font-size: 28px; margin: 0;">Verifica tu correo electrónico</h1>
      </div>
      <div class="message" style="font-size: 16px; line-height: 1.5; margin-top: 20px; color: #333;">
        <p>Hola, ${nombre}</p>
        <p>Para validar tu correo electrónico, haz clic en el siguiente enlace:</p>
        <a href="${verificationLink}" 
           style="display: inline-block; background-color: #007BFF; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-size: 18px; text-align: center; border: none;">
           Verificar mi correo
        </a>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      </div>
    </div>
  </body>
</html>

    `;

      return await this.sendEmail(
        to,
        "Verifica tu correo electrónico",
        emailBody
      );
    } catch (error) {
      console.error("Error al enviar el correo de verificación:", error);
      throw new Error("Error al enviar el correo de verificación");
    }
  }

  /**
   * Envía un correo con un archivo adjunto.
   */
  async sendEmailWithAttachment(
    to: string,
    subject: string,
    body: string,
    filePath: string
  ) {
    try {
      const fileContent = fs.createReadStream(filePath);

      const info = await this.transporter.sendMail({
        from: `"No-Reply" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: body,
        attachments: [
          { filename: path.basename(filePath), content: fileContent },
        ],
      });

      // Solo para pruebas: mostrar info si está en desarrollo
      if (process.env.NODE_ENV !== "production") {
        console.log("Correo con adjunto enviado:", info.messageId);
        console.log("Vista previa en:", nodemailer.getTestMessageUrl(info));
      }

      return info;
    } catch (error) {
      console.error("Error al enviar el correo con adjunto:", error);
      throw new Error("Error al enviar el correo con adjunto");
    }
  }

  async sendConfirmationEmail(
    email: string,
    nombre: string,
    confirmationLink: string
  ) {
    const subject = "Confirmación para recibir el PDF";
    const body = `
      <p>Hola ${nombre},</p>
      <p>Parece que has solicitado el PDF nuevamente. Para confirmar, haz clic en el siguiente enlace:</p>
      <p><a href="${confirmationLink}">Confirmar envío del PDF</a></p>
      <p>Si no solicitaste esto, ignora este mensaje.</p>
    `;
    await this.sendEmail(email, subject, body);
  }
}
