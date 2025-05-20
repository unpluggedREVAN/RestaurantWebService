let repo;

if (process.env.DB_ENGINE === 'mongodb') {
  repo = await import('./restaurantesRepository.mongo.js').then(mod => mod.default);
} else {
  repo = await import('./restaurantesRepository.pg.js').then(mod => mod.default);
}

export default repo;
