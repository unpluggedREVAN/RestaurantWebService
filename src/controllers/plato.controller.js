import repo from '../repositories/platosRepository.js';
import redisClient from '../config/redis.js';

// POST /menus/:id/platos
export const crearPlato = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, descripcion, categoria, disponible } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ status: "error", message: "Faltan datos del plato." });
  }

  try {
    const nuevo = await repo.create({
      nombre,
      precio,
      descripcion,
      categoria,
      disponible,
      id_menu: id
    });

    res.status(201).json({
      status: "success",
      message: "Plato creado exitosamente",
      data: nuevo
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al crear el plato",
      error: error.message
    });
  }
};

// GET /platos/:id
export const getPlatoId = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `plato:${id}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: "success",
        message: "Plato obtenido desde caché",
        data: JSON.parse(cached)
      });
    }

    const plato = await repo.getById(id);
    if (!plato) {
      return res.status(404).json({
        status: "error",
        message: "Plato no encontrado"
      });
    }

    await redisClient.setEx(cacheKey, 300, JSON.stringify(plato));

    res.status(200).json({
      status: "success",
      message: "Plato obtenido desde base de datos",
      data: plato
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener el plato",
      error: error.message
    });
  }
};

// PUT /platos/:id
export const actualizarPlato = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, descripcion, categoria, disponible } = req.body;

  try {
    const existente = await repo.getById(id);
    if (!existente) {
      return res.status(404).json({
        status: "error",
        message: "Plato no encontrado"
      });
    }

    const actualizado = await repo.update(id, {
      nombre,
      precio,
      descripcion,
      categoria,
      disponible
    });

    res.status(200).json({
      status: "success",
      message: "Plato actualizado exitosamente",
      data: actualizado
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al actualizar el plato",
      error: error.message
    });
  }
};

// DELETE /platos/:id
export const eliminarPlato = async (req, res) => {
  const { id } = req.params;

  try {
    const existente = await repo.getById(id);
    if (!existente) {
      return res.status(404).json({
        status: "error",
        message: "Plato no encontrado"
      });
    }

    await repo.remove(id);

    res.status(200).json({
      status: "success",
      message: "Plato eliminado exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al eliminar el plato",
      error: error.message
    });
  }
};

// GET /menus/:id/platos
export const getPlatosByMenu = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `platos_menu:${id}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: "success",
        message: "Platos obtenidos desde caché",
        data: JSON.parse(cached)
      });
    }

    const platos = await repo.getByMenuId(id);

    if (!platos || platos.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No se encontraron platos para este menú"
      });
    }

    await redisClient.setEx(cacheKey, 120, JSON.stringify(platos));

    res.status(200).json({
      status: "success",
      message: "Platos obtenidos desde base de datos",
      data: platos
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener los platos del menú",
      error: error.message
    });
  }
};

// GET /platos
export const getAllPlatos = async (req, res) => {
  try {
    const platos = await repo.getAll();

    res.status(200).json({
      status: "success",
      message: "Lista de todos los platos",
      data: platos
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener todos los platos",
      error: error.message
    });
  }
};
