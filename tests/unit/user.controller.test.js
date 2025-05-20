import { jest } from '@jest/globals';

let repo;
let redisClient;
let crearUsuario;
let getUsuarios;
let getUsuarioById;
let actualizarUsuario;
let eliminarUsuario;

beforeAll(async () => {
  // Mock global de Redis
  await jest.unstable_mockModule(
    'redis',
    () => ({
      __esModule: true,
      createClient: jest.fn(() => ({
        on:      jest.fn(),
        connect: jest.fn(() => Promise.resolve()),
        get:     jest.fn(),
        setEx:   jest.fn(),
        del:     jest.fn()
      }))
    })
  );

  // Mock del repositorio de usuarios
  await jest.unstable_mockModule(
    '../../src/repositories/usuariosRepository.js',
    () => ({
      __esModule: true,
      default: {
        create:  jest.fn(),
        getAll:  jest.fn(),
        getById: jest.fn(),
        update:  jest.fn(),
        remove:  jest.fn()
      }
    })
  );

  // Importar mocks y controladores
  const redisMod    = await import('../../src/config/redis.js');
  const repoMod     = await import('../../src/repositories/usuariosRepository.js');
  const ctrlMod     = await import('../../src/controllers/user.controller.js');

  redisClient       = redisMod.default;
  repo              = repoMod.default;
  crearUsuario      = ctrlMod.crearUsuario;
  getUsuarios       = ctrlMod.getUsuarios;
  getUsuarioById    = ctrlMod.getUsuarioById;
  actualizarUsuario = ctrlMod.actualizarUsuario;
  eliminarUsuario   = ctrlMod.eliminarUsuario;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /users — crearUsuario', () => {
  it('happy path: devuelve 201 y datos del usuario', async () => {
    // 1) Definimos el input (sin id) y el mockUser (con id)
    const input = {
      nombre:       'A',
      correo:       'a@a.com',
      tipo_usuario: 'user'
    };
    const mockUser = { id: 1, ...input };

    // 2) Stub del repo devuelve mockUser
    repo.create.mockResolvedValue(mockUser);

    // 3) Simulamos req/res
    const req = { body: input };
    const res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // 4) Ejecutamos
    await crearUsuario(req, res);

    // 5) Verificamos:
    //    a) que repo.create se llamó **sólo** con el input:
    expect(repo.create).toHaveBeenCalledWith(input);

    //    b) que devolvimos 201 y el mockUser en el JSON:
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Usuario creado exitosamente',
      data:    mockUser
    });
  });

  it('validation error: falta campo correo → 400', async () => {
    const req = { body: { nombre:'A', tipo_usuario:'user' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Faltan datos requeridos.'
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('internal error: repo.create lanza excepción → 500', async () => {
    repo.create.mockRejectedValue(new Error('DB fail'));

    const req = { body: { nombre:'A', correo:'a@a.com', tipo_usuario:'user' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Error al crear el usuario',
      error: 'DB fail'
    });
  });
});

describe('GET /users — getUsuarios', () => {
  it('happy path: datos desde caché → 200', async () => {
    const cached = [{ id:1 }];
    redisClient.get.mockResolvedValue(JSON.stringify(cached));

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUsuarios(req, res);

    expect(redisClient.get).toHaveBeenCalledWith('usuarios:all');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:'success',
      message:'Usuarios obtenidos desde caché',
      data: cached
    });
    expect(repo.getAll).not.toHaveBeenCalled();
  });

  it('repo path: no caché, datos desde BD → 200', async () => {
    const list = [{ id:2 }];
    redisClient.get.mockResolvedValue(null);
    repo.getAll.mockResolvedValue(list);

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUsuarios(req, res);

    expect(repo.getAll).toHaveBeenCalled();
    expect(redisClient.setEx).toHaveBeenCalledWith('usuarios:all', 300, JSON.stringify(list));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:'success',
      message:'Usuarios obtenidos desde la base de datos',
      data: list
    });
  });

  it('internal error: redis.get lanza excepción → 500', async () => {
    redisClient.get.mockRejectedValue(new Error('fail'));

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUsuarios(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:'error',
      message:'Error al obtener usuarios',
      error:'fail'
    });
  });
});

describe('GET /users/:id — getUsuarioById', () => {
  it('happy path caché → 200', async () => {
    const u = { id:3 };
    redisClient.get.mockResolvedValue(JSON.stringify(u));

    const req = { params:{ id:'3' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUsuarioById(req, res);

    expect(redisClient.get).toHaveBeenCalledWith('usuario:3');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:'success',
      message:'Usuario obtenido desde caché',
      data: u
    });
    expect(repo.getById).not.toHaveBeenCalled();
  });

  it('not found: repo.getById devuelve null → 404', async () => {
    redisClient.get.mockResolvedValue(null);
    repo.getById.mockResolvedValue(null);

    const req = { params:{ id:'4' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUsuarioById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:'error',
      message:'Usuario no encontrado'
    });
  });

  it('internal error: repo.getById lanza excepción → 500', async () => {
    redisClient.get.mockResolvedValue(null);
    repo.getById.mockRejectedValue(new Error('db fail'));

    const req = { params:{ id:'5' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUsuarioById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:'error',
      message:'Error al obtener el usuario',
      error:'db fail'
    });
  });
});

describe('PUT /users/:id — actualizarUsuario', () => {
  it('not found: repo.getById devuelve null → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params:{ id:'6' }, body:{ nombre:'X' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:'error',
      message:'Usuario no encontrado'
    });
  });

  it('happy path: actualiza y limpia caché → 200', async () => {
    const existing = { id:7 };
    const updated  = { id:7, nombre:'Y' };
    repo.getById.mockResolvedValue(existing);
    repo.update.mockResolvedValue(updated);

    const req = { params:{ id:'7' }, body:{ nombre:'Y' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarUsuario(req, res);

    expect(repo.update).toHaveBeenCalledWith('7', { nombre:'Y' });
    expect(redisClient.del).toHaveBeenCalledWith('usuario:7');
    expect(redisClient.del).toHaveBeenCalledWith('usuarios:all');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:'success',
      message:'Usuario actualizado exitosamente',
      data: updated
    });
  });

  it('internal error: repo.update lanza excepción → 500', async () => {
    repo.getById.mockResolvedValue({ id:8 });
    repo.update.mockRejectedValue(new Error('fail'));

    const req = { params:{ id:'8' }, body:{ nombre:'Z' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:'error',
      message:'Error al actualizar el usuario',
      error:'fail'
    });
  });
});

describe('DELETE /users/:id — eliminarUsuario', () => {
  it('not found: repo.getById devuelve null → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params:{ id:'9' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:'error',
      message:'Usuario no encontrado'
    });
  });

  it('happy path: elimina y limpia caché → 200', async () => {
    repo.getById.mockResolvedValue({ id:10 });
    repo.remove.mockResolvedValue();

    const req = { params:{ id:'10' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarUsuario(req, res);

    expect(repo.remove).toHaveBeenCalledWith('10');
    expect(redisClient.del).toHaveBeenCalledWith('usuario:10');
    expect(redisClient.del).toHaveBeenCalledWith('usuarios:all');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:'success',
      message:'Usuario eliminado exitosamente'
    });
  });

  it('internal error: repo.remove lanza excepción → 500', async () => {
    repo.getById.mockResolvedValue({ id:11 });
    repo.remove.mockRejectedValue(new Error('fail delete'));

    const req = { params:{ id:'11' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:'error',
      message:'Error al eliminar el usuario',
      error:'fail delete'
    });
  });
});
