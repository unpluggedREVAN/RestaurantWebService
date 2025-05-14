import request from 'supertest';
import app from '../src/index.js';

describe ('POST /users', () => {
  
  let createdUserId;
  
  test ('should be succesfully created', async () => {
    const res = await request(app).post('/users').send({
      "nombre": "Daniel Corrales Mora",
      "correo": "corralitos@gmail.com",
      "tipo_usuario": "cliente"
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data');
    
    createdUserId = res.body.data.id;
  });

  afterAll(async () => {
    if (createdUserId) {
      await request(app).delete(`/users/${createdUserId}`);
    }
  });

  test('should return 500 if email already exists', async () => {
    const res = await request(app).post('/users').send({
      "nombre": "Usuario Existente",
      "correo": "dani@gmail.com",
      "tipo_usuario": "cliente"
    });
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch("duplicate key value violates unique constraint \"usuarios_correo_key\"");
  });
});

describe ('GET /users', () => {
  test ('should return all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  
  test ('should return empty array if no users exist', async () => {
    const originalResponse = await request(app).get('/users');
    const originalUsers = originalResponse.body.data;
    
    for (const user of originalUsers) {
      await request(app).delete(`/users/${user.id}`);
    }
    
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
    
    for (const user of originalUsers) {
      const { id, ...userData } = user;
      await request(app).post('/users').send(userData);
    }
  });
});

describe ('GET /users/:id', () => {
  let testUserId;
  
  beforeAll(async () => {
    const existingRes = await request(app).get('/users/45');
    
    if (existingRes.statusCode === 200) {
      testUserId = 45;
    } else {
      const createRes = await request(app).post('/users').send({
        "nombre": "Usuario Prueba",
        "correo": "usuario.prueba@test.com",
        "tipo_usuario": "cliente"
      });
      
      expect(createRes.statusCode).toBe(201);
      testUserId = createRes.body.data.id;
    }
  });
  
  afterAll(async () => {
    if (testUserId !== 45) {
      await request(app).delete(`/users/${testUserId}`);
    }
  });
  
  test ('should return user by ID', async () => {
    const res = await request(app).get(`/users/${testUserId}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('id', testUserId);
    
    expect(res.body.data).toHaveProperty('nombre');
    expect(res.body.data).toHaveProperty('correo');
    expect(res.body.data).toHaveProperty('tipo_usuario');
    
    expect(typeof res.body.data.nombre).toBe('string');
    expect(typeof res.body.data.correo).toBe('string');
    expect(typeof res.body.data.tipo_usuario).toBe('string');
  });

  test ('should return 404 if user does not exist', async () => {
    const res = await request(app).get('/users/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/usuario.*no encontrado|user.*not found/i);
  });
});

describe ('PUT /users/:id', () => {
  let testUserId;
  let originalUserData;
  
  beforeAll(async () => {
    const existingRes = await request(app).get('/users/1');
    
    if (existingRes.statusCode === 200) {
      testUserId = 1;
      originalUserData = existingRes.body.data;
    } else {
      const createRes = await request(app).post('/users').send({
        "nombre": "Usuario Temporal",
        "correo": "temporal@test.com",
        "tipo_usuario": "cliente"
      });
      
      expect(createRes.statusCode).toBe(201);
      testUserId = createRes.body.data.id;
      originalUserData = null;
    }
  });
  
  afterAll(async () => {
    if (originalUserData) {
      await request(app).put(`/users/${testUserId}`).send({
        "nombre": originalUserData.nombre,
        "correo": originalUserData.correo,
        "tipo_usuario": originalUserData.tipo_usuario
      });
    } else if (testUserId) {
      await request(app).delete(`/users/${testUserId}`);
    }
  });
  
  test ('should update user by ID', async () => {
    const res = await request(app).put(`/users/${testUserId}`).send({
      "nombre": "Andrea Rodriguez",
      "correo": "andreanuevo@gmail.com",
      "tipo_usuario": "cliente"
    });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.nombre).toBe("Andrea Rodriguez");
    expect(res.body.data.correo).toBe("andreanuevo@gmail.com");
    expect(res.body.data.tipo_usuario).toBe("cliente");
  });

  test('should return 404 if user does not exist', async () => {
    const nonExistentId = 99999;
    
    const res = await request(app).put(`/users/${nonExistentId}`).send({
      "nombre": "Usuario Inexistente",
      "correo": "noexiste@test.com",
      "tipo_usuario": "cliente"
    });
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/usuario.*no encontrado|user.*not found/i);
  });

  test('should return 500 if ID is invalid', async () => {
    const invalidIds = ['abc', 'undefined', 'NaN'];
    
    for (const invalidId of invalidIds) {
      const res = await request(app).put(`/users/${invalidId}`).send({
        "nombre": "Usuario Test",
        "correo": "test@test.com",
        "tipo_usuario": "cliente"
      });
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
    }
  });

  test('should give error if required field is missing', async () => {
    let tempUserId;
    let needsCleanup = false;
    
    if (!testUserId) {
      const createRes = await request(app).post('/users').send({
        "nombre": "Usuario Temporal Campos",
        "correo": "temporal.campos@test.com",
        "tipo_usuario": "cliente"
      });
      
      expect(createRes.statusCode).toBe(201);
      tempUserId = createRes.body.data.id;
      needsCleanup = true;
    } else {
      tempUserId = testUserId;
    }
    
    const testCases = [
      { data: { "correo": "test@test.com", "tipo_usuario": "cliente" }, missing: "nombre" },
      { data: { "nombre": "Usuario Test", "tipo_usuario": "cliente" }, missing: "correo" },
      { data: { "nombre": "Usuario Test", "correo": "test@test.com" }, missing: "tipo_usuario" }
    ];
    
    for (const testCase of testCases) {
      const res = await request(app).put(`/users/${tempUserId}`).send(testCase.data);
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe("Error al actualizar usuario");
    }
    
    if (needsCleanup) {
      await request(app).delete(`/users/${tempUserId}`);
    }
  });
});

describe ('DELETE /users/:id', () => {
  let testUserId;
  
  beforeAll(async () => {
    const createRes = await request(app).post('/users').send({
      "nombre": "Usuario Para Eliminar",
      "correo": "usuario.eliminar@test.com",
      "tipo_usuario": "cliente"
    });
    
    if (createRes.statusCode === 201) {
      testUserId = createRes.body.data.id;
    } else {
      const usersRes = await request(app).get('/users');
      
      if (usersRes.statusCode === 200 && Array.isArray(usersRes.body.data) && usersRes.body.data.length > 1) {
        testUserId = usersRes.body.data[usersRes.body.data.length - 1].id;
      } else {
        testUserId = null;
      }
    }
  });
  
  test ('should delete user by ID', async () => {
    if (!testUserId) {
      console.warn('Test skipped: No suitable user found for deletion test');
      return;
    }
    
    const res = await request(app).delete(`/users/${testUserId}`);
    expect(res.statusCode).toBe(200);
    
    const checkRes = await request(app).get(`/users/${testUserId}`);
    expect(checkRes.statusCode).toBe(404);
  });
});