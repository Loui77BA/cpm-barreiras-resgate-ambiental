import { defineConfig } from 'vite';

export default defineConfig({
  base: '/cpm-barreiras-resgate-ambiental/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  publicDir: 'public',
  server: {
    open: true,
  },
});
