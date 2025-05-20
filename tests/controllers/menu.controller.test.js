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

// 2) Stub del repositorio de menús
await jest.unstable_mockModule(
  '../../src/repositories/menusRepository.js',
  () => ({
    __esModule: true,
    default: {
      create: jest.fn()
      // (otros métodos no necesarios para este test)
    }
  })
);

// 3) Importar módulos ya mockeados
const repo         = (await import('../../src/repositories/menusRepository.js')).default;
const { crearMenu } = await import('../../src/controllers/menu.controller.js');
const redisClient  = (await import('../../src/config/redis.js')).default;

describe('crearMenu (unidad, sin Redis real)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver 201 y el menú creado', async () => {
    // a) Preparar mock del repo
    const mockMenu = { id: 1, nombre: 'Test', id_restaurante: 99 };
    repo.create.mockResolvedValue(mockMenu);

    // b) Crear request/respuesta simulados
    const req = { body: { nombre: 'Test', id_restaurante: 99 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // c) Ejecutar el controlador
    await crearMenu(req, res);

    // d) Aserciones
    expect(repo.create).toHaveBeenCalledWith({ nombre: 'Test', id_restaurante: 99 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Menú creado exitosamente',
      data:    mockMenu
    });

    // Y nos aseguramos de que Redis NO interfiere aquí
    expect(redisClient.get).not.toHaveBeenCalled();
    expect(redisClient.setEx).not.toHaveBeenCalled();
  });
});
