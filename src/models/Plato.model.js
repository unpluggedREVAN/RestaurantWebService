import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const PlatoSchema = new Schema({
  nombre:      { type: String, required: true },
  descripcion: { type: String, default: 'Producto sin descripción' },
  precio:      { type: Number, required: true },
  categoria:   { type: String },
  disponible:  { type: Boolean, default: true },
  id_menu:     {
    type: Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  }
}, { timestamps: true });

export default model('Plato', PlatoSchema);
