import { Worker } from 'bullmq';
import { EmailService } from '../services/email/email.service';
// import dotenv from 'dotenv';

// dotenv.config(); // Asegura que se cargan las variables de entorno

const emailService = new EmailService();

export function startEmailWorker() {
  console.log('📩 Iniciando Email Worker...');

  const worker = new Worker('emailQueue', async job => {
    if (job.name === 'sendVerificationEmail') {
      await emailService.sendVerificationEmail(job.data.email);
    } else if (job.name === 'sendFileEmail') {
      await emailService.sendEmailWithAttachment(
        job.data.email,
        'Tu archivo adjunto',
        'Gracias por verificar tu correo. Aquí tienes tu archivo.',
        job.data.filePath
      );
    }
  }, {
    connection: {
      host: 'localhost',
      port: 6379
    }
  });

  worker.on('completed', job => {
    console.log(`✅ Correo enviado: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Error en el envío del correo: ${err.message}`);
  });
}
