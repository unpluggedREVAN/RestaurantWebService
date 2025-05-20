import { crearUsuario, getUsuarios, getUsuarioById, actualizarUsuario, eliminarUsuario } from '../../src/controllers/user.controller.js';
import repo from '../../src/repositories/usuariosRepository.js';
import redisClient from '../../src/config/redis.js';

// Mock dependencies
jest.mock('../../src/repositories/usuariosRepository.js');
jest.mock('../../src/config/redis.js', () => {
  return {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    default: {
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn()
    }
  };
});
describe('User Controller', () => {
    let mockRequest;
    let mockResponse;
    
    beforeEach(() => {
        mockRequest = {
            body: {},
            params: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('crearUsuario', () => {
        it('should create a user successfully', async () => {
            mockRequest.body = {
                nombre: 'Test User',
                correo: 'test@test.com',
                tipo_usuario: 'cliente'
            };
            
            const mockUser = { id: 1, ...mockRequest.body };
            repo.create.mockResolvedValue(mockUser);

            await crearUsuario(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Usuario creado exitosamente',
                data: mockUser
            });
        });

        it('should return 400 if required fields are missing', async () => {
            mockRequest.body = { nombre: 'Test User' };

            await crearUsuario(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Faltan datos requeridos.'
            });
        });
    });

    describe('getUsuarios', () => {
        it('should return users from cache if available', async () => {
            const cachedUsers = [{ id: 1, nombre: 'Cached User' }];
            redisClient.get.mockResolvedValue(JSON.stringify(cachedUsers));

            await getUsuarios(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Usuarios obtenidos desde caché',
                data: cachedUsers
            });
        });

        it('should return users from database if not in cache', async () => {
            const dbUsers = [{ id: 1, nombre: 'DB User' }];
            redisClient.get.mockResolvedValue(null);
            repo.getAll.mockResolvedValue(dbUsers);

            await getUsuarios(mockRequest, mockResponse);

            expect(redisClient.setEx).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Usuarios obtenidos desde la base de datos',
                data: dbUsers
            });
        });
    });

    describe('getUsuarioById', () => {
        it('should return 404 if user not found', async () => {
            mockRequest.params = { id: '999' };
            redisClient.get.mockResolvedValue(null);
            repo.getById.mockResolvedValue(null);

            await getUsuarioById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        });
    });

    describe('actualizarUsuario', () => {
        it('should update user successfully', async () => {
            mockRequest.params = { id: '1' };
            mockRequest.body = { nombre: 'Updated Name' };
            
            const updatedUser = { id: 1, nombre: 'Updated Name' };
            repo.getById.mockResolvedValue({ id: 1, nombre: 'Old Name' });
            repo.update.mockResolvedValue(updatedUser);

            await actualizarUsuario(mockRequest, mockResponse);

            expect(redisClient.del).toHaveBeenCalledTimes(2);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Usuario actualizado exitosamente',
                data: updatedUser
            });
        });
    });

    describe('eliminarUsuario', () => {
        it('should delete user successfully', async () => {
            mockRequest.params = { id: '1' };
            repo.getById.mockResolvedValue({ id: 1 });

            await eliminarUsuario(mockRequest, mockResponse);

            expect(repo.remove).toHaveBeenCalledWith('1');
            expect(redisClient.del).toHaveBeenCalledTimes(2);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Usuario eliminado exitosamente'
            });
        });
    });
});