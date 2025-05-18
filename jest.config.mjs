/** @type {import('jest').Config} */
const config = {
	  // Limpiar automáticamente las llamadas y estados de los mocks antes de cada prueba
  clearMocks: true,
  // Recopilar información de cobertura de código
  collectCoverage: true,
  coverageDirectory: "coverage",
  // Opcional: extensiones de archivos a considerar como módulos (por defecto incluye .js)
  // moduleFileExtensions: ["js", "mjs", "cjs", "json", "node"],
  // Opcional: patrón para detectar archivos de test (por defecto *.test.js y *.spec.js en __tests__ o anywhere)
  // testMatch: ["**/?(*.)+(spec|test).[jt]s"],
  // Opcional: entorno de ejecución de pruebas (por defecto "node" para proyectos backend)
  // testEnvironment: "node",
};
export default config;