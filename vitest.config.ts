import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        'node:test': 'vitest',
      },
    },
    test: {
      globals: false,
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  })
);
