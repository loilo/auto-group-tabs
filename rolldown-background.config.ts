import { resolve } from 'node:path'

import { defineConfig } from 'rolldown'

const __dirname = new URL('.', import.meta.url).pathname

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  input: resolve(__dirname, 'src/background.ts'),
  output: {
    file: resolve(__dirname, 'extension/background.js'),
    cleanDir: false,
  },
})
