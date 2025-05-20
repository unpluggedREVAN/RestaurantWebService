let repo;

if (process.env.DB_ENGINE === 'mongodb') {
  repo = await import('./platosRepository.mongo.js').then(mod => mod.default);
} else {
  repo = await import('./platosRepository.pg.js').then(mod => mod.default);
}

export default repo;
