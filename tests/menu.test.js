import request from 'supertest';
import app from '../src/index.js';

describe('POST /menus', () => {
  test('should create a menu', async () => {
    const res = await request(app).post('/menus').send({
      nombre: 'Menú Test',
      id_restaurante: 1 // ID del restaurante existente
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

});

describe('GET /menus/:id', () => {
  test('should return menu by ID', async () => {
    const res = await request(app).get('/menus/1'); // Devuelve el menú 1
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('id', 1); // Revisar si la propiedad es correcta
  });


});

describe('PUT /menus/:id', () => {
  test('should update menu by ID', async () => {
    const res = await request(app).put('/menus/1').send({
      nombre: 'Menú Actualizado',
      id_restaurante: 1 // ID del restaurante existente
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.nombre).toBe('Menú Actualizado');
  });

});

describe('DELETE /menus/:id', () => {
  test('should delete menu by ID', async () => {
    const res = await request(app).delete('/menus/1'); // Devuelve el menú 1
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Menú eliminado exitosamente'); // Revisar si la propiedad es correcta
  });


});

describe('GET /restaurants/:id/menus', () => {
  test('should return menus by restaurant ID', async () => {
    const res = await request(app).get('/restaurants/1/menus'); // Devuelve los menús del restaurante 1
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true); // Revisar si la propiedad es correcta
  });


});