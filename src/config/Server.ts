import express, { Application } from "express";
import cors from "cors";
import userRoutes from "../routes/user.routes";
import path from "path";
import { connectToDatabase } from "./database";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./swagger.config"; // Importa la configuración de Swagger
import { startEmailWorker } from "../workers/email.worker";

class Server {
  private app: Application;
  private port: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || "4000";

    this.middlewares();
    this.routes(); // Configuración de rutas
    this.setupSwagger(); // Configuración de Swagger
  }

  // Getter para acceder a 'app' de manera pública
  public getApp(): Application {
    return this.app;
  }

  private middlewares() {
    this.app.use(express.json()); // Middleware para parsear JSON

    // 🔹 Configurar CORS para permitir peticiones desde el frontend
    this.app.use(cors({
        origin: ['http://localhost:4321', 'https://tudominio.com'], // Solo estos orígenes están permitidos
        methods: ['GET', 'POST'], // Solo permitimos estos métodos
        allowedHeaders: ['Content-Type', 'Authorization'], // Solo permitimos estos encabezados
        credentials: true // Habilitamos credenciales si es necesario
    }));
    
    // Manejo específico de Preflight Requests
    this.app.options('/api/users/register', (req, res) => {
        res.header('Access-Control-Allow-Origin', 'http://localhost:4321');
        res.header('Access-Control-Allow-Methods', 'POST');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.sendStatus(204); // Código 204 indica que no hay contenido en la respuesta
    });
  }

  private routes() {
    this.app.use("/api/users", userRoutes); // Configura las rutas de usuarios
  }

  private setupSwagger() {
    // Middleware para Swagger
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  }

  public async listen() {
    // Intentamos conectar a la base de datos antes de iniciar el servidor
    await connectToDatabase();

    startEmailWorker(); // 🔹 Iniciar el worker después de la conexión

    // Levantamos el servidor
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en el puerto: ${this.port}`);
      console.log(
        `Documentación disponible en http://localhost:${this.port}/api-docs`
      );
    });
  }
}

export default Server;
