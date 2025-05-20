import mongoose from 'mongoose';

const connectMongo = async (retries = 10, delay = 5000) => {
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Conectado a MongoDB');
      return;
    } catch (err) {
      console.error('Error al conectar a MongoDB, reintentando...', err.message);
      retries -= 1;
      await new Promise(res => setTimeout(res, delay));
    }
  }

  console.error('No se pudo conectar a MongoDB después de múltiples intentos');
  process.exit(1);
};

export default connectMongo;
