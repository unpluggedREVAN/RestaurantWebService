-- Tabla de Usuarios
CREATE TABLE usuarios (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  tipo_usuario TEXT CHECK (tipo_usuario IN ('administrador', 'cliente')) NOT NULL
);

-- Tabla de Restaurantes
CREATE TABLE restaurantes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT NOT NULL,
  id_administrador BIGINT NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE
);

-- Tabla de Menús
CREATE TABLE menus (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_restaurante BIGINT NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  nombre TEXT NOT NULL
);

-- Tabla de Platos
CREATE TABLE platos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_menu BIGINT NOT NULL REFERENCES menus (id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio NUMERIC(10,2) NOT NULL
);

-- Tabla de Reservas
CREATE TABLE reservas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_cliente BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_restaurante BIGINT NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  fecha TIMESTAMP NOT NULL,
  numero_personas INT NOT NULL,
  estado TEXT CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')) NOT NULL
);

-- Tabla de Pedidos
CREATE TABLE pedidos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  id_cliente BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_restaurante BIGINT NOT NULL REFERENCES restaurantes (id) ON DELETE CASCADE,
  id_reserva BIGINT REFERENCES reservas (id) ON DELETE SET NULL,
  fecha TIMESTAMP NOT NULL,
  estado TEXT CHECK (estado IN ('pendiente', 'preparando', 'completado', 'cancelado')) NOT NULL
);

-- Índices
CREATE INDEX idx_restaurantes_administrador ON restaurantes USING btree (id_administrador);
CREATE INDEX idx_reservas_cliente ON reservas USING btree (id_cliente);
CREATE INDEX idx_pedidos_cliente ON pedidos USING btree (id_cliente);

-- Insertar usuarios
INSERT INTO usuarios (nombre, correo, tipo_usuario) VALUES
  ('Ana Admin', 'ana.admin@example.com', 'administrador'),
  ('Carlos Cliente', 'carlos.cliente@example.com', 'cliente'),
  ('Lucía Cliente', 'lucia.cliente@example.com', 'cliente'),
  ('Miguel Morales', 'miguel.m@example.com', 'cliente'),
  ('Sandra Soto', 'sandra.s@example.com', 'cliente'),
  ('Javier Jiménez', 'javier.j@example.com', 'cliente'),
  ('Patricia Pérez', 'patricia.p@example.com', 'cliente'),
  ('Luis López', 'luis.l@example.com', 'cliente'),
  ('Natalia Navas', 'natalia.n@example.com', 'cliente'),
  ('Bruno Bravo', 'bruno.b@example.com', 'cliente');

-- Insertar restaurantes (todos administrados por Ana)
INSERT INTO restaurantes (nombre, direccion, telefono, id_administrador) VALUES
  ('Restaurante Sabores', 'Calle Falsa 123', '555-1234', 1),
  ('Burgers & Beer', 'Av. Central 321', '555-5678', 1),
  ('Pizzería Italiana', 'Calle Roma 22', '555-4444', 1);

-- Insertar menús para los restaurantes
INSERT INTO menus (id_restaurante, nombre) VALUES
  (1, 'Menú del Día'),
  (1, 'Menú Vegano'),
  (2, 'Menú Hamburguesas'),
  (3, 'Menú Pizzas'),
  (3, 'Menú Postres');

-- Insertar platos
INSERT INTO platos (id_menu, nombre, precio) VALUES
  (1, 'Ensalada César', 5.99),
  (1, 'Pasta Alfredo', 8.99),
  (1, 'Tarta de Queso', 4.50),
  (2, 'Hamburguesa Vegana', 9.99),
  (2, 'Tacos de Soya', 7.50),
  (3, 'Doble Cheeseburger', 10.50),
  (3, 'Aros de Cebolla', 4.25),
  (3, 'Papas Fritas', 3.75),
  (4, 'Pizza Margarita', 7.99),
  (4, 'Pizza Pepperoni', 8.99),
  (5, 'Tiramisú', 5.50),
  (5, 'Helado de Vainilla', 3.99),
  (5, 'Brownie con Helado', 6.25);

-- Insertar reservas (varios clientes)
INSERT INTO reservas (id_cliente, id_restaurante, fecha, numero_personas, estado) VALUES
  (2, 1, '2025-03-28 13:00:00', 2, 'pendiente'),
  (3, 1, '2025-03-28 15:00:00', 4, 'confirmada'),
  (4, 2, '2025-03-29 12:00:00', 3, 'pendiente'),
  (5, 2, '2025-03-29 20:00:00', 5, 'cancelada'),
  (6, 3, '2025-03-30 18:00:00', 2, 'confirmada');

-- Insertar pedidos
INSERT INTO pedidos (id_cliente, id_restaurante, id_reserva, fecha, estado) VALUES
  (2, 1, 1, '2025-03-28 13:10:00', 'pendiente'),
  (3, 1, 2, '2025-03-28 15:05:00', 'completado'),
  (4, 2, 3, '2025-03-29 12:15:00', 'pendiente'),
  (5, 2, NULL, '2025-03-29 20:15:00', 'cancelado'),
  (6, 3, 5, '2025-03-30 18:30:00', 'completado'),
  (7, 3, NULL, '2025-03-31 19:00:00', 'pendiente'),
  (8, 1, NULL, '2025-04-01 14:00:00', 'pendiente');
