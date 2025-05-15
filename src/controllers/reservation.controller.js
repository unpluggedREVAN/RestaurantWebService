import repo from '../repositories/reservasRepository.js';

// POST /reservations
export const createReservation = async (req, res) => {
  const { id_cliente, id_restaurante, fecha, numero_personas } = req.body;

  if (!id_cliente || !id_restaurante || !fecha || !numero_personas) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    const nueva = await repo.create({
      id_cliente,
      id_restaurante,
      fecha,
      numero_personas
    });

    res.status(201).json({ message: "Reserva creada con éxito.", data: nueva });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la reserva.", error: error.message });
  }
};

// GET /reservations/:id
export const getReservationById = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await repo.getById(id);

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada." });
    }

    res.status(200).json({ data: reserva });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la reserva.", error: error.message });
  }
};

// DELETE /reservations/:id (cancelar)
export const cancelReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const actualizada = await repo.cancel(id);

    if (!actualizada) {
      return res.status(404).json({ message: "Reserva no encontrada." });
    }

    res.status(200).json({ message: "Reserva cancelada con éxito.", data: actualizada });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar la reserva.", error: error.message });
  }
};

// GET /users/:id/reservations
export const getReservationsByUser = async (req, res) => {
  const { id } = req.params;

  try {
    const reservas = await repo.getByClienteId(id);
    res.status(200).json({ data: reservas });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas del usuario.", error: error.message });
  }
};

// GET /restaurants/:id/reservations
export const getReservationsByRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const reservas = await repo.getByRestauranteId(id);
    res.status(200).json({ data: reservas });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas del restaurante.", error: error.message });
  }
};
