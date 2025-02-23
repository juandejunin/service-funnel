import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Registro de Usuarios',
      version: '1.0.0',
      description: 'API para registrar usuarios, verificar correos y enviar productos digitales.',
    },
    servers: [
      { url: process.env.BASE_URL },
      
    ],
  },
  apis: [path.join(__dirname, '../routes/user.routes.js')], // Ruta absoluta
};

console.log('Swagger BASE_URL:', process.env.BASE_URL);


const swaggerSpecs = swaggerJsdoc(swaggerOptions);

export default swaggerSpecs;
