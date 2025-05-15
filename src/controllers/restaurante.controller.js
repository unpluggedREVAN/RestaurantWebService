import repo from '../repositories/restaurantesRepository.js';
import redisClient from '../config/redis.js';

// GET /restaurants
export const getRestaurants = async (req, res) => {
  const cacheKey = 'restaurants:all';

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        message: 'Restaurantes obtenidos desde caché',
        data: JSON.parse(cached)
      });
    }

    const restaurantes = await repo.getAll();
    await redisClient.setEx(cacheKey, 300, JSON.stringify(restaurantes));

    res.status(200).json({
      status: 'success',
      message: 'Restaurantes obtenidos desde base de datos',
      data: restaurantes
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener los restaurantes',
      error: error.message
    });
  }
};

// GET /restaurants/:id
export const getRestaurantById = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `restaurant:${id}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        message: 'Restaurante obtenido desde caché',
        data: JSON.parse(cached)
      });
    }

    const restaurante = await repo.getById(id);
    if (!restaurante) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurante no encontrado'
      });
    }

    await redisClient.setEx(cacheKey, 300, JSON.stringify(restaurante));
    res.status(200).json({
      status: 'success',
      message: 'Restaurante obtenido desde base de datos',
      data: restaurante
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el restaurante',
      error: error.message
    });
  }
};

// POST /restaurants
export const crearRestaurante = async (req, res) => {
  const { nombre, direccion, telefono, id_administrador } = req.body;
  if (!nombre || !direccion || !telefono || !id_administrador) {
    return res.status(400).json({
      status: 'error',
      message: 'Faltan datos requeridos.'
    });
  }
  try {
    const nuevo = await repo.create({ nombre, direccion, telefono, id_administrador });
    // invalidar lista en caché
    await redisClient.del('restaurants:all');

    res.status(201).json({
      status: 'success',
      message: 'Restaurante creado exitosamente',
      data: nuevo
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al crear el restaurante',
      error: error.message
    });
  }
};

// PUT /restaurants/:id
export const actualizarRestaurante = async (req, res) => {
  const { id } = req.params;
  const cambios = req.body;

  try {
    const existente = await repo.getById(id);
    if (!existente) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurante no encontrado'
      });
    }

    const actualizado = await repo.update(id, cambios);
    // invalidar caché
    await Promise.all([
      redisClient.del('restaurants:all'),
      redisClient.del(`restaurant:${id}`)
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Restaurante actualizado exitosamente',
      data: actualizado
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el restaurante',
      error: error.message
    });
  }
};

// DELETE /restaurants/:id
export const eliminarRestaurante = async (req, res) => {
  const { id } = req.params;

  try {
    const existente = await repo.getById(id);
    if (!existente) {
      return res.status(404).json({
        status: 'error',
        message: 'Restaurante no encontrado'
      });
    }

    await repo.remove(id);
    // invalidar caché
    await Promise.all([
      redisClient.del('restaurants:all'),
      redisClient.del(`restaurant:${id}`)
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Restaurante eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar el restaurante',
      error: error.message
    });
  }
};

// GET /restaurants/:id/reservations
export const getReservationsByRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const reservas = await repo.getReservationsByRestaurant(id);
    res.status(200).json({
      status: 'success',
      message: 'Reservas del restaurante obtenidas exitosamente',
      data: reservas
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener reservas del restaurante',
      error: error.message
    });
  }
};
