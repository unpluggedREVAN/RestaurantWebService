import repo from '../repositories/pedidosRepository.js';

// POST /orders
export const createOrder = async (req, res) => {
  const { id_cliente, id_restaurante, id_reserva } = req.body;

  if (!id_cliente || !id_restaurante) {
    return res.status(400).json({ message: "id_cliente e id_restaurante son obligatorios." });
  }

  try {
    const nuevo = await repo.create({
      id_cliente,
      id_restaurante,
      id_reserva: id_reserva || null
    });

    res.status(201).json({ message: "Pedido creado exitosamente.", data: nuevo });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el pedido.", error: error.message });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await repo.getById(id);

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    res.status(200).json({ data: pedido });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el pedido.", error: error.message });
  }
};

// GET /users/:id/orders
export const getOrdersByUser = async (req, res) => {
  const { id } = req.params;

  try {
    const pedidos = await repo.getByClienteId(id);
    res.status(200).json({ data: pedidos });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos del usuario.", error: error.message });
  }
};

// GET /restaurants/:id/orders
export const getOrdersByRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const pedidos = await repo.getByRestauranteId(id);
    res.status(200).json({ data: pedidos });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos del restaurante.", error: error.message });
  }
};

// PUT /orders/:id
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['pendiente', 'preparando', 'completado', 'cancelado'];
  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ message: "Estado inválido." });
  }

  try {
    const pedido = await repo.getById(id);
    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    const actualizado = await repo.updateEstado(id, estado);

    res.status(200).json({ message: "Estado actualizado.", data: actualizado });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el pedido.", error: error.message });
  }
};

// DELETE /orders/:id
export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await repo.getById(id);
    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    await repo.remove(id);
    res.status(200).json({ message: "Pedido eliminado con éxito." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el pedido.", error: error.message });
  }
};
