import request from 'supertest';
import app from '../src/index.js';

describe('POST /menus/:id/platos', () => {

  test('should be succesfully created', async () => {
    const res = await request(app).post(`/menus/${menuId}/platos`).send({
      nombre: 'Hamburguesa',
      precio: 10.99
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data');
  });

});

describe ('GET /platos/:id', () => {
  test ('should return plato by ID', async () => {
    const res = await request(app).get('/platos/1'); // Devuelve el plato 1
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('id', 1);
  });

});

describe('PUT /platos/:id', () => {
  test ('should update plato by ID', async () => {
    const res = await request(app).put('/platos/1').send({
      nombre: 'Hamburguesa Especial',
      precio: 15.99
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.nombre).toBe('Hamburguesa Especial');
  });

});

describe ('DELETE /platos/:id', () => {
  test ('should delete plato by ID', async () => {
    const res = await request(app).delete('/platos/1'); // Devuelve el plato 1
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Plato eliminado exitosamente'); // Revisar si la propiedad es correcta
  });

});

describe ('GET /menus/:id/platos', () => {
  test ('should return platos by menu ID', async () => {
    const res = await request(app).get('/menus/1/platos'); // Devuelve los platos del menú 1
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true); // Revisar si la propiedad es correcta
  });

});