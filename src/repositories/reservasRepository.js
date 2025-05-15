let repo;

if (process.env.DB_ENGINE === 'mongodb') {
  repo = await import('./reservasRepository.mongo.js').then(mod => mod.default);
} else {
  repo = await import('./reservasRepository.pg.js').then(mod => mod.default);
}

export default repo;
