// tests/controllers/plato.controller.test.js
import { jest } from '@jest/globals';

let crearPlato;
let repo;
let redisClient;

beforeAll(async () => {
  // 1) Mock de 'redis' antes de importar config/redis.js
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

  // 2) Mock de tu repositorio de platos
  await jest.unstable_mockModule(
    '../../src/repositories/platosRepository.js',
    () => ({
      __esModule: true,
      default: { create: jest.fn() }
    })
  );

  // 3) Ahora que los mocks están registrados, importamos los módulos
  const redisMod      = await import('../../src/config/redis.js');
  const repoMod       = await import('../../src/repositories/platosRepository.js');
  const controllerMod = await import('../../src/controllers/plato.controller.js');

  redisClient = redisMod.default;
  repo         = repoMod.default;
  crearPlato   = controllerMod.crearPlato;
});

describe('crearPlato (unidad, sólo happy path)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe devolver 201 y el plato creado', async () => {
    // a) Preparamos el mock de repo.create
    const mockPlato = {
      id: 7,
      nombre: 'Ensalada César',
      precio: 8.5,
      descripcion: 'Lechuga, pollo y aderezo',
      categoria: 'ensaladas',
      disponible: true,
      id_menu: '3'
    };
    repo.create.mockResolvedValue(mockPlato);

    // b) Creamos req/res simulados
    const req = {
      params: { id: '3' },
      body: {
        nombre: 'Ensalada César',
        precio: 8.5,
        descripcion: 'Lechuga, pollo y aderezo',
        categoria: 'ensaladas',
        disponible: true
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // c) Llamamos al controlador
    await crearPlato(req, res);

    // d) Verificamos que se llamó correctamente y que la respuesta es la esperada
    expect(repo.create).toHaveBeenCalledWith({
      nombre:      'Ensalada César',
      precio:       8.5,
      descripcion: 'Lechuga, pollo y aderezo',
      categoria:   'ensaladas',
      disponible:  true,
      id_menu:     '3'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Plato creado exitosamente',
      data:    mockPlato
    });

    // Y nos aseguramos de que no intentó usar Redis real
    expect(redisClient.connect).not.toHaveBeenCalled();
  });
});
