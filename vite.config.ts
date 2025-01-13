import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    nodePolyfills({
      protocolImports: true
    }),
    eslint({ fix: true }),
    sentryVitePlugin({
      org: 'dusa-labs',
      project: 'pump'
    })
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis'
      },
      supported: {
        bigint: true
      }
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true
  }
});
