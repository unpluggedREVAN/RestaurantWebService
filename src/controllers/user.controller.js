import repo from '../repositories/usuariosRepository.js';
import redisClient from '../config/redis.js';

// POST /usuarios
export const crearUsuario = async (req, res) => {
  const { nombre, correo, tipo_usuario } = req.body;
  if (!nombre || !correo || !tipo_usuario) {
    return res.status(400).json({ status: 'error', message: 'Faltan datos requeridos.' });
  }
  try {
    const nuevo = await repo.create({ nombre, correo, tipo_usuario });
    res.status(201).json({
      status: 'success',
      message: 'Usuario creado exitosamente',
      data: nuevo
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al crear el usuario', error: error.message });
  }
};

// GET /usuarios
export const getUsuarios = async (req, res) => {
  const cacheKey = 'usuarios:all';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        message: 'Usuarios obtenidos desde caché',
        data: JSON.parse(cached)
      });
    }
    const lista = await repo.getAll();
    await redisClient.setEx(cacheKey, 300, JSON.stringify(lista));
    res.status(200).json({
      status: 'success',
      message: 'Usuarios obtenidos desde la base de datos',
      data: lista
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener usuarios', error: error.message });
  }
};

// GET /usuarios/:id
export const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `usuario:${id}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        message: 'Usuario obtenido desde caché',
        data: JSON.parse(cached)
      });
    }
    const usuario = await repo.getById(id);
    if (!usuario) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    await redisClient.setEx(cacheKey, 300, JSON.stringify(usuario));
    res.status(200).json({
      status: 'success',
      message: 'Usuario obtenido desde la base de datos',
      data: usuario
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener el usuario', error: error.message });
  }
};

// PUT /usuarios/:id
export const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const cambios = req.body;
  try {
    const existente = await repo.getById(id);
    if (!existente) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    const actualizado = await repo.update(id, cambios);
    // invalidar caché
    await redisClient.del(`usuario:${id}`);
    await redisClient.del('usuarios:all');
    res.status(200).json({
      status: 'success',
      message: 'Usuario actualizado exitosamente',
      data: actualizado
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al actualizar el usuario', error: error.message });
  }
};

// DELETE /usuarios/:id
export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const existente = await repo.getById(id);
    if (!existente) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    await repo.remove(id);
    // invalidar caché
    await redisClient.del(`usuario:${id}`);
    await redisClient.del('usuarios:all');
    res.status(200).json({
      status: 'success',
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al eliminar el usuario', error: error.message });
  }
};
