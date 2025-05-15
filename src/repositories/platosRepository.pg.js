import pool from '../db.js';

const create = async ({ nombre, precio, descripcion, categoria, disponible, id_menu }) => {
  const result = await pool.query(
    `INSERT INTO platos (nombre, precio, id_menu)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [nombre, precio, id_menu]
  );
  return result.rows[0];
};

const getById = async (id) => {
  const result = await pool.query('SELECT * FROM platos WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const getByMenuId = async (id_menu) => {
  const result = await pool.query('SELECT * FROM platos WHERE id_menu = $1', [id_menu]);
  return result.rows;
};

const update = async (id, { nombre, precio, descripcion, categoria, disponible }) => {
  const result = await pool.query(
    'UPDATE platos SET nombre = $1, precio = $2 WHERE id = $3 RETURNING *',
    [nombre, precio, id]
  );
  return result.rows[0] || null;
};

const remove = async (id) => {
  await pool.query('DELETE FROM platos WHERE id = $1', [id]);
};

export default {
  create,
  getById,
  getByMenuId,
  update,
  remove
};
