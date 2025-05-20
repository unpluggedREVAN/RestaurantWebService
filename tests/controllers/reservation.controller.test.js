// tests/controllers/reservation.controller.test.js
import { jest } from '@jest/globals';

let createReservation;
let getReservationById;
let cancelReservation;
let getReservationsByUser;
let getReservationsByRestaurant;
let repo;

beforeAll(async () => {
  // 1) Mock del repositorio de reservas
  await jest.unstable_mockModule(
    '../../src/repositories/reservasRepository.js',
    () => ({
      __esModule: true,
      default: {
        create:            jest.fn(),
        getById:           jest.fn(),
        cancel:            jest.fn(),
        getByClienteId:    jest.fn(),
        getByRestauranteId: jest.fn()
      }
    })
  );

  // 2) Importar controller y repo ya mockeados
  const ctrlMod = await import('../../src/controllers/reservation.controller.js');
  const repoMod = await import('../../src/repositories/reservasRepository.js');

  createReservation        = ctrlMod.createReservation;
  getReservationById       = ctrlMod.getReservationById;
  cancelReservation        = ctrlMod.cancelReservation;
  getReservationsByUser    = ctrlMod.getReservationsByUser;
  getReservationsByRestaurant = ctrlMod.getReservationsByRestaurant;
  repo                     = repoMod.default;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /reservations — createReservation', () => {
  it('happy path: devuelve 201 y la reserva creada', async () => {
    const input = {
      id_cliente:     10,
      id_restaurante: 20,
      fecha:          '2025-05-20',
      numero_personas: 4
    };
    const mockRes = { id: 1, ...input };
    repo.create.mockResolvedValue(mockRes);

    const req = { body: input };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createReservation(req, res);

    expect(repo.create).toHaveBeenCalledWith(input);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Reserva creada con éxito.",
      data:    mockRes
    });
  });

  it('validation error: faltan campos → 400', async () => {
    const req = { body: { id_cliente: 10 } }; // faltan otros campos
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Todos los campos son obligatorios."
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('internal error: repo.create lanza excepción → 500', async () => {
    repo.create.mockRejectedValue(new Error('DB fail'));

    const req = { body: { id_cliente:10, id_restaurante:20, fecha:'2025-05-20', numero_personas:4 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al crear la reserva.",
      error:   "DB fail"
    });
  });
});

describe('GET /reservations/:id — getReservationById', () => {
  it('happy path: devuelve 200 y la reserva', async () => {
    const mockRes = { id:5, id_cliente:1, id_restaurante:2 };
    repo.getById.mockResolvedValue(mockRes);

    const req = { params: { id: '5' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getReservationById(req, res);

    expect(repo.getById).toHaveBeenCalledWith('5');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: mockRes });
  });

  it('not found: reserva inexistente → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params: { id: '9' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getReservationById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Reserva no encontrada."
    });
  });

  it('internal error: repo.getById lanza excepción → 500', async () => {
    repo.getById.mockRejectedValue(new Error('DB crash'));

    const req = { params: { id: '7' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getReservationById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al obtener la reserva.",
      error:   "DB crash"
    });
  });
});

describe('DELETE /reservations/:id — cancelReservation', () => {
  it('happy path: retorna 200 y datos de la reserva cancelada', async () => {
    const mockRes = { id:3, estado: 'cancelado' };
    repo.cancel.mockResolvedValue(mockRes);

    const req = { params: { id: '3' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await cancelReservation(req, res);

    expect(repo.cancel).toHaveBeenCalledWith('3');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Reserva cancelada con éxito.",
      data:    mockRes
    });
  });

  it('not found: repo.cancel devuelve null → 404', async () => {
    repo.cancel.mockResolvedValue(null);

    const req = { params: { id: '4' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await cancelReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Reserva no encontrada."
    });
  });

  it('internal error: repo.cancel lanza excepción → 500', async () => {
    repo.cancel.mockRejectedValue(new Error('Crash'));

    const req = { params: { id: '2' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await cancelReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al cancelar la reserva.",
      error:   "Crash"
    });
  });
});

describe('GET /users/:id/reservations — getReservationsByUser', () => {
  it('happy path: retorna lista de reservas (200)', async () => {
    const list = [{ id:11 }, { id:12 }];
    repo.getByClienteId.mockResolvedValue(list);

    const req = { params: { id: '11' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getReservationsByUser(req, res);

    expect(repo.getByClienteId).toHaveBeenCalledWith('11');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: list });
  });

  it('lista vacía → 200 con data=[]', async () => {
    repo.getByClienteId.mockResolvedValue([]);

    const req = { params: { id: '99' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getReservationsByUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it('internal error → 500', async () => {
    repo.getByClienteId.mockRejectedValue(new Error('Fail user'));

    const req = { params: { id: '5' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getReservationsByUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al obtener reservas del usuario.",
      error:   "Fail user"
    });
  });
});

describe('GET /restaurants/:id/reservations — getReservationsByRestaurant', () => {
  it('happy path: retorna lista de reservas (200)', async () => {
    const list = [{ id:21 }];
    repo.getByRestauranteId.mockResolvedValue(list);

    const req = { params: { id: '21' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getReservationsByRestaurant(req, res);

    expect(repo.getByRestauranteId).toHaveBeenCalledWith('21');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: list });
  });

  it('lista vacía → 200 con data=[]', async () => {
    repo.getByRestauranteId.mockResolvedValue([]);

    const req = { params: { id: '22' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getReservationsByRestaurant(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it('internal error → 500', async () => {
    repo.getByRestauranteId.mockRejectedValue(new Error('Fail rest'));

    const req = { params: { id: '7' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getReservationsByRestaurant(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al obtener reservas del restaurante.",
      error:   "Fail rest"
    });
  });
});
