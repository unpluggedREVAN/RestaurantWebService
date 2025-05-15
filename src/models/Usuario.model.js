import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const UsuarioSchema = new Schema({
  nombre:      { type: String, required: true },
  correo:      { type: String, required: true, unique: true },
  tipo_usuario:{ 
    type: String, 
    enum: ['administrador', 'cliente'], 
    required: true 
  }
}, { timestamps: true });

export default model('Usuario', UsuarioSchema);
