import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const PedidoSchema = new Schema({
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
  id_reserva: {
    type: Schema.Types.ObjectId,
    ref: 'Reserva',
    default: null
  },
  fecha: { type: Date, required: true },
  estado: {
    type: String,
    enum: ['pendiente', 'preparando', 'completado', 'cancelado'],
    required: true
  }
}, { timestamps: true });

export default model('Pedido', PedidoSchema);
