import pool from '../db.js';

// POST /orders
export const createOrder = async (req, res) => {
  const { id_cliente, id_restaurante, id_reserva } = req.body;

  if (!id_cliente || !id_restaurante) {
    return res.status(400).json({ message: "id_cliente e id_restaurante son obligatorios." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO pedidos (id_cliente, id_restaurante, id_reserva, fecha, estado)
       VALUES ($1, $2, $3, NOW(), 'pendiente') RETURNING *`,
      [id_cliente, id_restaurante, id_reserva || null]
    );

    res.status(201).json({ message: "Pedido creado exitosamente.", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el pedido.", error: error.message });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el pedido.", error: error.message });
  }
};

// GET /users/:id/orders
export const getOrdersByUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM pedidos WHERE id_cliente = $1', [id]);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos del usuario.", error: error.message });
  }
};

// GET /restaurants/:id/orders
export const getOrdersByRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM pedidos WHERE id_restaurante = $1', [id]);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos del restaurante.", error: error.message });
  }
};

// PUT /orders/:id
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['pendiente', 'preparando', 'completado', 'cancelado'];
  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ message: "Estado inválido." });
  }

  try {
    const check = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    const result = await pool.query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    res.status(200).json({ message: "Estado actualizado.", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el pedido.", error: error.message });
  }
};

// DELETE /orders/:id
export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
    res.status(200).json({ message: "Pedido eliminado con éxito." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el pedido.", error: error.message });
  }
};
