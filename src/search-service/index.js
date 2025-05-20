import express from 'express';
import productRoutes from './products.routes.js';

const app = express();
app.use(express.json());
app.use('/', productRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Microservicio de búsqueda activo en http://localhost:${PORT}`);
});
