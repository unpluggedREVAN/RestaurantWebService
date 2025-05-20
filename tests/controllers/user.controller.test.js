// 1) Mockeamos el repositorio de usuarios con una implementación vacía de sus métodos
jest.mock('../../src/repositories/usuariosRepository.js', () => ({
  __esModule: true,
  default: {
    create:  jest.fn(),
    getAll:  jest.fn(),
    getById:  jest.fn(),
    update:  jest.fn(),
    remove:  jest.fn()
  }
}));

// 2) Mockeamos el config de Redis (Jest usará tests/__mocks__/redis.js)
jest.mock('../../src/config/redis.js');

import repo from '../../src/repositories/usuariosRepository.js';
import redisClient from '../../src/config/redis.js';
import {
  crearUsuario,
  getUsuarios,
  getUsuarioById,
  actualizarUsuario,
  eliminarUsuario
} from '../../src/controllers/user.controller.js';

describe('Controladores de usuario (user.controller)', () => {
  // Limpiamos el estado de todos los mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearUsuario', () => {
    test('400 si faltan datos requeridos', async () => {
      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Faltan datos requeridos.'
      });
      expect(repo.create).not.toHaveBeenCalled();
    });

    test('201 y user creado correctamente', async () => {
      const userData = { nombre: 'Ana', correo: 'ana@mail.com', tipo_usuario: 'user' };
      const fakeUser = { id: 1, ...userData };
      repo.create.mockResolvedValue(fakeUser);

      const req = { body: userData };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await crearUsuario(req, res);

      expect(repo.create).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuario creado exitosamente',
        data: fakeUser
      });
    });

    test('500 si repo.create lanza un error', async () => {
      repo.create.mockRejectedValue(new Error('DB fail'));
      const req = { body: { nombre: 'X', correo: 'x@mail.com', tipo_usuario: 'user' } };
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

  describe('getUsuarios', () => {
    test('200 y lista desde caché si existe', async () => {
      const fakeList = [{ id: 1, nombre: 'Test' }];
      redisClient.get.mockResolvedValue(JSON.stringify(fakeList));

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getUsuarios(req, res);

      expect(redisClient.get).toHaveBeenCalledWith('usuarios:all');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuarios obtenidos desde caché',
        data: fakeList
      });
      expect(repo.getAll).not.toHaveBeenCalled();
    });

    test('200 y lista desde BD + caché si no hay cache', async () => {
      const fakeList = [{ id: 2 }];
      redisClient.get.mockResolvedValue(null);
      repo.getAll.mockResolvedValue(fakeList);

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getUsuarios(req, res);

      expect(redisClient.get).toHaveBeenCalledWith('usuarios:all');
      expect(repo.getAll).toHaveBeenCalled();
      expect(redisClient.setEx).toHaveBeenCalledWith(
        'usuarios:all', 300, JSON.stringify(fakeList)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuarios obtenidos desde la base de datos',
        data: fakeList
      });
    });

    test('500 si hay error al obtener usuarios', async () => {
      redisClient.get.mockRejectedValue(new Error('redis fail'));
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getUsuarios(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al obtener usuarios',
        error: 'redis fail'
      });
    });
  });

  describe('getUsuarioById', () => {
    test('200 y usuario desde caché si existe', async () => {
      const fakeUser = { id: 3 };
      redisClient.get.mockResolvedValue(JSON.stringify(fakeUser));

      const req = { params: { id: '3' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getUsuarioById(req, res);

      expect(redisClient.get).toHaveBeenCalledWith('usuario:3');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuario obtenido desde caché',
        data: fakeUser
      });
      expect(repo.getById).not.toHaveBeenCalled();
    });

    test('404 si no existe en BD', async () => {
      redisClient.get.mockResolvedValue(null);
      repo.getById.mockResolvedValue(null);

      const req = { params: { id: '4' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getUsuarioById(req, res);

      expect(repo.getById).toHaveBeenCalledWith('4');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });

    test('200 y usuario desde BD + cacheo si no hay caché', async () => {
      const fakeUser = { id: 5 };
      redisClient.get.mockResolvedValue(null);
      repo.getById.mockResolvedValue(fakeUser);

      const req = { params: { id: '5' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getUsuarioById(req, res);

      expect(repo.getById).toHaveBeenCalledWith('5');
      expect(redisClient.setEx).toHaveBeenCalledWith(
        'usuario:5', 300, JSON.stringify(fakeUser)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuario obtenido desde la base de datos',
        data: fakeUser
      });
    });

    test('500 si hay error al obtener usuario', async () => {
      redisClient.get.mockResolvedValue(null);
      repo.getById.mockRejectedValue(new Error('db fail'));

      const req = { params: { id: '6' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getUsuarioById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al obtener el usuario',
        error: 'db fail'
      });
    });
  });

  describe('actualizarUsuario', () => {
    test('404 si el usuario no existe', async () => {
      repo.getById.mockResolvedValue(null);

      const req = { params: { id: '7' }, body: { nombre: 'X' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await actualizarUsuario(req, res);

      expect(repo.getById).toHaveBeenCalledWith('7');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });

    test('200 al actualizar y limpiar caché', async () => {
      const existing = { id: '8' };
      const changes = { nombre: 'Nuevo' };
      const updated  = { id: '8', nombre: 'Nuevo' };
      repo.getById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(updated);

      const req = { params: { id: '8' }, body: changes };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await actualizarUsuario(req, res);

      expect(repo.getById).toHaveBeenCalledWith('8');
      expect(repo.update).toHaveBeenCalledWith('8', changes);
      expect(redisClient.del).toHaveBeenCalledWith('usuario:8');
      expect(redisClient.del).toHaveBeenCalledWith('usuarios:all');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: updated
      });
    });

    test('500 si hay error al actualizar', async () => {
      repo.getById.mockRejectedValue(new Error('fail update'));

      const req = { params: { id: '9' }, body: { nombre: 'Y' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await actualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al actualizar el usuario',
        error: 'fail update'
      });
    });
  });

  describe('eliminarUsuario', () => {
    test('404 si el usuario no existe', async () => {
      repo.getById.mockResolvedValue(null);

      const req = { params: { id: '10' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eliminarUsuario(req, res);

      expect(repo.getById).toHaveBeenCalledWith('10');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });

    test('200 al eliminar y limpiar caché', async () => {
      const existing = { id: '11' };
      repo.getById.mockResolvedValue(existing);
      repo.remove.mockResolvedValue();

      const req = { params: { id: '11' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eliminarUsuario(req, res);

      expect(repo.getById).toHaveBeenCalledWith('11');
      expect(repo.remove).toHaveBeenCalledWith('11');
      expect(redisClient.del).toHaveBeenCalledWith('usuario:11');
      expect(redisClient.del).toHaveBeenCalledWith('usuarios:all');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuario eliminado exitosamente'
      });
    });

    test('500 si hay error al eliminar', async () => {
      repo.getById.mockRejectedValue(new Error('fail delete'));

      const req = { params: { id: '12' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eliminarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al eliminar el usuario',
        error: 'fail delete'
      });
    });
  });
});
