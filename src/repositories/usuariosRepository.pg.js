import pool from '../db.js';

const getAll = async () => {
  const { rows } = await pool.query('SELECT * FROM usuarios');
  return rows;
};

const getById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
  return rows[0] || null;
};

const create = async ({ nombre, correo, tipo_usuario }) => {
  const { rows } = await pool.query(
    'INSERT INTO usuarios (nombre, correo, tipo_usuario) VALUES ($1, $2, $3) RETURNING *',
    [nombre, correo, tipo_usuario]
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
    `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
};

const remove = async (id) => {
  await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
};

export default { getAll, getById, create, update, remove };
