import Menu from '../models/Menu.model.js';

const getById = async (id) => {
  return await Menu.findById(id).lean();
};

const getByRestauranteId = async (id_restaurante) => {
  return await Menu.find({ id_restaurante }).lean();
};

const create = async ({ nombre, id_restaurante }) => {
  const nuevo = new Menu({ nombre, id_restaurante });
  return await nuevo.save();
};

const update = async (id, { nombre, id_restaurante }) => {
  return await Menu.findByIdAndUpdate(
    id,
    { nombre, id_restaurante },
    { new: true }
  ).lean();
};

const remove = async (id) => {
  await Menu.findByIdAndDelete(id);
};

export default {
  getById,
  getByRestauranteId,
  create,
  update,
  remove
};
