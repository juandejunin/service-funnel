import { Worker } from 'bullmq';
import { EmailService } from '../services/email/email.service';

const emailService = new EmailService();

export function startEmailWorker() {
  console.log('📩 Iniciando Email Worker...');

  const worker = new Worker('emailQueue', async job => {
    if (job.name === 'sendVerificationEmail') {
      await emailService.sendVerificationEmail(job.data.email, job.data.nombre);
    } else if (job.name === 'sendFileEmail') {
      const htmlContent = `
    <html>
  <body style="font-family: Arial, sans-serif; color: #ffffff; margin: 0; padding: 0; text-align: center;">
    <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: center;">
      <div class="header" style="background-color: #0056b3; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="font-size: 28px; margin: 0;">Tu guia</h1>
      </div>
      <div class="message" style="font-size: 16px; line-height: 1.5; margin-top: 20px; color: #333;">
        <p>Gracias por verificar tu correo, ${job.data.nombre}</p>
        <p>Si tienes alguna pregunta, no dudes en ponerte en contacto con nosotros.</p>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      </div>
    </div>
  </body>
</html>
      `;

      await emailService.sendEmailWithAttachment(
        job.data.email,
        'Tu archivo adjunto',
        htmlContent, // Cuerpo en formato HTML
        job.data.filePath
      );
    }
  }, {
    connection: {
      host: process.env.REDIS_HOST || 'redis',// Ajustar según configuración
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined
    }
  });

  worker.on('completed', job => {
    console.log(`✅ Correo enviado: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Error en el envío del correo: ${err.message}`);
  });
}
