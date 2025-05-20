let repo;

if (process.env.DB_ENGINE === 'mongodb') {
  repo = await import('./usuariosRepository.mongo.js').then(mod => mod.default);
} else {
  repo = await import('./usuariosRepository.pg.js').then(mod => mod.default);
}

export default repo;
