import { jest } from '@jest/globals';

let crearMenu;
let getMenuId;
let actualizarMenu;
let eliminarMenu;
let getMenusByRestaurant;
let repo;
let redisClient;

beforeAll(async () => {
  // 1) Mockeamos nuestro módulo de configuración de Redis (no el paquete 'redis')
  await jest.unstable_mockModule(
    '../../src/config/redis.js',
    () => ({
      __esModule: true,
      default: {
        on:      jest.fn(),
        connect: jest.fn().mockResolvedValue(),
        get:     jest.fn(),
        setEx:   jest.fn(),
        del:     jest.fn()
      }
    })
  );

  // 2) Mockeamos el repositorio de menús antes de cargar el controller
  await jest.unstable_mockModule(
    '../../src/repositories/menusRepository.js',
    () => ({
      __esModule: true,
      default: {
        create:              jest.fn(),
        getById:             jest.fn(),
        update:              jest.fn(),
        remove:              jest.fn(),
        getByRestauranteId:  jest.fn()
      }
    })
  );

  // 3) Ahora importamos dinámicamente Redis, repo y controller MOCKEADOS
  const [redisMod, repoMod, ctrlMod] = await Promise.all([
    import('../../src/config/redis.js'),
    import('../../src/repositories/menusRepository.js'),
    import('../../src/controllers/menu.controller.js')
  ]);

  redisClient          = redisMod.default;
  repo                 = repoMod.default;
  crearMenu            = ctrlMod.crearMenu;
  getMenuId            = ctrlMod.getMenuId;
  actualizarMenu       = ctrlMod.actualizarMenu;
  eliminarMenu         = ctrlMod.eliminarMenu;
  getMenusByRestaurant = ctrlMod.getMenus_RestauranteId;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /menus — crearMenu', () => {
  it('happy path: devuelve 201 y el menú creado', async () => {
    const input = { nombre: 'Menú Test', id_restaurante: '42' };
    const mockMenu = { id: 1, ...input };
    repo.create.mockResolvedValue(mockMenu);

    const req = { body: input };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearMenu(req, res);

    expect(repo.create).toHaveBeenCalledWith(input);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Menú creado exitosamente',
      data:    mockMenu
    });
  });

  it('validation error: faltan datos → 400', async () => {
    const req = { body: { nombre: 'Sólo nombre' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Faltan datos requeridos.'
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('internal error: repo.create lanza excepción → 500', async () => {
    repo.create.mockRejectedValue(new Error('DB fail'));

    const req = { body: { nombre: 'X', id_restaurante: '42' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al crear el menú',
      error:   'DB fail'
    });
  });
});

describe('GET /menus/:id — getMenuId', () => {
  it('happy path: devuelve desde caché → 200', async () => {
    const id = '5';
    const cacheKey = `menu:${id}`;
    const cached = { id: 5, nombre: 'Desde Caché' };
    redisClient.get.mockResolvedValue(JSON.stringify(cached));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getMenuId(req, res);

    expect(redisClient.get).toHaveBeenCalledWith(cacheKey);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Menú obtenido desde caché',
      data:    cached
    });
    expect(repo.getById).not.toHaveBeenCalled();
  });

  it('fallback BD: sin caché, existe en BD → 200', async () => {
    const id = '6';
    const cacheKey = `menu:${id}`;
    const menu = { id: 6, nombre: 'Desde BD' };
    redisClient.get.mockResolvedValue(null);
    repo.getById.mockResolvedValue(menu);

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getMenuId(req, res);

    expect(repo.getById).toHaveBeenCalledWith(id);
    expect(redisClient.setEx).toHaveBeenCalledWith(cacheKey, 120, JSON.stringify(menu));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Menú obtenido desde la base de datos',
      data:    menu
    });
  });

  it('not found: repo.getById devuelve null → 404', async () => {
    const id = '7';
    redisClient.get.mockResolvedValue(null);
    repo.getById.mockResolvedValue(null);

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getMenuId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Menú no encontrado'
    });
  });

  it('internal error: repo.getById lanza excepción → 500', async () => {
    redisClient.get.mockResolvedValue(null);
    repo.getById.mockRejectedValue(new Error('DB crash'));

    const req = { params: { id: '8' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getMenuId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al obtener el menú',
      error:   'DB crash'
    });
  });
});

describe('PUT /menus/:id — actualizarMenu', () => {
  it('not found: repo.getById devuelve null → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params: { id: '9' }, body: { nombre: 'Nuevo', id_restaurante: '1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Menú no encontrado'
    });
  });

  it('happy path: actualiza y responde → 200', async () => {
    const id = '10';
    const updated = { id: 10, nombre: 'Actualizado', id_restaurante: '1' };
    repo.getById.mockResolvedValue({ id });
    repo.update.mockResolvedValue(updated);

    const req = { params: { id }, body: { nombre: 'Actualizado', id_restaurante: '1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarMenu(req, res);

    expect(repo.update).toHaveBeenCalledWith(id, { nombre: 'Actualizado', id_restaurante: '1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Menú actualizado exitosamente',
      data:    updated
    });
  });

  it('internal error: repo.update lanza excepción → 500', async () => {
    const id = '11';
    repo.getById.mockResolvedValue({ id });
    repo.update.mockRejectedValue(new Error('Fail upd'));

    const req = { params: { id }, body: { nombre: 'X', id_restaurante: '1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al actualizar el menú',
      error:   'Fail upd'
    });
  });
});

describe('DELETE /menus/:id — eliminarMenu', () => {
  it('not found: repo.getById devuelve null → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params: { id: '12' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Menú no encontrado'
    });
  });

  it('happy path: elimina y responde → 200', async () => {
    const id = '13';
    repo.getById.mockResolvedValue({ id });
    repo.remove.mockResolvedValue();

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarMenu(req, res);

    expect(repo.remove).toHaveBeenCalledWith(id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Menú eliminado exitosamente'
    });
  });

  it('internal error: repo.remove lanza excepción → 500', async () => {
    const id = '14';
    repo.getById.mockResolvedValue({ id });
    repo.remove.mockRejectedValue(new Error('Fail del'));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al eliminar el menú',
      error:   'Fail del'
    });
  });
});

describe('GET /restaurants/:id/menus — getMenus_RestauranteId', () => {
  it('happy path caché: devuelve → 200', async () => {
    const id = '20';
    const key = `menus_restaurante:${id}`;
    const cached = [{ id: 1 }];
    redisClient.get.mockResolvedValue(JSON.stringify(cached));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getMenusByRestaurant(req, res);

    expect(redisClient.get).toHaveBeenCalledWith(key);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Menús obtenidos desde caché',
      data:    cached
    });
  });

  it('not found: sin menús en BD → 404', async () => {
    const id = '21';
    redisClient.get.mockResolvedValue(null);
    repo.getByRestauranteId.mockResolvedValue([]);

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getMenusByRestaurant(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Menús no encontrados o restaurante inexistente'
    });
  });

  it('fallback BD: sin caché, datos desde BD → 200', async () => {
    const id = '22';
    const key = `menus_restaurante:${id}`;
    const list = [{ id: 2 }];
    redisClient.get.mockResolvedValue(null);
    repo.getByRestauranteId.mockResolvedValue(list);

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getMenusByRestaurant(req, res);

    expect(repo.getByRestauranteId).toHaveBeenCalledWith(id);
    expect(redisClient.setEx).toHaveBeenCalledWith(key, 120, JSON.stringify(list));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Menús obtenidos desde base de datos',
      data:    list
    });
  });

  it('internal error: repo.getByRestauranteId lanza excepción → 500', async () => {
    const id = '23';
    redisClient.get.mockResolvedValue(null);
    repo.getByRestauranteId.mockRejectedValue(new Error('Fail get'));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getMenusByRestaurant(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al obtener los menús',
      error:   'Fail get'
    });
  });
});
