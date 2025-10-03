import express, { Application } from "express";
import cors from "cors";
import userRoutes from "../routes/user.routes";
import path from "path";
import { connectToDatabase } from "./database";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./swagger.config";
import { startEmailWorker } from "../workers/email.worker";

class Server {
  private app: Application;
  private port: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || "4000";

    this.middlewares();
    this.routes();
    this.setupSwagger();
  }

  public getApp(): Application {
    return this.app;
  }

  private middlewares() {
    this.app.use(express.json());

    // 🔹 Configurar CORS con variables de entorno
    const allowedOrigins = [
      process.env.FRONTEND_URL_LOCAL || "http://localhost:4321", // Para desarrollo
      process.env.FRONTEND_URL_PROD || "https://tusistema.es",   // Para producción
      process.env.FRONTEND_URL_WWW || "https://www.tusistema.es",
    ];

    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Permitir solicitudes sin origen (como Postman) o desde los orígenes permitidos
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );

    // Manejo específico de Preflight Requests
    this.app.options("/api/users/register", (req, res) => {
      res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL_LOCAL || "http://localhost:4321");
      res.header("Access-Control-Allow-Methods", "POST");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.sendStatus(204);
    });
  }

  private routes() {
    this.app.use("/api/users", userRoutes);
  }

  private setupSwagger() {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  }

  public async listen() {
    await connectToDatabase();
    startEmailWorker();

    // Usamos BASE_URL para Swagger en lugar de localhost
    const baseUrl = process.env.BASE_URL || "http://localhost:4000";
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en el puerto: ${this.port}`);
      console.log(`Documentación disponible en ${baseUrl}/api-docs`);
    });
  }
}

export default Server;