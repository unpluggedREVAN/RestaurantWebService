import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

import { PORT } from './config.js';
import connectMongo from './config/mongo.js';

// Rutas de negocio
import userRoutes from './routes/user.routes.js';
import menuRoutes from './routes/menu.routes.js';
import orderRoutes from './routes/order.routes.js';
import platoRoutes from './routes/plato.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import restauranteRoutes from './routes/restaurante.routes.js';

// import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();

// config swagger
const swaggerSpec = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "REST API para un restaurante",
      version: "1.0.0",
      description: "Una REST API para un servicio de restaurantes usando PostgreSQL y Express"
    },
    servers: [
      {
        url: "http://localhost:3000" 
      }
    ]
  },
  apis: ["./src/routes/*.js"]
};

// Middlewares generales
app.use(morgan('dev'));
app.use(express.json());

// Sesión y Keycloak desactivados
// import session from 'express-session';
// import { keycloak, memoryStore } from './middlewares/keycloak-config.js';
// app.use(session({
//   secret: 'clave',
//   resave: false,
//   saveUninitialized: true,
//   store: memoryStore
// }));
// app.use(keycloak.middleware({
//   logout: '/logout',
//   admin: '/'
// }));

// Rutas protegidas desactivadas temporalmente
// app.use('/auth', authRoutes); 

// Rutas de negocio
app.use(userRoutes);
app.use(menuRoutes);
app.use(orderRoutes);
app.use(platoRoutes);
app.use(reservationRoutes);
app.use(restauranteRoutes);

// Ruta de documentación
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSDoc(swaggerSpec)));

// manejo de errores - middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  console.error("Error completo:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

export default app;

// inicia
if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      await connectMongo();
      console.log("MongoDB conectado");
      console.log("Instancia activa en puerto:", PORT);
      app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("No se pudo iniciar el servidor:", error.message);
      process.exit(1);
    }
  };

  startServer();
}
