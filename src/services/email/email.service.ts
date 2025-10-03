import nodemailer from "nodemailer";
import { generateToken } from "../../utils/jwt.utils";
import path from "path";
import fs from "fs";

export class EmailService {
  private transporter;

  constructor() {
        // Configuración centralizada del transporter usando variables de entorno
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"No-Reply" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: body,
      });

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

  async sendVerificationEmail(to: string, nombre: string) {
    try {
      const token = generateToken({ email: to }, "1h");
      const verificationLink = `${process.env.BASE_URL}/api/users/verify-email?token=${token}`;
      const emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #ffffff; margin: 0; padding: 0; text-align: center;">
            <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #080436; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: center;">
              <div class="header" style="background-color: #080436; color: #FEB95F; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="font-size: 28px; margin: 0;">Verificá tu correo</h1>
              </div>
              <div class="message" style="font-size: 16px; line-height: 1.5; margin-top: 20px; color: #ffffff;">
                <p>Hola, ${nombre}</p>
                <p>Para validar tu correo, hacé clic en el botón:</p>
                <a href="${verificationLink}" 
                   style="display: inline-block; background-color: #FEB95F; color: #080436; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-size: 18px; text-align: center; border: none;">
                   Verificar mi correo
                </a>
                <p>Si no pediste esto, ignorá este mensaje.</p>
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

  async sendEmailWithAttachment(to: string, nombre: string, filePath: string) {
    console.log("este nombre recibe el sendEmail ", nombre);
    try {
      const fileContent = fs.createReadStream(filePath);
      const emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; text-align: center;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #080436; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #080436; color: #FEB95F; padding: 20px;">
                <h1 style="font-size: 28px; margin: 0;">¡Acá tenés tu guía, ${nombre}!</h1>
              </div>
              <div style="padding: 20px; color: white; font-size: 16px; line-height: 1.5;">
                <p>Ya está lista para que arranques a captar leads y hagas crecer tu negocio sin tantas vueltas. Descargala y empezá con el Secreto 1 hoy mismo.</p>
                <p>Si tenés alguna duda o querés charlar sobre cómo una landing puede cambiarte los resultados, escribime cuando quieras.</p>
                <p style="margin-top: 20px;">Mirá tu correo en los próximos días: te voy a mandar más ideas para sacarle jugo a estos secretos.</p>
              </div>
              <div style="background-color: #080436; color: #FFD700; padding: 10px; font-size: 12px;">
                <p>Por Juan Amieva – Desarrollador de páginas que convierten</p>
              </div>
            </div>
          </body>
        </html>
      `;
      const info = await this.transporter.sendMail({
        from: `"No-Reply" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Tu guía para optimizar tu negocio",
        html: emailBody,
        attachments: [
          { filename: path.basename(filePath), content: fileContent },
        ],
      });

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

  async sendFileRequestConfirmationEmail(to: string, nombre: string) {
    try {
      const token = generateToken({ email: to }, "24h");
      const resendUrl = `${process.env.BASE_URL}/api/users/resend-file?token=${token}`;
      const emailBody = `
        <html>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; text-align: center;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #080436; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #080436; color: #FEB95F; padding: 20px;">
                <h1 style="font-size: 28px; margin: 0;">¿Querés tu guía otra vez?</h1>
              </div>
              <div style="padding: 20px; color: white; font-size: 16px; line-height: 1.5;">
                <p>Hola ${nombre},</p>
                <p>Notamos que intentaste registrarte de nuevo. ¿Querés que te mandemos la guía otra vez?</p>
                <a href="${resendUrl}" style="display: inline-block; background-color: #FEB95F; color: #080436; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Sí, quiero la guía</a>
                <p>Este enlace vence en 24 horas. Si no pediste esto, ignorá este mensaje.</p>
              </div>
              <div style="background-color: #080436; color: #FFD700; padding: 10px; font-size: 12px;">
                <p>Por Juan Amieva – Desarrollador de páginas que convierten</p>
              </div>
            </div>
          </body>
        </html>
      `;
      return await this.sendEmail(to, "¿Querés tu guía otra vez?", emailBody);
    } catch (error) {
      console.error(
        "Error al enviar el correo de confirmación de archivo:",
        error
      );
      throw new Error("Error al enviar el correo de confirmación de archivo");
    }
  }
}
