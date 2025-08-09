import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index-new.tsx'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          'core': [
            './src/core/desktop-manager.ts',
            './src/core/window-system.ts',
            './src/core/app-registry.ts',
            './src/core/event-bus.ts'
          ],
          'utils': [
            './src/utils/ai-service.ts',
            './src/utils/file-system.ts',
            './src/utils/dom-helpers.ts',
            './src/utils/fallback-responses.ts'
          ]
        }
      }
    },
    // Performance optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 5174,
    open: true,
    cors: true
  },
  preview: {
    port: 5175
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['@google/generative-ai']
  }
});
