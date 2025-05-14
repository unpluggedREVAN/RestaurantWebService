import pool from '../db.js';

// GET /users
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.status(200).json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

// GET /users/:id
export const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
};

// POST /users (opcional si no usás auth.register)
export const createUser = async (req, res) => {
  const { nombre, correo, tipo_usuario } = req.body;

  if (!nombre || !correo || !tipo_usuario) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, tipo_usuario) VALUES ($1, $2, $3) RETURNING *',
      [nombre, correo, tipo_usuario]
    );

    res.status(201).json({ message: 'Usuario creado', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

// PUT /users/:id
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, tipo_usuario } = req.body;

  try {
    const check = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const result = await pool.query(
      'UPDATE usuarios SET nombre = $1, correo = $2, tipo_usuario = $3 WHERE id = $4 RETURNING *',
      [nombre, correo, tipo_usuario, id]
    );

    res.status(200).json({ message: 'Usuario actualizado', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

// DELETE /users/:id
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.status(200).json({ message: 'Usuario eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

export const getReservationsByUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM reservas WHERE id_cliente = $1',
      [id]
    );

    res.status(200).json({
      message: 'Reservas obtenidas exitosamente',
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener reservas del usuario',
      error: error.message
    });
  }
};