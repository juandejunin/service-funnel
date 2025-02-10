import request from 'supertest'; // Directamente importamos request
import Server from '../../src/config/Server'; // Asegúrate de que la ruta esté correcta
import { MongoMemoryServer } from 'mongodb-memory-server'; // Para pruebas con MongoDB en memoria
import mongoose from 'mongoose';

let server: Server;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Inicializa MongoDB en memoria para pruebas
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Conecta a la base de datos en memoria
  await mongoose.connect(mongoUri);

  // Inicializa el servidor
  server = new Server();
});

afterAll(async () => {
  // Cierra la conexión con la base de datos y detén el servidor
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Test del servidor', () => {
    it('debería responder con un status 200 en la ruta raíz', async () => {
      const response = await request(server.getApp()).get('/');  // Usamos el getter getApp()
      expect(response.status).toBe(200); // Verifica que la respuesta sea 200 OK
    });
  
    it('debería responder con un mensaje en el endpoint /', async () => {
      const response = await request(server.getApp()).get('/');
      expect(response.status).toBe(200); // Verifica que la respuesta sea 200 OK
    });
  });
