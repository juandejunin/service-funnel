import mongoose from 'mongoose';

// Conexión a la base de datos MongoDB
const connectToDatabase = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/landingPageDB';
    await mongoose.connect(uri);
    console.log('Conexión exitosa a la base de datos MongoDB');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1); // Finaliza la aplicación si no se puede conectar
  }
};

// Función para desconectar de la base de datos
const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Desconexión exitosa de la base de datos MongoDB');
  } catch (error) {
    console.error('Error al desconectar de la base de datos:', error);
  }
};

export { connectToDatabase, disconnectFromDatabase };
