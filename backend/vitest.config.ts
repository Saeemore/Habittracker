import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],  // ← add this line
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});