import pool from '../db.js';

// POST /reservations
export const createReservation = async (req, res) => {
  const { id_cliente, id_restaurante, fecha, numero_personas } = req.body;

  if (!id_cliente || !id_restaurante || !fecha || !numero_personas) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservas (id_cliente, id_restaurante, fecha, numero_personas, estado)
       VALUES ($1, $2, $3, $4, 'pendiente')
       RETURNING *`,
      [id_cliente, id_restaurante, fecha, numero_personas]
    );

    res.status(201).json({ message: "Reserva creada con éxito.", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la reserva.", error: error.message });
  }
};

// GET /reservations/:id
export const getReservationById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Reserva no encontrada." });
    }

    res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la reserva.", error: error.message });
  }
};

// DELETE /reservations/:id (cancelar reserva)
export const cancelReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Reserva no encontrada." });
    }

    const result = await pool.query(
      'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
      ['cancelada', id]
    );

    res.status(200).json({ message: "Reserva cancelada con éxito.", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar la reserva.", error: error.message });
  }
};

// GET /users/:id/reservations
export const getReservationsByUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM reservas WHERE id_cliente = $1',
      [id]
    );

    res.status(200).json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas del usuario.", error: error.message });
  }
};

// GET /restaurants/:id/reservations
export const getReservationsByRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM reservas WHERE id_restaurante = $1',
      [id]
    );

    res.status(200).json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas del restaurante.", error: error.message });
  }
};
