import { Router } from 'express';
import {
  getRestaurants,
  getRestaurantId,
  crearRestaurante,
  actualizarRestaurante,
  eliminarRestaurante
} from '../controllers/restaurante.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    Restaurante:
 *      type: object
 *      required:
 *        - nombre
 *        - direccion
 *      properties:
 *        id:
 *          type: integer
 *          description: ID único del restaurante
 *        nombre:
 *          type: string
 *          description: Nombre del restaurante
 *        direccion:
 *          type: string
 *          description: Dirección del restaurante
 *      example:
 *        id: 1
 *        nombre: Restaurante Don Mario
 *        direccion: Avenida Central #123
 */

/**
 * @swagger
 * /restaurants:
 *  get:
 *    summary: Obtener todos los restaurantes
 *    tags: [Restaurants]
 *    responses:
 *      200:
 *        description: Lista de restaurantes
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Restaurante'
 */
router.get('/restaurants', getRestaurants);

/**
 * @swagger
 * /restaurants/{id}:
 *  get:
 *    summary: Obtener un restaurante por ID
 *    tags: [Restaurants]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: ID del restaurante
 *    responses:
 *      200:
 *        description: Restaurante encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Restaurante'
 *      404:
 *        description: Restaurante no encontrado
 */
router.get('/restaurants/:id', getRestaurantId);

/**
 * @swagger
 * /restaurants:
 *  post:
 *    summary: Crear un nuevo restaurante
 *    tags: [Restaurants]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Restaurante'
 *    responses:
 *      201:
 *        description: Restaurante creado correctamente
 */
router.post('/restaurants', crearRestaurante);

/**
 * @swagger
 * /restaurants/{id}:
 *  put:
 *    summary: Actualizar un restaurante existente
 *    tags: [Restaurants]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: ID del restaurante
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Restaurante'
 *    responses:
 *      200:
 *        description: Restaurante actualizado correctamente
 *      404:
 *        description: Restaurante no encontrado
 */
router.put('/restaurants/:id', actualizarRestaurante);

/**
 * @swagger
 * /restaurants/{id}:
 *  delete:
 *    summary: Eliminar un restaurante
 *    tags: [Restaurants]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: ID del restaurante
 *    responses:
 *      204:
 *        description: Restaurante eliminado correctamente
 *      404:
 *        description: Restaurante no encontrado
 */
router.delete('/restaurants/:id', eliminarRestaurante);

export default router;
