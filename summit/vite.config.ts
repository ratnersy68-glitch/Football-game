import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5180 },
  build: { chunkSizeWarningLimit: 2000 },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 120000,
  },
} as any);
