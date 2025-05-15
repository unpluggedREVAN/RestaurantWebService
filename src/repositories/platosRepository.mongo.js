import Plato from '../models/Plato.model.js';

const create = async ({ nombre, precio, descripcion, categoria, disponible, id_menu }) => {
  const nuevo = new Plato({
    nombre,
    precio,
    descripcion,
    categoria,
    disponible,
    id_menu
  });
  return await nuevo.save();
};

const getById = async (id) => {
  return await Plato.findById(id).lean();
};

const getByMenuId = async (id_menu) => {
  return await Plato.find({ id_menu }).lean();
};

const update = async (id, data) => {
  return await Plato.findByIdAndUpdate(id, data, { new: true }).lean();
};

const remove = async (id) => {
  await Plato.findByIdAndDelete(id);
};

export default {
  create,
  getById,
  getByMenuId,
  update,
  remove
};
