import request from 'supertest';
import app from '../src/index.js';

describe('POST /reservations', () => {
  test('should be successfully created', async () => {
    const res = await request(app).post('/reservations').send({
      "id_cliente": 2,
      "id_restaurante": 1,
      "fecha": "2025-03-30",
      "numero_personas": 4
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

});

describe ('GET /reservations', () => {
  test ('should return all reservations', async () => {
    const res = await request(app).get('/reservations');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

});

describe ('GET /reservations/:id', () => {
  test ('should return reservation by ID', async () => {
    const res = await request(app).get('/reservations/1'); // Devuelve la reserva 1
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('id', 1);
  });

});

describe ('DELETE /reservations/:id', () => {
  test ('should cancel reservation by ID', async () => {
    const res = await request(app).delete('/reservations/1');
    expect(res.statusCode).toBe(200);
  });

});

desribe ('GET /reservations/user/:id', () => {
  test ('should return reservations by user ID', async () => {
    const res = await request(app).get('/reservations/user/1'); // Devuelve las reservas del usuario 1
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

});