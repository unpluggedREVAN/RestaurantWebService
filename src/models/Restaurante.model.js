import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const RestauranteSchema = new Schema({
  nombre:           { type: String, required: true },
  direccion:        { type: String, required: true },
  telefono:         { type: String, required: true },
  id_administrador: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, { timestamps: true });

export default model('Restaurante', RestauranteSchema);
