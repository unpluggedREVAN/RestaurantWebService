export const DB_USER = process.env.DB_USER;
export const DB_HOST = process.env.DB_HOST;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_PORT = process.env.DB_PORT;
export const PORT = process.env.PORT || 3000;

// Valida env
if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_DATABASE || !DB_PORT) {
  throw new Error("Faltan variables de entorno requeridas en .env");
}
