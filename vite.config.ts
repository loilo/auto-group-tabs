// Configuration for bundling the options page

import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// See https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // Ensure that all parties import the exact same Vue build
      vue: require.resolve('vue/dist/vue.runtime.esm-bundler.js'),
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'focus-trap' || tag.startsWith('mwc-')
        }
      }
    })
  ],

  // Code that is copied directly to the extension directory
  publicDir: 'static',
  root: resolve('src'),
  server: { port: 6655 },
  build: {
    assetsDir: '.',
    outDir: '../extension',
    emptyOutDir: true,
    target: 'chrome89',
    sourcemap: true,
    minify: false
  }
})
