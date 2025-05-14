import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getOrdersByRestaurant,
  updateOrderStatus,
  deleteOrder
} from '../controllers/order.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    Orden:
 *      type: object
 *      required:
 *        - usuario_id
 *        - restaurante_id
 *        - platos
 *        - estado
 *      properties:
 *        id:
 *          type: integer
 *          description: ID único de la orden
 *        usuario_id:
 *          type: integer
 *          description: ID del usuario que realizó la orden
 *        restaurante_id:
 *          type: integer
 *          description: ID del restaurante donde se realiza la orden
 *        platos:
 *          type: array
 *          description: Lista de IDs de platos en la orden
 *          items:
 *            type: integer
 *        estado:
 *          type: string
 *          description: "Estado actual de la orden (ej: pendiente, en preparación, entregada)"
 *      example:
 *        id: 1
 *        usuario_id: 3
 *        restaurante_id: 2
 *        platos: [5, 6, 9]
 *        estado: pendiente
 */

/**
 * @swagger
 * /orders:
 *  post:
 *    summary: Crear una nueva orden
 *    tags: [Orders]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Orden'
 *    responses:
 *      201:
 *        description: Orden creada exitosamente
 */
router.post('/orders', createOrder);

/**
 * @swagger
 * /orders/{id}:
 *  get:
 *    summary: Obtener una orden por ID
 *    tags: [Orders]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID de la orden
 *    responses:
 *      200:
 *        description: Detalles de la orden
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Orden'
 *      404:
 *        description: Orden no encontrada
 */
router.get('/orders/:id', getOrderById);

/**
 * @swagger
 * /users/{id}/orders:
 *  get:
 *    summary: Obtener todas las órdenes de un usuario
 *    tags: [Orders]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del usuario
 *    responses:
 *      200:
 *        description: Lista de órdenes del usuario
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Orden'
 */
router.get('/users/:id/orders', getOrdersByUser);

/**
 * @swagger
 * /restaurants/{id}/orders:
 *  get:
 *    summary: Obtener todas las órdenes de un restaurante
 *    tags: [Orders]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del restaurante
 *    responses:
 *      200:
 *        description: Lista de órdenes del restaurante
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Orden'
 */
router.get('/restaurants/:id/orders', getOrdersByRestaurant);

/**
 * @swagger
 * /orders/{id}:
 *  put:
 *    summary: Actualizar el estado de una orden
 *    tags: [Orders]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID de la orden
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              estado:
 *                type: string
 *                example: entregada
 *    responses:
 *      200:
 *        description: Estado de la orden actualizado
 *      404:
 *        description: Orden no encontrada
 */
router.put('/orders/:id', updateOrderStatus);

/**
 * @swagger
 * /orders/{id}:
 *  delete:
 *    summary: Eliminar una orden
 *    tags: [Orders]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID de la orden
 *    responses:
 *      204:
 *        description: Orden eliminada correctamente
 *      404:
 *        description: Orden no encontrada
 */
router.delete('/orders/:id', deleteOrder);

export default router;
