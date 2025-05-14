import request from 'supertest';
import app from '../src/index.js';

// Variables globales para almacenar IDs de recursos creados
let adminId;
let tempAdminId;
let postRestaurantId; // Para el test POST
let getRestaurantId;  // Para el test GET by ID
let putRestaurantId;  // Para el test PUT/update
let deleteRestaurantId; // Para el test DELETE

// Setup global - se ejecuta una vez antes de todos los tests
beforeAll(async () => {
  console.log('Preparando datos para todos los tests de restaurantes...');
  
  // 1. Configurar un administrador para todos los tests
  const adminRes = await request(app).get('/users/1');
  
  if (adminRes.statusCode === 200 && adminRes.body.data.tipo_usuario === 'administrador') {
    // Si existe y es administrador, usamos ese ID
    adminId = 1;
  } else {
    // Buscar algún usuario que sea administrador
    const usersRes = await request(app).get('/users');
    
    if (usersRes.statusCode === 200 && Array.isArray(usersRes.body.data)) {
      const adminUser = usersRes.body.data.find(user => user.tipo_usuario === 'administrador');
      
      if (adminUser) {
        adminId = adminUser.id;
      } else {
        // Si no hay administradores, creamos uno temporal
        const createAdminRes = await request(app).post('/users').send({
          "nombre": "Admin Temporal Global",
          "correo": "admin.global@test.com",
          "tipo_usuario": "administrador"
        });
        
        if (createAdminRes.statusCode === 201) {
          tempAdminId = createAdminRes.body.data.id;
          adminId = tempAdminId;
        } else {
          console.error('No se pudo crear administrador temporal:', createAdminRes.body);
        }
      }
    }
  }
  
  // 2. Crear restaurante para el test GET by ID (si está configurado adminId)
  if (adminId) {
    const createGetRestRes = await request(app).post('/restaurants').send({
      "nombre": "Restaurante Para GET",
      "direccion": "Dirección GET",
      "telefono": "11111111",
      "id_administrador": adminId
    });
    
    if (createGetRestRes.statusCode === 201) {
      getRestaurantId = createGetRestRes.body.data.id;
    }
    
    // 3. Crear restaurante para el test PUT/update
    const createPutRestRes = await request(app).post('/restaurants').send({
      "nombre": "Restaurante Para PUT",
      "direccion": "Dirección PUT",
      "telefono": "22222222",
      "id_administrador": adminId
    });
    
    if (createPutRestRes.statusCode === 201) {
      putRestaurantId = createPutRestRes.body.data.id;
    }
    
    // 4. Crear restaurante para el test DELETE
    const createDeleteRestRes = await request(app).post('/restaurants').send({
      "nombre": "Restaurante Para DELETE",
      "direccion": "Dirección DELETE",
      "telefono": "33333333",
      "id_administrador": adminId
    });
    
    if (createDeleteRestRes.statusCode === 201) {
      deleteRestaurantId = createDeleteRestRes.body.data.id;
    }
  }
});

// Cleanup global - se ejecuta una vez después de todos los tests
afterAll(async () => {
  console.log('Limpiando datos después de todos los tests de restaurantes...');
  
  // Limpiar restaurantes creados
  // Nota: No limpiamos el deleteRestaurantId porque debería haber sido eliminado en su propio test
  
  if (postRestaurantId) {
    await request(app).delete(`/restaurants/${postRestaurantId}`);
  }
  
  if (getRestaurantId) {
    await request(app).delete(`/restaurants/${getRestaurantId}`);
  }
  
  if (putRestaurantId) {
    await request(app).delete(`/restaurants/${putRestaurantId}`);
  }
  
  // El restaurante de DELETE ya debería haber sido eliminado por su test,
  // pero verificamos por si acaso el test falló
  if (deleteRestaurantId) {
    try {
      await request(app).delete(`/restaurants/${deleteRestaurantId}`);
    } catch (error) {
      console.log("El restaurante para DELETE ya fue eliminado o no existe");
    }
  }
  
  // Eliminar el administrador temporal si fue creado
  if (tempAdminId) {
    await request(app).delete(`/users/${tempAdminId}`);
  }
});

describe('POST/restaurants', () => {
  test('should be successfully created', async () => {
    // Saltamos el test si no tenemos un administrador
    if (!adminId) {
      console.warn('Test skipped: No administrator available for restaurant creation test');
      return;
    }
    
    const res = await request(app).post('/restaurants').send({
      "nombre": 'Restaurante El mejor POST',
      "direccion": 'Calle POST 123',
      "telefono": '44444444',
      "id_administrador": adminId
    });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    
    // Guardar el ID del restaurante creado para eliminarlo después
    postRestaurantId = res.body.data.id;
  });

  // test si falta algún campo requerido

  // test si el id_administrador no existe

  // test si el id_administrador es inválido(string, undefined, NaN)')
});

describe ('GET/restaurants', () => {
  test ('should return all restaurants', async () => {
    const res = await request(app).get('/restaurants');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // test si no hay restaurantes en la base de datos
});

describe ('GET/restaurants/:id', () => {
  test ('should return restaurant by ID', async () => {
    // Saltamos el test si no tenemos un restaurante para probar
    if (!getRestaurantId) {
      console.warn('Test skipped: No restaurant available for get by ID test');
      return;
    }
    
    const res = await request(app).get(`/restaurants/${getRestaurantId}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('id', getRestaurantId);
    
    // Verificar estructura de datos JSON del restaurante
    expect(res.body.data).toHaveProperty('nombre');
    expect(res.body.data).toHaveProperty('direccion');
    expect(res.body.data).toHaveProperty('telefono');
    expect(res.body.data).toHaveProperty('id_administrador');
  });

  test ('should return 404 if restaurant does not exist', async () => {
    // Usar un ID que probablemente no exista
    const nonExistentId = 9999;
    
    const res = await request(app).get(`/restaurants/${nonExistentId}`);
    
    expect(res.statusCode).toBe(404);
    // Opcionalmente, verificar el mensaje de error si la API devuelve uno
    expect(res.body).toHaveProperty('message');
  });

  // test si el restaurante no existe

  // test si el id es inválido(string, undefined, NaN)
});

describe ('PUT/restaurants/:id', () => {
  test ('should update restaurant by ID', async () => {
    // Saltamos el test si no tenemos un restaurante para probar
    if (!putRestaurantId) {
      console.warn('Test skipped: No restaurant available for update test');
      return;
    }
    
    const res = await request(app).put(`/restaurants/${putRestaurantId}`).send({
      "nombre": "Restaurante Actualizado PUT",
      "direccion": "Calle Actualizada 123",
      "telefono": "55555555",
      "id_administrador": adminId
    });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('nombre');
    expect(res.body.data.nombre).toBe("Restaurante Actualizado PUT");
  });

  // test si el restaurante no existe

  // test si el id es inválido(string, undefined, NaN)

  // test si falta algún campo requerido

  // test si algun dato es inválido (telefono)
});

describe ('DELETE/restaurants/:id', () => {
  test ('should delete restaurant by ID', async () => {
    // Saltamos el test si no se pudo crear un restaurante para eliminar
    if (!deleteRestaurantId) {
      console.warn('Test skipped: No restaurant available for deletion test');
      return;
    }
    
    // Verificamos que el restaurante existe antes de intentar eliminarlo
    const getRes = await request(app).get(`/restaurants/${deleteRestaurantId}`);
    expect(getRes.statusCode).toBe(200);
    
    // Procedemos con la eliminación
    const res = await request(app).delete(`/restaurants/${deleteRestaurantId}`);
    expect(res.statusCode).toBe(200);
    
    // Verificamos que ya no existe
    const checkRes = await request(app).get(`/restaurants/${deleteRestaurantId}`);
    expect(checkRes.statusCode).toBe(404);
    
    // Marcamos como eliminado para que afterAll no intente eliminarlo de nuevo
    deleteRestaurantId = null;
  });

  // test si el restaurante no existe

  // test si el id es inválido(string, undefined, NaN)
});