// tests/controllers/restaurante.controller.test.js
import { jest } from '@jest/globals';

let getRestaurants,
    getRestaurantById,
    crearRestaurante,
    actualizarRestaurante,
    eliminarRestaurante;
let repo, redisClient;

beforeAll(async () => {
  // 1) Mock del módulo de configuración de Redis (antes de importarlo)
  await jest.unstable_mockModule('../../src/config/redis.js', () => ({
    __esModule: true,
    default: {
      on:      jest.fn(),
      connect: jest.fn().mockResolvedValue(),
      get:     jest.fn(),
      setEx:   jest.fn(),
      del:     jest.fn()
    }
  }));

  // 2) Mock del repositorio de restaurantes
  await jest.unstable_mockModule('../../src/repositories/restaurantesRepository.js', () => ({
    __esModule: true,
    default: {
      getAll:  jest.fn(),
      getById: jest.fn(),
      create:  jest.fn(),
      update:  jest.fn(),
      remove:  jest.fn()
    }
  }));

  // 3) Import dinámico tras registrar los mocks
  const [redisMod, repoMod, ctrlMod] = await Promise.all([
    import('../../src/config/redis.js'),
    import('../../src/repositories/restaurantesRepository.js'),
    import('../../src/controllers/restaurante.controller.js')
  ]);

  redisClient           = redisMod.default;
  repo                  = repoMod.default;
  getRestaurants        = ctrlMod.getRestaurants;
  getRestaurantById     = ctrlMod.getRestaurantById;
  crearRestaurante      = ctrlMod.crearRestaurante;
  actualizarRestaurante = ctrlMod.actualizarRestaurante;
  eliminarRestaurante   = ctrlMod.eliminarRestaurante;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /restaurants — getRestaurants', () => {
  it('happy path: devuelve datos desde caché (200)', async () => {
    const cached = [{ id: 1, nombre: 'R1' }];
    redisClient.get.mockResolvedValue(JSON.stringify(cached));

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getRestaurants(req, res);

    expect(redisClient.get).toHaveBeenCalledWith('restaurants:all');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Restaurantes obtenidos desde caché',
      data:    cached
    });
    expect(repo.getAll).not.toHaveBeenCalled();
  });

  it('repo path: no hay caché, obtiene de BD y setea caché (200)', async () => {
    const list = [{ id: 2, nombre: 'R2' }];
    redisClient.get.mockResolvedValue(null);
    repo.getAll.mockResolvedValue(list);

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getRestaurants(req, res);

    expect(repo.getAll).toHaveBeenCalled();
    expect(redisClient.setEx).toHaveBeenCalledWith('restaurants:all', 300, JSON.stringify(list));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Restaurantes obtenidos desde base de datos',
      data:    list
    });
  });

  it('internal error: redis.get lanza excepción (500)', async () => {
    redisClient.get.mockRejectedValue(new Error('fail-redis'));

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getRestaurants(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al obtener los restaurantes',
      error:   'fail-redis'
    });
  });
});

describe('GET /restaurants/:id — getRestaurantById', () => {
  it('happy path: devuelve datos desde caché (200)', async () => {
    const id = '3';
    const cacheKey = `restaurant:${id}`;
    const data = { id: 3, nombre: 'R3' };
    redisClient.get.mockResolvedValue(JSON.stringify(data));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getRestaurantById(req, res);

    expect(redisClient.get).toHaveBeenCalledWith(cacheKey);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Restaurante obtenido desde caché',
      data
    });
    expect(repo.getById).not.toHaveBeenCalled();
  });

  it('not found: sin caché y repo devuelve null → 404', async () => {
    const id = '4';
    redisClient.get.mockResolvedValue(null);
    repo.getById.mockResolvedValue(null);

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getRestaurantById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Restaurante no encontrado'
    });
  });

  it('internal error: repo.getById lanza excepción (500)', async () => {
    const id = '5';
    redisClient.get.mockResolvedValue(null);
    repo.getById.mockRejectedValue(new Error('db-fail'));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getRestaurantById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al obtener el restaurante',
      error:   'db-fail'
    });
  });
});

describe('POST /restaurants — crearRestaurante', () => {
  it('happy path: crea y limpia caché (201)', async () => {
    const input = { nombre: 'R4', direccion: 'D4', telefono: '+1', id_administrador: 7 };
    const mockR = { id: 4, ...input };
    repo.create.mockResolvedValue(mockR);

    const req = { body: input };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearRestaurante(req, res);

    expect(repo.create).toHaveBeenCalledWith(input);
    expect(redisClient.del).toHaveBeenCalledWith('restaurants:all');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Restaurante creado exitosamente',
      data:    mockR
    });
  });

  it('validation error: faltan campos → 400', async () => {
    const req = { body: { nombre: 'Sólo nombre' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearRestaurante(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Faltan datos requeridos.'
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('internal error: repo.create falla → 500', async () => {
    repo.create.mockRejectedValue(new Error('fail-create'));

    const req = { body: { nombre: 'R6', direccion: 'D6', telefono: '+2', id_administrador: 8 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearRestaurante(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al crear el restaurante',
      error:   'fail-create'
    });
  });
});

describe('PUT /restaurants/:id — actualizarRestaurante', () => {
  it('not found: repo.getById devuelve null → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params: { id: '9' }, body: { nombre: 'X' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarRestaurante(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Restaurante no encontrado'
    });
  });

  it('happy path: update y cache invalidada (200)', async () => {
    const id = '10';
    const updated = { id: 10, nombre: 'Y' };
    repo.getById.mockResolvedValue({ id });
    repo.update.mockResolvedValue(updated);

    const req = { params: { id }, body: { nombre: 'Y' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarRestaurante(req, res);

    expect(repo.update).toHaveBeenCalledWith(id, { nombre: 'Y' });
    expect(redisClient.del).toHaveBeenCalledWith('restaurants:all');
    expect(redisClient.del).toHaveBeenCalledWith(`restaurant:${id}`);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Restaurante actualizado exitosamente',
      data:    updated
    });
  });

  it('internal error: repo.update falla → 500', async () => {
    const id = '11';
    repo.getById.mockResolvedValue({ id });
    repo.update.mockRejectedValue(new Error('fail-update'));

    const req = { params: { id }, body: { nombre: 'Z' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarRestaurante(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al actualizar el restaurante',
      error:   'fail-update'
    });
  });
});

describe('DELETE /restaurants/:id — eliminarRestaurante', () => {
  it('not found: repo.getById devuelve null → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params: { id: '12' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarRestaurante(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Restaurante no encontrado'
    });
  });

  it('happy path: remove y cache invalidada (200)', async () => {
    const id = '13';
    repo.getById.mockResolvedValue({ id });
    repo.remove.mockResolvedValue();

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarRestaurante(req, res);

    expect(repo.remove).toHaveBeenCalledWith(id);
    expect(redisClient.del).toHaveBeenCalledWith('restaurants:all');
    expect(redisClient.del).toHaveBeenCalledWith(`restaurant:${id}`);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Restaurante eliminado exitosamente'
    });
  });

  it('internal error: repo.remove falla → 500', async () => {
    const id = '14';
    repo.getById.mockResolvedValue({ id });
    repo.remove.mockRejectedValue(new Error('fail-remove'));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarRestaurante(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al eliminar el restaurante',
      error:   'fail-remove'
    });
  });
});
