import pool from '../db.js';

const create = async ({ id_cliente, id_restaurante, id_reserva = null }) => {
  const result = await pool.query(
    `INSERT INTO pedidos (id_cliente, id_restaurante, id_reserva, fecha, estado)
     VALUES ($1, $2, $3, NOW(), 'pendiente') RETURNING *`,
    [id_cliente, id_restaurante, id_reserva]
  );
  return result.rows[0];
};

const getById = async (id) => {
  const result = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const getByClienteId = async (id_cliente) => {
  const result = await pool.query('SELECT * FROM pedidos WHERE id_cliente = $1', [id_cliente]);
  return result.rows;
};

const getByRestauranteId = async (id_restaurante) => {
  const result = await pool.query('SELECT * FROM pedidos WHERE id_restaurante = $1', [id_restaurante]);
  return result.rows;
};

const updateEstado = async (id, estado) => {
  const result = await pool.query(
    'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
    [estado, id]
  );
  return result.rows[0] || null;
};

const remove = async (id) => {
  await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
};

export default {
  create,
  getById,
  getByClienteId,
  getByRestauranteId,
  updateEstado,
  remove
};
