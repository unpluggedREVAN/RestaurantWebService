export default {
  connect: jest.fn().mockResolvedValue(true),
  model:   jest.fn(() => ({
    find:     jest.fn(),
    findById: jest.fn(),
    save:     jest.fn(),
    // métodos en general
  }))
};
