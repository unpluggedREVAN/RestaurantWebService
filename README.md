# TC 1: Resturantes Rest-API

## Proyecto - Trabajo Corto 1 - Base de Datos II  
**Autores:** Sebastián Chacón y Pablo Agüero  
**Profesor:** Kenneth Obando  
**Fecha de entrega:** 28 de marzo, 2025

---

## Descripción General

Este proyecto consiste en una API REST para la gestión de usuarios, restaurantes, menús, reservas y pedidos, desarrollada en Node.js con PostgreSQL y contenedorizada usando Docker. Se implementó **Keycloak** como sistema de autenticación (servicio externo por contenedor) y se organizaron todos los servicios mediante `docker-compose`.

A pesar de múltiples intentos de integración, **Keycloak presentó conflictos internos con la validación de tokens (issuer y audience)** que no pudieron resolverse completamente. Sin embargo, el resto del sistema funciona cuando se omite la validación estricta de JWT en `verifyToken`.

---

## Autenticación (Keycloak)

> **Problema actual:**  
Keycloak emite el token correctamente, pero la validación estricta de `issuer` y `audience` lanza errores en `verifyToken`.  
Se modificó temporalmente el middleware para **permitir pruebas** y así validar el funcionamiento del resto del sistema.

**Endpoints esperados:**

| Método | Endpoint             | Descripción                        |
|--------|----------------------|------------------------------------|
| POST   | /auth/register       | Registro de usuario                |
| POST   | /auth/login          | Login y obtención de token JWT     |
| GET    | /users/me            | Obtener perfil autenticado         |
| PUT    | /users/:id           | Actualizar usuario                 |
| DELETE | /users/:id           | Eliminar usuario                   |

---

## Docker y Orquestación

El archivo `docker-compose.yml` define:

- `db` (PostgreSQL)
- `auth` (Keycloak)
- `app` (API Node.js)
- `postman` (para pruebas internas por los mismos problemas que se mencionan antes)

> Se probó acceso entre contenedores mediante la red `restaurant_net`.

---

## Pruebas Unitarias

Se desarrollaron pruebas unitarias con **Jest** para los controladores y rutas principales del sistema. En total se ejecutaron **39 pruebas**, de las cuales **20 fueron exitosas**.

La cobertura general fue:

- **Statements:** 81.5%  
- **Funciones:** 72.2%  
- **Líneas:** 81.5%  
- **Branches:** 54.4%

Algunas pruebas no se ejecutaron correctamente debido a restricciones con la validación de tokens durante el testeo automatizado, pero el sistema funciona correctamente en ejecución manual.

---

## Cómo Probar

1. Levantar el sistema:
   ```bash
   docker compose up --build
   ```

2. Entrar al contenedor de Postman para probar:
- `https://localhost:6901`
- `Usuario: kasm_user`
- `Contraseña: postman`

3. Probar endpoints REST usando tokens JWT si se desactiva el issuer o simplemente comentar la validación del token para hacer pruebas funcionales.

---

## Link del video

- https://youtu.be/tp7VEFcRYfs