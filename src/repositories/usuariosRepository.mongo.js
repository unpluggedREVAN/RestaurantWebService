import Usuario from '../models/Usuario.model.js';

const getAll = async () => {
  return await Usuario.find().lean();
};

const getById = async (id) => {
  return await Usuario.findById(id).lean();
};

const create = async (data) => {
  return await new Usuario(data).save();
};

const update = async (id, data) => {
  return await Usuario.findByIdAndUpdate(id, data, { new: true }).lean();
};

const remove = async (id) => {
  await Usuario.findByIdAndDelete(id);
};

export default {
     getAll,
     getById,
     create,
     update,
     remove
};
