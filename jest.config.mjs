// jest.config.mjs
/** @type {import('jest').Config} */
const config = {
	  // Limpiar las llamadas
  clearMocks: true,
  // información de coverage de código
  collectCoverage: true,
  coverageDirectory: "coverage",
};
export default config;