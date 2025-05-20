import Restaurante from '../models/Restaurante.model.js';
import Reserva from '../models/Reserva.model.js';

const getAll = async () => {
  return await Restaurante.find().lean();
};

const getById = async (id) => {
  return await Restaurante.findById(id).lean();
};

const create = async (data) => {
  const nuevo = new Restaurante(data);
  return await nuevo.save();
};

const update = async (id, data) => {
  return await Restaurante.findByIdAndUpdate(id, data, { new: true }).lean();
};

const remove = async (id) => {
  await Restaurante.findByIdAndDelete(id);
};

const getReservationsByRestaurant = async (id) => {
  return await Reserva.find({ id_restaurante: id }).lean();
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getReservationsByRestaurant
};
