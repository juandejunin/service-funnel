import express, { Application } from 'express';
import userRoutes from '../routes/user.routes'
import path from 'path';
import { connectToDatabase } from './database';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger.config'; // Importa la configuración de Swagger

class Server {

    private app: Application;
    private port: string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '4000'

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
    }

    private routes() {
        this.app.use('/api/users', userRoutes); // Configura las rutas de usuarios

    }

    private setupSwagger() {
        // Middleware para Swagger
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
      }

    public async listen() {
        // Intentamos conectar a la base de datos antes de iniciar el servidor
        await connectToDatabase();

        // Levantamos el servidor
        this.app.listen(this.port, () => {
            console.log(`Servidor corriendo en el puerto: ${this.port}`);
            console.log(`Documentación disponible en http://localhost:${this.port}/api-docs`);
        });
    }

}

export default Server;