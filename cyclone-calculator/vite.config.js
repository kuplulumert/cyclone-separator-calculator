import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      },
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js'
      }
    },
    target: 'es2015',
    minify: 'terser',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  },
  css: {
    devSourcemap: true
  },
  optimizeDeps: {
    include: ['chart.js', 'sortablejs']
  }
});