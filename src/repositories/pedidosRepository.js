let repo;

if (process.env.DB_ENGINE === 'mongodb') {
  repo = await import('./pedidosRepository.mongo.js').then(mod => mod.default);
} else {
  repo = await import('./pedidosRepository.pg.js').then(mod => mod.default);
}

export default repo;
