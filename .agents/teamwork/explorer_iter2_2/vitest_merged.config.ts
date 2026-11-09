import { defineConfig, mergeConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

// Import viteConfig dynamically or define merged config
import viteConfig from '../../../vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        'node:test': 'vitest',
      },
    },
    test: {
      root: projectRoot,
      globals: false,
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  })
);
