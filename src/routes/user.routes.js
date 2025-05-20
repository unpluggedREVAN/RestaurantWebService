import { Router } from 'express';
import {
  getUsuarios,
  getUsuarioById,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/user.controller.js';
//import { getReservationsByUser } from '../controllers/user.controller.js';
//import { getReservationsByRestaurant } from '../controllers/restaurante.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - nombre
 *        - correo
 *      properties:
 *        id:
 *          type: integer
 *          description: Identificador único del usuario
 *        nombre:
 *          type: string
 *          description: Nombre del usuario
 *        correo:
 *          type: string
 *          description: Correo electrónico del usuario
 *      example:
 *        id: 1
 *        nombre: Juan
 *        correo: juan@gmail.com
 */

/**
 * @swagger
 * /users:
 *  get:
 *    summary: Obtener todos los usuarios
 *    tags: [Users]
 *    responses:
 *      200:
 *        description: Lista de usuarios
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 */
router.get('/users', getUsuarios);

/**
 * @swagger
 * /users/{id}:
 *  get:
 *    summary: Obtener un usuario por ID
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: ID del usuario
 *    responses:
 *      200:
 *        description: Usuario encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      404:
 *        description: Usuario no encontrado
 */
router.get('/users/:id', getUsuarioById);

/**
 * @swagger
 * /users:
 *  post:
 *    summary: Crear un nuevo usuario
 *    tags: [Users]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      201:
 *        description: Usuario creado correctamente
 */
router.post('/users', crearUsuario);

/**
 * @swagger
 * /users/{id}:
 *  put:
 *    summary: Actualizar un usuario existente
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: ID del usuario
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: Usuario actualizado
 *      404:
 *        description: Usuario no encontrado
 */
router.put('/users/:id', actualizarUsuario);

/**
 * @swagger
 * /users/{id}:
 *  delete:
 *    summary: Eliminar un usuario
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: ID del usuario
 *    responses:
 *      204:
 *        description: Usuario eliminado exitosamente
 *      404:
 *        description: Usuario no encontrado
 */
router.delete('/users/:id', eliminarUsuario);
//router.get('/users/:id/reservations', getReservationsByUser); //Nuevo, se tiene que documentar
//router.get('/restaurants/:id/reservations', getReservationsByRestaurant);

export default router;
