import { createWriteStream } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import archiver from 'archiver'

const target = process.argv[2]

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const output = createWriteStream(
  resolve(__dirname, `auto-group-tabs.${target}.zip`),
)
const archive = archiver('zip')

output.on('close', () => {
  console.log('Extension has been packed')
})

archive.on('error', error => {
  throw error
})

archive.pipe(output)

archive.directory(resolve(__dirname, `extension-${target}`), false, data => {
  if (['.DS_Store', 'thumbs.db', 'desktop.ini'].includes(data.name)) {
    return false
  }
  return data
})

archive.finalize()
