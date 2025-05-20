import { it, jest } from '@jest/globals';

await jest.unstable_mockModule(
  'redis',
  () => ({
    __esModule: true,
    // createClient devuelve un cliente stub
    createClient: jest.fn(() => ({
      on:      jest.fn(),            // redisClient.on('error', …)
      connect: jest.fn(() => Promise.resolve()), // await connect()
      get:     jest.fn(),            // no lo usamos en este test
      setEx:   jest.fn(),
      del:     jest.fn()
    }))
  })
);

await jest.unstable_mockModule(
  '../../src/repositories/usuariosRepository.js',
  () => ({
    __esModule: true,
    default: {
      create: jest.fn()
    }
  })
);

const redisClient = (await import('../../src/config/redis.js')).default;
const repo        = (await import('../../src/repositories/usuariosRepository.js')).default;
const { crearUsuario } = await import('../../src/controllers/user.controller.js');

describe('crearUsuario (unitario sin Redis real)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver 201 y el usuario creado', async () => {
    // a) Preparar: mock de repo.create
    const mockUser = { id: 42, nombre: 'Test', correo: 't@t.com', tipo_usuario: 'cliente' };
    repo.create.mockResolvedValue(mockUser);

    // b) Simular req/res de Express
    const req = { body: { nombre: 'Test', correo: 't@t.com', tipo_usuario: 'cliente' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // c) Ejecutar el controlador
    await crearUsuario(req, res);

    // d) Verificar respuesta
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status:  'success',
      message: 'Usuario creado exitosamente',
      data:    mockUser
    });

    // Además, aseguramos que no se intentó usar el cliente real de Redis
    expect(redisClient.connect).toHaveBeenCalledTimes(0);
    expect(repo.create).toHaveBeenCalledWith({
      nombre: 'Test',
      correo: 't@t.com',
      tipo_usuario: 'cliente'
    });
  });

  it('debe devolver 400 si faltan datos requeridos', async () => {
    const req = { body: { nombre: 'Test' } }; // Falta correo y tipo_usuario
    const res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    await crearUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status:  'error',
      message: 'Faltan datos requeridos.'
    });
  });
});
