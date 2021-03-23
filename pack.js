const { createWriteStream } = require('fs')
const { resolve } = require('path')
const archiver = require('archiver')

const output = createWriteStream(resolve(__dirname, 'auto-group-tabs.zip'))
const archive = archiver('zip')

output.on('close', () => {
  console.log('Extension has been packed')
})

archive.on('error', error => {
  throw error
})

archive.pipe(output)

archive.directory(resolve(__dirname, 'extension'), false, data => {
  if (['.DS_Store', 'thumbs.db', 'desktop.ini'].includes(data.name)) {
    return false
  }
  return data
})

archive.finalize()
