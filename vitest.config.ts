import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
    globals: true,
    css: true,
    testTimeout: 10000, // 10 seconds timeout for CI stability
    hookTimeout: 10000, // 10 seconds timeout for setup/teardown hooks
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/layout.tsx',
        'src/**/loading.tsx',
        'src/**/not-found.tsx',
        'src/**/error.tsx',
        'src/**/*.stories.{js,jsx,ts,tsx}',
      ],
      thresholds: {
        global: {
          branches: 15,
          functions: 15,
          lines: 15,
          statements: 15,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
