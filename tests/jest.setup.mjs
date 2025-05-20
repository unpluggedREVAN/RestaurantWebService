import 'dotenv/config';

import { jest } from '@jest/globals';

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    on:      jest.fn(),
    connect: jest.fn(),
    get:     jest.fn(),
    setEx:   jest.fn(),
    del:     jest.fn()
  }))
}));
