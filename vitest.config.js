import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['grupo-kr-motion/js/**/*.js'],
      exclude: ['grupo-kr-motion/js/boot.js', 'grupo-kr-motion/js/config.js'],
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: { lines: 85, functions: 85, statements: 85, branches: 75 }
    }
  }
});
