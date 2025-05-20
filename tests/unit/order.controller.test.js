import { jest } from '@jest/globals';

let createOrder;
let getOrderById;
let getOrdersByUser;
let getOrdersByRestaurant;
let updateOrderStatus;
let deleteOrder;
let repo;

beforeAll(async () => {
  // 1) Mockeamos el repositorio de pedidos ANTES de importar el controller
  await jest.unstable_mockModule(
    '../../src/repositories/pedidosRepository.js',
    () => ({
      __esModule: true,
      default: {
        create:            jest.fn(),
        getById:           jest.fn(),
        getByClienteId:    jest.fn(),
        getByRestauranteId: jest.fn(),
        updateEstado:      jest.fn(),
        remove:            jest.fn()
      }
    })
  );

  // 2) Importamos el repo y el controller ya mockeados
  const [repoMod, ctrlMod] = await Promise.all([
    import('../../src/repositories/pedidosRepository.js'),
    import('../../src/controllers/order.controller.js')
  ]);

  repo                 = repoMod.default;
  createOrder          = ctrlMod.createOrder;
  getOrderById         = ctrlMod.getOrderById;
  getOrdersByUser      = ctrlMod.getOrdersByUser;
  getOrdersByRestaurant= ctrlMod.getOrdersByRestaurant;
  updateOrderStatus    = ctrlMod.updateOrderStatus;
  deleteOrder          = ctrlMod.deleteOrder;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /orders — createOrder', () => {
  it('happy path: crea pedido y responde 201', async () => {
    const input = { id_cliente: 5, id_restaurante: 2, id_reserva: undefined };
    const mockOrder = { id: 10, id_cliente: 5, id_restaurante: 2, id_reserva: null };
    repo.create.mockResolvedValue(mockOrder);

    const req = { body: { id_cliente: 5, id_restaurante: 2 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createOrder(req, res);

    expect(repo.create).toHaveBeenCalledWith({
      id_cliente:     5,
      id_restaurante: 2,
      id_reserva:     null
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Pedido creado exitosamente.",
      data:    mockOrder
    });
  });

  it('validation error: faltan id_cliente o id_restaurante → 400', async () => {
    const req = { body: { id_cliente: 5 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "id_cliente e id_restaurante son obligatorios."
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('internal error: repo.create falla → 500', async () => {
    repo.create.mockRejectedValue(new Error('DB fail'));

    const req = { body: { id_cliente: 5, id_restaurante: 2 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al crear el pedido.",
      error:   "DB fail"
    });
  });
});

describe('GET /orders/:id — getOrderById', () => {
  it('happy path: devuelve pedido existente → 200', async () => {
    const mockOrder = { id: 7 };
    repo.getById.mockResolvedValue(mockOrder);

    const req = { params: { id: '7' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getOrderById(req, res);

    expect(repo.getById).toHaveBeenCalledWith('7');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: mockOrder });
  });

  it('not found: pedido inexistente → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params: { id: '9' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Pedido no encontrado."
    });
  });

  it('internal error: repo.getById falla → 500', async () => {
    repo.getById.mockRejectedValue(new Error('DB crash'));

    const req = { params: { id: '8' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al obtener el pedido.",
      error:   "DB crash"
    });
  });
});

describe('GET /users/:id/orders — getOrdersByUser', () => {
  it('happy path: lista de pedidos → 200', async () => {
    const list = [{ id: 1 }, { id: 2 }];
    repo.getByClienteId.mockResolvedValue(list);

    const req = { params: { id: '5' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getOrdersByUser(req, res);

    expect(repo.getByClienteId).toHaveBeenCalledWith('5');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: list });
  });

  it('empty path: lista vacía → 200 con data=[]', async () => {
    repo.getByClienteId.mockResolvedValue([]);

    const req = { params: { id: '99' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getOrdersByUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it('internal error: repo.getByClienteId falla → 500', async () => {
    repo.getByClienteId.mockRejectedValue(new Error('Fail user'));

    const req = { params: { id: '5' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getOrdersByUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al obtener pedidos del usuario.",
      error:   "Fail user"
    });
  });
});

describe('GET /restaurants/:id/orders — getOrdersByRestaurant', () => {
  it('happy path: lista de pedidos → 200', async () => {
    const list = [{ id: 3 }];
    repo.getByRestauranteId.mockResolvedValue(list);

    const req = { params: { id: '2' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getOrdersByRestaurant(req, res);

    expect(repo.getByRestauranteId).toHaveBeenCalledWith('2');
    expect(res.json).toHaveBeenCalledWith({ data: list });
  });

  it('empty path: lista vacía → 200 con data=[]', async () => {
    repo.getByRestauranteId.mockResolvedValue([]);

    const req = { params: { id: '2' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getOrdersByRestaurant(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it('internal error: repo.getByRestauranteId falla → 500', async () => {
    repo.getByRestauranteId.mockRejectedValue(new Error('Fail rest'));

    const req = { params: { id: '2' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getOrdersByRestaurant(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al obtener pedidos del restaurante.",
      error:   "Fail rest"
    });
  });
});

describe('PUT /orders/:id — updateOrderStatus', () => {
  it('validation error: estado inválido → 400', async () => {
    const req = { params: { id: '1' }, body: { estado: 'voz' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Estado inválido." });
  });

  it('not found: pedido inexistente → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params: { id: '1' }, body: { estado: 'pendiente' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pedido no encontrado." });
  });

  it('happy path: estado válido y existe → 200', async () => {
    const id = '2';
    const updated = { id: 2, estado: 'completado' };
    repo.getById.mockResolvedValue({ id });
    repo.updateEstado.mockResolvedValue(updated);

    const req = { params: { id }, body: { estado: 'completado' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateOrderStatus(req, res);

    expect(repo.updateEstado).toHaveBeenCalledWith(id, 'completado');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Estado actualizado.",
      data:    updated
    });
  });
});

describe('DELETE /orders/:id — deleteOrder', () => {
  it('not found: pedido inexistente → 404', async () => {
    repo.getById.mockResolvedValue(null);

    const req = { params: { id: '3' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await deleteOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pedido no encontrado." });
  });

  it('happy path: elimina pedido → 200', async () => {
    const id = '4';
    repo.getById.mockResolvedValue({ id });
    repo.remove.mockResolvedValue();

    const req = { params: { id } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await deleteOrder(req, res);

    expect(repo.remove).toHaveBeenCalledWith(id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Pedido eliminado con éxito." });
  });

  it('internal error: repo.remove falla → 500', async () => {
    repo.getById.mockResolvedValue({ id: '5' });
    repo.remove.mockRejectedValue(new Error('fail del'));

    const req = { params: { id: '5' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await deleteOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al eliminar el pedido.",
      error:   "fail del"
    });
  });
});
