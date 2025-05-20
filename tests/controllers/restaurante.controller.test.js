import { jest } from '@jest/globals';

// 1) Stub del paquete 'redis' *antes* de cargar config/redis.js
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

// 2) Stub del repositorio de restaurantes
await jest.unstable_mockModule(
  '../../src/repositories/restaurantesRepository.js',
  () => ({
    __esModule: true,
    default: {
      create: jest.fn()
    }
  })
);

// 3) Importar repositorio y cliente Redis mockeados, y luego el controller
const repo          = (await import('../../src/repositories/restaurantesRepository.js')).default;
const redisClient   = (await import('../../src/config/redis.js')).default;
const { crearRestaurante } = await import('../../src/controllers/restaurante.controller.js');

describe('crearRestaurante (unidad, happy path)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver 201 y el restaurante creado', async () => {
    // a) Preparamos el mock de repo.create
    const mockRest = {
      id: 1,
      nombre: 'Mi Restaurante',
      direccion: 'Calle Falsa 123',
      telefono: '+50612345678',
      id_administrador: 42
    };
    repo.create.mockResolvedValue(mockRest);

    // b) Simulamos req/res de Express
    const req = {
      body: {
        nombre: 'Mi Restaurante',
        direccion: 'Calle Falsa 123',
        telefono: '+50612345678',
        id_administrador: 42
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // c) Llamamos al controlador
    await crearRestaurante(req, res);

    // d) Verificaciones
    expect(repo.create).toHaveBeenCalledWith({
      nombre: 'Mi Restaurante',
      direccion: 'Calle Falsa 123',
      telefono: '+50612345678',
      id_administrador: 42
    });
    expect(redisClient.del).toHaveBeenCalledWith('restaurants:all');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Restaurante creado exitosamente',
      data:     mockRest
    });
  });
});
