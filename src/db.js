import pg from 'pg';
import {
  DB_USER,
  DB_HOST,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT,
} from './config.js';

// pool de conexión a PostgreSQL
const pool = new pg.Pool({
  user: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
});

// exportar el pool para usarlo en controladores
export default pool;
