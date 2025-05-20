import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const ReservaSchema = new Schema({
  id_cliente: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  id_restaurante: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurante',
    required: true
  },
  fecha:           { type: Date,   required: true },
  numero_personas: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada'],
    required: true
  }
}, { timestamps: true });

export default model('Reserva', ReservaSchema);
