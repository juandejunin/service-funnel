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

  // 🔹 Tomamos las URLs permitidas desde el .env
  const allowedOrigins = (process.env.FRONTEND_URL_LOCAL || "")
    .split(",")
    .map(url => url.trim())
    .filter(Boolean);

  if (process.env.FRONTEND_URL_PROD) allowedOrigins.push(process.env.FRONTEND_URL_PROD);
  if (process.env.FRONTEND_URL_WWW) allowedOrigins.push(process.env.FRONTEND_URL_WWW);

  this.app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true); // permite Postman y solicitudes internas
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Preflight Requests dinámicos para cualquier endpoint
  this.app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
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