import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'rolldown'
import replace from '@rollup/plugin-replace'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  input: resolve(__dirname, 'src/background.ts'),
  output: {
    file: resolve(__dirname, `extension-gecko/background.js`),
    cleanDir: false,
  },
  plugins: [
    replace({
      __TARGET__: JSON.stringify('gecko'),
    }),
  ],
})
