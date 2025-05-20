import pool from '../db.js';

const create = async ({ id_cliente, id_restaurante, fecha, numero_personas }) => {
  const result = await pool.query(
    `INSERT INTO reservas (id_cliente, id_restaurante, fecha, numero_personas, estado)
     VALUES ($1, $2, $3, $4, 'pendiente')
     RETURNING *`,
    [id_cliente, id_restaurante, fecha, numero_personas]
  );
  return result.rows[0];
};

const getById = async (id) => {
  const result = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const cancel = async (id) => {
  const result = await pool.query(
    'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
    ['cancelada', id]
  );
  return result.rows[0] || null;
};

const getByClienteId = async (id_cliente) => {
  const result = await pool.query(
    'SELECT * FROM reservas WHERE id_cliente = $1',
    [id_cliente]
  );
  return result.rows;
};

const getByRestauranteId = async (id_restaurante) => {
  const result = await pool.query(
    'SELECT * FROM reservas WHERE id_restaurante = $1',
    [id_restaurante]
  );
  return result.rows;
};

export default {
  create,
  getById,
  cancel,
  getByClienteId,
  getByRestauranteId
};
