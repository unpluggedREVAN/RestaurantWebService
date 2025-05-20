import request from 'supertest';
import app from '../../src/index.js';

describe('Integración de rutas - /users', () => {
  let userId;

  const mockUser = {
    nombre: 'Ruta Test User',
    correo: 'rutauser@example.com',
    tipo_usuario: 'cliente'
  };

  it('POST /users - debería crear un usuario', async () => {
    const res = await request(app).post('/users').send(mockUser);
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    userId = res.body.data.id;
  });

  it('GET /users - debería obtener lista de usuarios', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /users/:id - debería devolver el usuario creado', async () => {
    const res = await request(app).get(`/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', userId);
    expect(res.body.data).toHaveProperty('correo', mockUser.correo);
  });

  it('PUT /users/:id - debería actualizar el usuario', async () => {
    const update = { nombre: 'Nombre Actualizado' };
    const res = await request(app).put(`/users/${userId}`).send(update);
    expect(res.status).toBe(200);
    expect(res.body.data.nombre).toBe(update.nombre);
  });

  it('DELETE /users/:id - debería eliminar el usuario', async () => {
    const res = await request(app).delete(`/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });

  it('GET /users/:id - debería devolver 404 si no existe', async () => {
    const res = await request(app).get(`/users/${userId}`);
    expect(res.status).toBe(404);
  });
});
