let repo;

if (process.env.DB_ENGINE === 'mongodb') {
  repo = await import('./menusRepository.mongo.js').then(mod => mod.default);
} else {
  repo = await import('./menusRepository.pg.js').then(mod => mod.default);
}

export default repo;
