import { jest } from '@jest/globals';

let crearPlato;
let getPlatoId;
let actualizarPlato;
let eliminarPlato;
let getPlatosByMenu;
let getAllPlatos;
let repo;
let redisClient;

beforeAll(async () => {
  // 1) Mock del módulo de configuración de Redis
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

  // 2) Mock del repositorio de platos
  await jest.unstable_mockModule('../../src/repositories/platosRepository.js', () => ({
    __esModule: true,
    default: {
      create:      jest.fn(),
      getById:     jest.fn(),
      update:      jest.fn(),
      remove:      jest.fn(),
      getByMenuId: jest.fn(),
      getAll:      jest.fn()
    }
  }));

  // 3) Importar dinámicamente Redis, repo y controller
  const [redisMod, repoMod, ctrlMod] = await Promise.all([
    import('../../src/config/redis.js'),
    import('../../src/repositories/platosRepository.js'),
    import('../../src/controllers/plato.controller.js')
  ]);

  redisClient     = redisMod.default;
  repo            = repoMod.default;
  crearPlato      = ctrlMod.crearPlato;
  getPlatoId      = ctrlMod.getPlatoId;
  actualizarPlato = ctrlMod.actualizarPlato;
  eliminarPlato   = ctrlMod.eliminarPlato;
  getPlatosByMenu = ctrlMod.getPlatosByMenu;
  getAllPlatos    = ctrlMod.getAllPlatos;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /menus/:id/platos — crearPlato', () => {
  it('happy path: crea un plato y responde 201', async () => {
    const input = {
      nombre: 'Ensalada César',
      precio: 8.5,
      descripcion: 'Lechuga con pollo',
      categoria: 'ensaladas',
      disponible: true
    };
    const mockPlato = { id: 7, id_menu: '3', ...input };
    repo.create.mockResolvedValue(mockPlato);

    const req = { params: { id: '3' }, body: input };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearPlato(req, res);

    expect(repo.create).toHaveBeenCalledWith({ id_menu: '3', ...input });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Plato creado exitosamente',
      data:    mockPlato
    });
  });

  it('validation error: faltan datos → 400', async () => {
    const req = { params: { id: '3' }, body: { precio: 5 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearPlato(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Faltan datos del plato.'
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('internal error: repo.create lanza excepción → 500', async () => {
    repo.create.mockRejectedValue(new Error('DB error'));

    const req = { params: { id: '3' }, body: { nombre: 'X', precio: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearPlato(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al crear el plato',
      error:   'DB error'
    });
  });
});

describe('GET /platos/:id — getPlatoId', () => {
  it('happy path: devuelve desde caché → 200', async () => {
    const id = '5';
    const cacheKey = `plato:${id}`;
    const cached = { id: 5, nombre: 'Sopa' };
    redisClient.get.mockResolvedValue(JSON.stringify(cached));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getPlatoId(req, res);

    expect(redisClient.get).toHaveBeenCalledWith(cacheKey);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Plato obtenido desde caché',
      data:    cached
    });
    expect(repo.getById).not.toHaveBeenCalled();
  });

  it('fallback BD: sin caché, existe en BD → 200', async () => {
    const id = '6';
    const cacheKey = `plato:${id}`;
    const plato = { id: 6, nombre: 'Pizza' };
    redisClient.get.mockResolvedValue(null);
    repo.getById.mockResolvedValue(plato);

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getPlatoId(req, res);

    expect(repo.getById).toHaveBeenCalledWith(id);
    expect(redisClient.setEx).toHaveBeenCalledWith(cacheKey, 300, JSON.stringify(plato));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Plato obtenido desde base de datos',
      data:    plato
    });
  });

  it('not found: repo.getById devuelve null → 404', async () => {
    const id = '7';
    redisClient.get.mockResolvedValue(null);
    repo.getById.mockResolvedValue(null);

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getPlatoId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Plato no encontrado'
    });
  });
});

describe('PUT /platos/:id — actualizarPlato', () => {
  it('not found: repo.getById devuelve null → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params: { id: '8' }, body: { nombre: 'Nuevo' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarPlato(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Plato no encontrado'
    });
  });

  it('happy path: actualiza y responde → 200', async () => {
    const id = '9';
    const changes = { nombre: 'Ensalada XL' };
    const updated = { id: 9, ...changes };
    repo.getById.mockResolvedValue({ id });
    repo.update.mockResolvedValue(updated);

    const req = { params: { id }, body: changes };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarPlato(req, res);

    expect(repo.update).toHaveBeenCalledWith(id, changes);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Plato actualizado exitosamente',
      data:    updated
    });
  });

  it('internal error: repo.update lanza excepción → 500', async () => {
    const id = '10';
    repo.getById.mockResolvedValue({ id });
    repo.update.mockRejectedValue(new Error('fail upd'));

    const req = { params: { id }, body: { nombre: 'Error' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await actualizarPlato(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al actualizar el plato',
      error:   'fail upd'
    });
  });
});

describe('DELETE /platos/:id — eliminarPlato', () => {
  it('not found: repo.getById devuelve null → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params: { id: '11' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarPlato(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Plato no encontrado'
    });
  });

  it('happy path: elimina y responde → 200', async () => {
    const id = '12';
    repo.getById.mockResolvedValue({ id });
    repo.remove.mockResolvedValue();

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarPlato(req, res);

    expect(repo.remove).toHaveBeenCalledWith(id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Plato eliminado exitosamente'
    });
  });

  it('internal error: repo.remove lanza excepción → 500', async () => {
    const id = '13';
    repo.getById.mockResolvedValue({ id });
    repo.remove.mockRejectedValue(new Error('fail del'));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await eliminarPlato(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al eliminar el plato',
      error:   'fail del'
    });
  });
});

describe('GET /menus/:id/platos — getPlatosByMenu', () => {
  it('happy path: devuelve desde caché → 200', async () => {
    const id = '5';
    const key = `platos_menu:${id}`;
    const cached = [{ id: 20 }];
    redisClient.get.mockResolvedValue(JSON.stringify(cached));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getPlatosByMenu(req, res);

    expect(redisClient.get).toHaveBeenCalledWith(key);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Platos obtenidos desde caché',
      data:    cached
    });
  });

  it('not found: sin platos en BD → 404', async () => {
    const id = '6';
    redisClient.get.mockResolvedValue(null);
    repo.getByMenuId.mockResolvedValue([]);

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getPlatosByMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'No se encontraron platos para este menú'
    });
  });

  it('internal error: repo.getByMenuId lanza excepción → 500', async () => {
    const id = '6';
    redisClient.get.mockResolvedValue(null);
    repo.getByMenuId.mockRejectedValue(new Error('fail menu'));

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getPlatosByMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al obtener los platos del menú',
      error:   'fail menu'
    });
  });
});

describe('GET /platos — getAllPlatos', () => {
  it('happy path: lista completa → 200', async () => {
    const list = [{ id: 30 }];
    repo.getAll.mockResolvedValue(list);

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllPlatos(req, res);

    expect(repo.getAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Lista de todos los platos',
      data:    list
    });
  });

  it('empty path: lista vacía → 200 con data=[]', async () => {
    repo.getAll.mockResolvedValue([]);

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllPlatos(req, res);

    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Lista de todos los platos',
      data:    []
    });
  });

  it('internal error: repo.getAll lanza excepción → 500', async () => {
    repo.getAll.mockRejectedValue(new Error('fail all'));

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getAllPlatos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Error al obtener todos los platos',
      error:   'fail all'
    });
  });
});
