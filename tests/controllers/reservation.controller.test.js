// tests/controllers/reservation.controller.test.js
import { jest } from '@jest/globals';

let createReservation;
let repo;

beforeAll(async () => {
  // 1) Mock del repositorio de reservas antes de importar el controller
  await jest.unstable_mockModule(
    '../../src/repositories/reservasRepository.js',
    () => ({
      __esModule: true,
      default: { create: jest.fn() }
    })
  );

  // 2) Importar el controller y el repo ya mockeados
  const controllerMod = await import('../../src/controllers/reservation.controller.js'); 
  createReservation   = controllerMod.createReservation;
  repo                = (await import('../../src/repositories/reservasRepository.js')).default;
});

describe('createReservation (happy path)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver 201 y la reserva creada', async () => {
    // a) Preparar el mock de repo.create
    const mockReserva = {
      id: 1,
      id_cliente: 10,
      id_restaurante: 20,
      fecha: '2025-05-20',
      numero_personas: 4
    };
    repo.create.mockResolvedValue(mockReserva);

    // b) Simular req/res de Express
    const req = {
      body: { id_cliente: 10, id_restaurante: 20, fecha: '2025-05-20', numero_personas: 4 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // c) Ejecutar el controller
    await createReservation(req, res);

    // d) Verificar llamadas y respuesta
    expect(repo.create).toHaveBeenCalledWith({
      id_cliente:     10,
      id_restaurante: 20,
      fecha:          '2025-05-20',
      numero_personas:4
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Reserva creada con éxito.",
      data:    mockReserva
    });
  });
});
