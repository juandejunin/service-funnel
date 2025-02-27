import { Worker } from "bullmq";
import { EmailService } from "../services/email/email.service";

const emailService = new EmailService();

export function startEmailWorker() {
  console.log("📩 Iniciando Email Worker...");

  const worker = new Worker(
    "emailQueue",
    async (job) => {
      const { email, nombre, filePath } = job.data;

      switch (job.name) {
        case "sendVerificationEmail":
          await emailService.sendVerificationEmail(email, nombre);
          break;
        case "sendFileEmail":
          await emailService.sendEmailWithAttachment(email, nombre, filePath);
          break;
        case "askForFileEmail":
          await emailService.sendFileRequestConfirmationEmail(email, nombre);
          break;
        default:
          throw new Error(`Tipo de job desconocido: ${job.name}`);
      }
    },
    {
      connection: {
        host: process.env.REDIS_HOST || "redis",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Correo enviado: ${job.id} - ${job.name}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Error en el envío del correo ${job?.id || "sin ID"}: ${err.message}`);
  });
}