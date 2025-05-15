import Pedido from '../models/Pedido.model.js';

const create = async ({ id_cliente, id_restaurante, id_reserva = null }) => {
  const nuevo = new Pedido({
    id_cliente,
    id_restaurante,
    id_reserva,
    fecha: new Date(),
    estado: 'pendiente'
  });
  return await nuevo.save();
};

const getById = async (id) => {
  return await Pedido.findById(id).lean();
};

const getByClienteId = async (id_cliente) => {
  return await Pedido.find({ id_cliente }).lean();
};

const getByRestauranteId = async (id_restaurante) => {
  return await Pedido.find({ id_restaurante }).lean();
};

const updateEstado = async (id, estado) => {
  return await Pedido.findByIdAndUpdate(
    id,
    { estado },
    { new: true }
  ).lean();
};

const remove = async (id) => {
  await Pedido.findByIdAndDelete(id);
};

export default {
  create,
  getById,
  getByClienteId,
  getByRestauranteId,
  updateEstado,
  remove
};
