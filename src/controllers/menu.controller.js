import repo from '../repositories/menusRepository.js';
import redisClient from '../config/redis.js';

// POST /menus
export const crearMenu = async (req, res) => {
  const { nombre, id_restaurante } = req.body;

  if (!nombre || !id_restaurante) {
    return res.status(400).json({ status: "error", message: "Faltan datos requeridos." });
  }

  try {
    const nuevo = await repo.create({ nombre, id_restaurante });

    res.status(201).json({
      status: "success",
      message: "Menú creado exitosamente",
      data: nuevo
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al crear el menú", error: error.message });
  }
};

// GET /menus/:id
export const getMenuId = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `menu:${id}`;

  try {
    const cachedMenu = await redisClient.get(cacheKey);
    if (cachedMenu) {
      return res.status(200).json({
        status: "success",
        message: "Menú obtenido desde caché",
        data: JSON.parse(cachedMenu)
      });
    }

    const menu = await repo.getById(id);
    if (!menu) {
      return res.status(404).json({ status: "error", message: "Menú no encontrado" });
    }

    await redisClient.setEx(cacheKey, 120, JSON.stringify(menu));

    return res.status(200).json({
      status: "success",
      message: "Menú obtenido desde la base de datos",
      data: menu
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al obtener el menú", error: error.message });
  }
};

// PUT /menus/:id
export const actualizarMenu = async (req, res) => {
  const { id } = req.params;
  const { nombre, id_restaurante } = req.body;

  try {
    const existente = await repo.getById(id);
    if (!existente) {
      return res.status(404).json({ status: "error", message: "Menú no encontrado" });
    }

    const actualizado = await repo.update(id, { nombre, id_restaurante });

    res.status(200).json({
      status: "success",
      message: "Menú actualizado exitosamente",
      data: actualizado
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al actualizar el menú", error: error.message });
  }
};

// DELETE /menus/:id
export const eliminarMenu = async (req, res) => {
  const { id } = req.params;

  try {
    const existente = await repo.getById(id);
    if (!existente) {
      return res.status(404).json({ status: "error", message: "Menú no encontrado" });
    }

    await repo.remove(id);

    res.status(200).json({
      status: "success",
      message: "Menú eliminado exitosamente"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al eliminar el menú", error: error.message });
  }
};

// GET /restaurants/:id/menus
export const getMenus_RestauranteId = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `menus_restaurante:${id}`;

  try {
    const cachedMenus = await redisClient.get(cacheKey);
    if (cachedMenus) {
      return res.status(200).json({
        status: "success",
        message: "Menús obtenidos desde caché",
        data: JSON.parse(cachedMenus)
      });
    }

    // Validación básica (solo si estás usando PG; en Mongo podrías omitir o verificar por lógica)
    const menus = await repo.getByRestauranteId(id);

    if (!menus || menus.length === 0) {
      return res.status(404).json({ status: "error", message: "Menús no encontrados o restaurante inexistente" });
    }

    await redisClient.setEx(cacheKey, 120, JSON.stringify(menus));

    res.status(200).json({
      status: "success",
      message: "Menús obtenidos desde base de datos",
      data: menus
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener los menús",
      error: error.message
    });
  }
};
