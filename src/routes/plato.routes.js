import { Router } from 'express';
import {
  crearPlato,
  getPlatoId,
  actualizarPlato,
  eliminarPlato,
  getPlatosByMenu
} from '../controllers/plato.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    Plato:
 *      type: object
 *      required:
 *        - nombre
 *        - precio
 *        - menu_id
 *      properties:
 *        id:
 *          type: integer
 *          description: ID único del plato
 *        nombre:
 *          type: string
 *          description: Nombre del plato
 *        descripcion:
 *          type: string
 *          description: Descripción del plato
 *        precio:
 *          type: number
 *          format: float
 *          description: Precio del plato
 *        menu_id:
 *          type: integer
 *          description: ID del menú al que pertenece el plato
 *      example:
 *        id: 1
 *        nombre: Pasta Carbonara
 *        descripcion: Pasta con salsa cremosa y bacon
 *        precio: 12.99
 *        menu_id: 3
 */

/**
 * @swagger
 * /menus/{id}/platos:
 *  post:
 *    summary: Crear un nuevo plato para un menú específico
 *    tags: [Platos]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del menú
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Plato'
 *    responses:
 *      201:
 *        description: Plato creado correctamente
 */
router.post('/menus/:id/platos', crearPlato);

/**
 * @swagger
 * /platos/{id}:
 *  get:
 *    summary: Obtener un plato por ID
 *    tags: [Platos]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del plato
 *    responses:
 *      200:
 *        description: Detalles del plato
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Plato'
 *      404:
 *        description: Plato no encontrado
 */
router.get('/platos/:id', getPlatoId);

/**
 * @swagger
 * /platos/{id}:
 *  put:
 *    summary: Actualizar un plato existente
 *    tags: [Platos]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del plato
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Plato'
 *    responses:
 *      200:
 *        description: Plato actualizado correctamente
 *      404:
 *        description: Plato no encontrado
 */
router.put('/platos/:id', actualizarPlato);

/**
 * @swagger
 * /platos/{id}:
 *  delete:
 *    summary: Eliminar un plato
 *    tags: [Platos]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del plato
 *    responses:
 *      204:
 *        description: Plato eliminado correctamente
 *      404:
 *        description: Plato no encontrado
 */
router.delete('/platos/:id', eliminarPlato);

/**
 * @swagger
 * /menus/{id}/platos:
 *  get:
 *    summary: Obtener todos los platos de un menú específico
 *    tags: [Platos]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del menú
 *    responses:
 *      200:
 *        description: Lista de platos
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Plato'
 */
router.get('/menus/:id/platos', getPlatosByMenu);

export default router;
