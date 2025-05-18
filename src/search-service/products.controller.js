import esClient from './elastic.js';
import axios from 'axios';

// GET /search/products?q=texto
export const buscarProductos = async (req, res) => {
  const { q } = req.query;

  try {
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

    res.json({
      results: body.hits.hits.map((h) => h._source)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /search/products/category/:categoria
export const buscarPorCategoria = async (req, res) => {
  const { categoria } = req.params;

  try {
    const { body } = await esClient.search({
      index: 'productos',
      body: {
        query: {
          match: { categoria }
        }
      }
    });

    res.json({
      results: body.hits.hits.map((h) => h._source)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
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
