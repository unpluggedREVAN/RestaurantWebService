import pool from '../db.js';

const getAll = async () => {
  const { rows } = await pool.query('SELECT * FROM restaurantes');
  return rows;
};

const getById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM restaurantes WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

const create = async ({ nombre, direccion, telefono, id_administrador }) => {
  const { rows } = await pool.query(
    `INSERT INTO restaurantes (nombre, direccion, telefono, id_administrador)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [nombre, direccion, telefono, id_administrador]
  );
  return rows[0];
};

const update = async (id, data) => {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const key in data) {
    fields.push(`${key} = $${idx}`);
    values.push(data[key]);
    idx++;
  }
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE restaurantes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
};

const remove = async (id) => {
  await pool.query('DELETE FROM restaurantes WHERE id = $1', [id]);
};

const getReservationsByRestaurant = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM reservas WHERE id_restaurante = $1',
    [id]
  );
  return rows;
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getReservationsByRestaurant
};
