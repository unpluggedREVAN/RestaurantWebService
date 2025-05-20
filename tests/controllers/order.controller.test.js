import { jest } from '@jest/globals';

// 1) Mock del repositorio de pedidos ANTES de cargar el controlador
await jest.unstable_mockModule(
  '../../src/repositories/pedidosRepository.js',
  () => ({
    __esModule: true,
    default: {
      create: jest.fn()
    }
  })
);

// 2) Importar módulo ya mockeado
const repo = (await import('../../src/repositories/pedidosRepository.js')).default;
const { createOrder } = await import('../../src/controllers/order.controller.js'); // :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

describe('createOrder (unitario, sólo happy path)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver 201 y el pedido creado', async () => {
    // a) Preparar mock de repo.create
    const mockOrder = {
      id: 10,
      id_cliente: 5,
      id_restaurante: 2,
      id_reserva: null
    };
    repo.create.mockResolvedValue(mockOrder);

    // b) Simular req/res de Express
    const req = {
      body: {
        id_cliente: 5,
        id_restaurante: 2
        // id_reserva lo dejamos undefined para que el controller lo ponga a null
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // c) Ejecutar el controlador
    await createOrder(req, res);

    // d) Verificar:
    //    - se llama a repo.create con los datos correctos
    expect(repo.create).toHaveBeenCalledWith({
      id_cliente:     5,
      id_restaurante: 2,
      id_reserva:     null
    });
    //    - se devuelve status 201 y el body esperado
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Pedido creado exitosamente.",
      data:    mockOrder
    });
  });
});
