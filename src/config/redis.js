// src/redis.js
import { createClient } from 'redis';

const redisClient = createClient({
  url: 'redis://redis:6379' // usa el nombre del servicio Redis del docker-compose
});

redisClient.on('error', (err) => console.error('Error con Redis:', err));

await redisClient.connect();

export default redisClient;
