import Reserva from '../models/Reserva.model.js';

const create = async ({ id_cliente, id_restaurante, fecha, numero_personas }) => {
  const nueva = new Reserva({
    id_cliente,
    id_restaurante,
    fecha,
    numero_personas,
    estado: 'pendiente'
  });
  return await nueva.save();
};

const getById = async (id) => {
  return await Reserva.findById(id).lean();
};

const cancel = async (id) => {
  return await Reserva.findByIdAndUpdate(
    id,
    { estado: 'cancelada' },
    { new: true }
  ).lean();
};

const getByClienteId = async (id_cliente) => {
  return await Reserva.find({ id_cliente }).lean();
};

const getByRestauranteId = async (id_restaurante) => {
  return await Reserva.find({ id_restaurante }).lean();
};

export default {
  create,
  getById,
  cancel,
  getByClienteId,
  getByRestauranteId
};
