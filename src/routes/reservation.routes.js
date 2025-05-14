import { Router } from 'express';
import {
  createReservation,
  getReservationById,
  cancelReservation,
  getReservationsByUser,
  getReservationsByRestaurant
} from '../controllers/reservation.controller.js';

const router = Router();

// aquí el orden sí importa para evitar colisiones
/**
 * @swagger
 * components:
 *  schemas:
 *    Reservation:
 *      type: object
 *      required:
 *        - usuario_id
 *        - restaurante_id
 *        - fecha
 *        - hora
 *        - cantidad_personas
 *      properties:
 *        id:
 *          type: integer
 *          description: ID único de la reservación
 *        usuario_id:
 *          type: integer
 *          description: ID del usuario que hace la reservación
 *        restaurante_id:
 *          type: integer
 *          description: ID del restaurante donde se hace la reservación
 *        fecha:
 *          type: string
 *          format: date
 *          description: Fecha de la reservación (YYYY-MM-DD)
 *        hora:
 *          type: string
 *          format: time
 *          description: Hora de la reservación (HH:MM)
 *        cantidad_personas:
 *          type: integer
 *          description: Número de personas para la reservación
 *      example:
 *        id: 1
 *        usuario_id: 5
 *        restaurante_id: 2
 *        fecha: "2025-03-30"
 *        hora: "19:30"
 *        cantidad_personas: 4
 */

/**
 * @swagger
 * /reservations:
 *  post:
 *    summary: Crear una nueva reservación
 *    tags: [Reservations]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Reservation'
 *    responses:
 *      201:
 *        description: Reservación creada exitosamente
 */
router.post('/reservations', createReservation);

/**
 * @swagger
 * /reservations/user/{id}:
 *  get:
 *    summary: Obtener reservaciones por ID de usuario
 *    tags: [Reservations]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del usuario
 *    responses:
 *      200:
 *        description: Lista de reservaciones del usuario
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Reservation'
 */
router.get('/reservations/user/:id', getReservationsByUser);

/**
 * @swagger
 * /reservations/restaurant/{id}:
 *  get:
 *    summary: Obtener reservaciones por ID de restaurante
 *    tags: [Reservations]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del restaurante
 *    responses:
 *      200:
 *        description: Lista de reservaciones del restaurante
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Reservation'
 */
router.get('/reservations/restaurant/:id', getReservationsByRestaurant);

/**
 * @swagger
 * /reservations/{id}:
 *  get:
 *    summary: Obtener una reservación por ID
 *    tags: [Reservations]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID de la reservación
 *    responses:
 *      200:
 *        description: Reservación encontrada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Reservation'
 *      404:
 *        description: Reservación no encontrada
 */
router.get('/reservations/:id', getReservationById);

/**
 * @swagger
 * /reservations/{id}:
 *  delete:
 *    summary: Cancelar (eliminar) una reservación
 *    tags: [Reservations]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID de la reservación
 *    responses:
 *      204:
 *        description: Reservación cancelada exitosamente
 *      404:
 *        description: Reservación no encontrada
 */
router.delete('/reservations/:id', cancelReservation);

export default router;