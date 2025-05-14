import { Router } from 'express';
import {
  crearMenu,
  getMenuId,
  actualizarMenu,
  eliminarMenu,
  getMenus_RestauranteId
} from '../controllers/menu.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    Menu:
 *      type: object
 *      required:
 *        - nombre
 *        - restaurante_id
 *      properties:
 *        id:
 *          type: integer
 *          description: ID único del menú
 *        nombre:
 *          type: string
 *          description: Nombre del menú
 *        descripcion:
 *          type: string
 *          description: Descripción del menú
 *        restaurante_id:
 *          type: integer
 *          description: ID del restaurante al que pertenece
 *      example:
 *        id: 1
 *        nombre: Menú Almuerzo
 *        descripcion: Menú disponible de 12:00 a 15:00
 *        restaurante_id: 2
 */

/**
 * @swagger
 * /menus:
 *  post:
 *    summary: Crear un nuevo menú
 *    tags: [Menus]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Menu'
 *    responses:
 *      201:
 *        description: Menú creado correctamente
 */
router.post('/menus', crearMenu);

/**
 * @swagger
 * /menus/{id}:
 *  get:
 *    summary: Obtener un menú por ID
 *    tags: [Menus]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del menú
 *    responses:
 *      200:
 *        description: Detalles del menú
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Menu'
 *      404:
 *        description: Menú no encontrado
 */
router.get('/menus/:id', getMenuId);

/**
 * @swagger
 * /menus/{id}:
 *  put:
 *    summary: Actualizar un menú
 *    tags: [Menus]
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
 *            $ref: '#/components/schemas/Menu'
 *    responses:
 *      200:
 *        description: Menú actualizado correctamente
 *      404:
 *        description: Menú no encontrado
 */
router.put('/menus/:id', actualizarMenu);

/**
 * @swagger
 * /menus/{id}:
 *  delete:
 *    summary: Eliminar un menú
 *    tags: [Menus]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del menú
 *    responses:
 *      204:
 *        description: Menú eliminado correctamente
 *      404:
 *        description: Menú no encontrado
 */
router.delete('/menus/:id', eliminarMenu);

/**
 * @swagger
 * /restaurants/{id}/menus:
 *  get:
 *    summary: Obtener todos los menús de un restaurante
 *    tags: [Menus]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID del restaurante
 *    responses:
 *      200:
 *        description: Lista de menús del restaurante
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Menu'
 */
router.get('/restaurants/:id/menus', getMenus_RestauranteId);
export default router;
