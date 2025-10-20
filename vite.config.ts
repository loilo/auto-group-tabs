// Configuration for bundling the options page

import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vitest/config'

const __dirname = new URL('.', import.meta.url).pathname

// See https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // Ensure that all parties import the exact same Vue build
      vue: import.meta.resolve('vue/dist/vue.runtime.esm-bundler.js'),
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    vuetify({
      autoImport: { labs: true },
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'locale',
          dest: '.',
          rename: '_locales',
        },
      ],
    }),
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
    minify: 'oxc',
    cssMinify: 'lightningcss',
  },
  test: {
    include: ['./test/unit/**/*.test.ts'],
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        chrome: 89,
      },
    },
  },
})
