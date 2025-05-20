/** @type {import('jest').Config} */
export default {
  // Limpieza automática de mocks entre tests
  clearMocks:   true,
  resetMocks:   true,
  restoreMocks: true,

  // Cobertura de código
  collectCoverage:   true,
  coverageDirectory: "coverage",

  // Entorno de Node.js
  testEnvironment: "node",

  // Ejecutar este setup *después* de levantar el runtime de Jest
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.mjs"]
};
