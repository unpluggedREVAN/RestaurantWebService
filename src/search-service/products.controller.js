import esClient from './elastic.js';
import axios from 'axios';
import redisClient from './config/redis.js';

// GET /search/products?q=texto
export const buscarProductos = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ status: 'error', message: 'Falta el parámetro q' });
  }

  const cacheKey = `search:q:${q.toLowerCase()}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        message: 'Resultado desde caché',
        results: JSON.parse(cached)
      });
    }

    const { body } = await esClient.search({
      index: 'productos',
      body: {
        query: {
          multi_match: {
            query: q,
            fields: ['nombre', 'descripcion', 'categoria']
          }
        }
      }
    });

    const results = body.hits.hits.map((h) => h._source);

    await redisClient.setEx(cacheKey, 300, JSON.stringify(results)); // TTL: 5 minutos

    res.status(200).json({
      status: 'success',
      message: 'Resultado desde ElasticSearch',
      results
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /search/products/category/:categoria
export const buscarPorCategoria = async (req, res) => {
  const { categoria } = req.params;

  const cacheKey = `search:cat:${categoria.toLowerCase()}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: 'success',
        message: 'Resultado desde caché',
        results: JSON.parse(cached)
      });
    }

    const { body } = await esClient.search({
      index: 'productos',
      body: {
        query: {
          match: { categoria }
        }
      }
    });

    const results = body.hits.hits.map((h) => h._source);

    await redisClient.setEx(cacheKey, 300, JSON.stringify(results));

    res.status(200).json({
      status: 'success',
      message: 'Resultado desde ElasticSearch',
      results
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /search/reindex
export const reindexarProductos = async (req, res) => {
  try {
    const { data } = await axios.get('http://app1:3000/platos');

    for (const producto of data.data) {
      await esClient.index({
        index: 'productos',
        id: producto._id || producto.id,
        body: {
          nombre: producto.nombre,
          descripcion: producto.descripcion || 'Producto sin descripción',
          categoria: producto.categoria || 'Sin categoría'
        }
      });
    }

    res.json({ status: 'success', message: 'Reindexación completada.' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
