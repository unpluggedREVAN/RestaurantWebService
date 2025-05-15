import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const MenuSchema = new Schema({
  nombre:         { type: String, required: true },
  id_restaurante: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurante',
    required: true
  }
}, { timestamps: true });

export default model('Menu', MenuSchema);
