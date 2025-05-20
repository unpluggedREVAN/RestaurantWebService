import express from 'express';
import {
  buscarProductos,
  buscarPorCategoria,
  reindexarProductos
} from './products.controller.js';

const router = express.Router();

router.get('/search/products', buscarProductos);
router.get('/search/products/category/:categoria', buscarPorCategoria);
router.post('/search/reindex', reindexarProductos);

export default router;
