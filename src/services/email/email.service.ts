// import nodemailer from 'nodemailer';
// import { generateToken } from '../../utils/jwt.utils';
// import path from 'path';
// import fs from 'fs';

// export class EmailService {
//   private transporter;

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });
//   }

//   /**
//    * Envía un correo electrónico genérico.
//    * @param to - Dirección del destinatario.
//    * @param subject - Asunto del correo.
//    * @param body - Contenido del correo.
//    * @returns Información sobre el correo enviado.
//    * @throws Error si ocurre un problema al enviar el correo.
//    */
//   async sendEmail(to: string, subject: string, body: string) {
//     try {
//       const info = await this.transporter.sendMail({
//         from: `"No-Reply" <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         text: body,
//       });

//       return info;
//     } catch (error) {
//       console.error('Error al enviar el correo:', error);
//       throw new Error('Error al enviar el correo');
//     }
//   }

//   /**
//    * Envía un correo de verificación con un enlace que incluye un token.
//    * @param to - Dirección del destinatario.
//    * @returns Información sobre el correo enviado.
//    */

//   async sendVerificationEmail(to: string) {
//     try {
//       const token = generateToken({ email: to }, '1h');
//       const verificationLink = `${process.env.BASE_URL}/api/users/verify-email?token=${token}`;
//       const emailBody = `
//         Hola,
//         Para validar tu correo electrónico, haz clic en el siguiente enlace:
//         ${verificationLink}
//         Si no solicitaste esto, ignora este mensaje.
//       `.trim();

//       return await this.sendEmail(to, 'Verifica tu correo electrónico', emailBody);
//     } catch (error: unknown) {
//       console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');

//       if (error instanceof Error) {
//         // Ahora podemos acceder a `error.message` de forma segura
//         if (error.message.includes('jwt')) {
//           throw new Error('Error generando el token');
//         }
//       }
//       throw new Error('Error al enviar el correo de verificación');
//     }
//   }

//   /**
//    * Envía un correo con un archivo adjunto.
//    * @param to - Dirección del destinatario.
//    * @param subject - Asunto del correo.
//    * @param body - Contenido del correo.
//    * @param filePath - Ruta al archivo que se enviará como adjunto.
//    */
//   async sendEmailWithAttachment(to: string, subject: string, body: string, filePath: string) {
//     try {
//       const fileContent = fs.createReadStream(filePath);

//       const info = await this.transporter.sendMail({
//         from: `"No-Reply" <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         text: body,
//         attachments: [
//           {
//             filename: path.basename(filePath),
//             content: fileContent,
//           },
//         ],
//       });

//       return info;
//     } catch (error) {
//       console.error('Error al enviar el correo con adjunto:', error);
//       throw new Error('Error al enviar el correo con adjunto');
//     }
//   }

// }

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
        text: body,
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
  async sendVerificationEmail(to: string) {
    try {
      const token = generateToken({ email: to }, "1h");
      const verificationLink = `${process.env.BASE_URL}/api/users/verify-email?token=${token}`;
      const emailBody = `Hola,\nPara validar tu correo electrónico, haz clic en el siguiente enlace:\n${verificationLink}\nSi no solicitaste esto, ignora este mensaje.`;

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
        text: body,
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
}
