import pool from '../db.js';

const getById = async (id) => {
  const result = await pool.query('SELECT * FROM menus WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const getByRestauranteId = async (id_restaurante) => {
  const result = await pool.query(
    'SELECT * FROM menus WHERE id_restaurante = $1',
    [id_restaurante]
  );
  return result.rows;
};

const create = async ({ nombre, id_restaurante }) => {
  const result = await pool.query(
    'INSERT INTO menus (nombre, id_restaurante) VALUES ($1, $2) RETURNING *',
    [nombre, id_restaurante]
  );
  return result.rows[0];
};

const update = async (id, { nombre, id_restaurante }) => {
  const result = await pool.query(
    'UPDATE menus SET nombre = $1, id_restaurante = $2 WHERE id = $3 RETURNING *',
    [nombre, id_restaurante, id]
  );
  return result.rows[0] || null;
};

const remove = async (id) => {
  await pool.query('DELETE FROM menus WHERE id = $1', [id]);
};

export default {
  getById,
  getByRestauranteId,
  create,
  update,
  remove
};
