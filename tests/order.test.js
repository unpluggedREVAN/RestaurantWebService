import request from 'supertest';
import app from '../src/index.js';

describe('POST /orders', () => {
  test('should create an order', async () => {
    const res = await request(app).post('/orders').send({
      id_cliente: USER_ID,
      id_restaurante: RESTAURANT_ID
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

});

describe('GET /orders/:id', () => {
  test('should return order by ID', async () => {
    const res = await request(app).get('/orders/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('id', 1);
  });


});

describe('GET /users/:id/orders', () => {
  test('should return orders by user ID', async () => {
    const res = await request(app).get('/users/1/orders'); // Devuelve los pedidos del usuario 1
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true); // Revisar si la propiedad es correcta
  });


});


describe('GET /restaurants/:id/orders', () => {
  test('should return orders by restaurant ID', async () => {
    const res = await request(app).get('/restaurants/1/orders'); // Devuelve los pedidos del restaurante 1
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true); // Revisar si la propiedad es correcta
  });


});
describe('PUT /orders/:id', () => {
  test('should update order status', async () => {
    const res = await request(app).put('/orders/1').send({
      estado: 'preparando'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('estado', 'preparando'); // Revisar si la propiedad es correcta
  });

});

describe('DELETE /orders/:id', () => {
  test('should delete order by ID', async () => {
    const res = await request(app).delete('/orders/1'); // Devuelve el pedido 1
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Pedido eliminado exitosamente'); // Revisar si la propiedad es correcta
  });

});