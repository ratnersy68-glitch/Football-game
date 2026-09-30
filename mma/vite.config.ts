import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5180 },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 120000,
  },
} as any);
