import express, { Application } from "express";
import cors from "cors";
import userRoutes from "../routes/user.routes";
import articleRoutes from "../routes/article.routes";
import { connectToDatabase } from "./database";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./swagger.config";
import { startEmailWorker } from "../workers/email.worker";

class Server {
  private app: Application;
  private port: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || "3000";

    this.middlewares();
    this.routes();
    this.setupSwagger();
  }

  public getApp(): Application {
    return this.app;
  }

  private middlewares() {
    this.app.use(express.json());

    // 🔹 Confiar en proxy (Nginx) para HTTPS
    this.app.set("trust proxy", true);

    // 🔹 Configurar CORS para aceptar todos los orígenes (solo para pruebas)
    const corsOptions = {
      origin: (origin: string | undefined, callback: Function) => {
        console.log("Request origin:", origin); // Log para depurar el origen
        callback(null, true); // Permite todos los orígenes
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With", "X-API-Key"],
      credentials: true,
    };

    console.log("CORS configuration:", corsOptions); // Log para confirmar la configuración

    this.app.use(cors(corsOptions));

    // 🔹 Manejo global de preflight para todos los endpoints
    this.app.options("*", cors(corsOptions));
  }

  private routes() {
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/articles", articleRoutes);
  }

  private setupSwagger() {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  }

  public async listen() {
    await connectToDatabase();
    startEmailWorker();

    const baseUrl = process.env.BASE_URL || `https://tusistema.es`;
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en el puerto: ${this.port}`);
      console.log(`Documentación disponible en ${baseUrl}/api-docs`);
    });
  }
}

export default Server;