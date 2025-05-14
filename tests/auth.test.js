import request from 'supertest';
import app from '../src/index.js';

describe('Auth routes', () => {

  // ========== POST /auth/register ==========

  it('should return 501 for register', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'testuser',
      password: 'testpassword'
    });

    expect(res.statusCode).toBe(501);
    expect(res.body.message).toMatch(/registro/i);
  });

  // ========== POST /auth/login ==========

  it('should return 501 for login', async () => {
    const res = await request(app).post('/auth/login').send({
      username: 'testuser',
      password: 'testpassword'
    });

    expect(res.statusCode).toBe(501);
    expect(res.body.message).toMatch(/login/i);
  });

  // ========== GET /auth/me ==========

  it('should return 401 if not authenticated (no token)', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/no autenticado/i);
  });

  it('should return user info if authenticated (mocked)', async () => {
    const mockGrant = {
      access_token: {
        content: {
          sub: '123',
          preferred_username: 'tester',
          email: 'tester@example.com',
          realm_access: { roles: ['cliente'] }
        }
      }
    };

    const appWithMiddleware = app;
    appWithMiddleware.use((req, res, next) => {
      req.kauth = { grant: mockGrant };
      next();
    });

    const res = await request(appWithMiddleware).get('/auth/me');
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('tester');
    expect(res.body.email).toBe('tester@example.com');
    expect(res.body.roles).toContain('cliente');
  });

  // ========== PUT /auth/users/:id ==========

  it('should return 501 for update user', async () => {
    const res = await request(app).put('/auth/users/1').send({ username: 'newuser' });
    expect(res.statusCode).toBe(501);
    expect(res.body.message).toMatch(/actualizar/i);
  });

  // ========== DELETE /auth/users/:id ==========

  it('should return 501 for delete user', async () => {
    const res = await request(app).delete('/auth/users/1');
    expect(res.statusCode).toBe(501);
    expect(res.body.message).toMatch(/eliminar/i);
  });
});
