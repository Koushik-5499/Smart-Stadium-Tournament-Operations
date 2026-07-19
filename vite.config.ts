import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    sourcemap: true,
  },
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: false
      }
    },
    environment: 'jsdom',
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
});
