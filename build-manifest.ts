import fs from 'node:fs'

const target = process.argv[2]
const manifest = (await import(`./src/manifest/manifest.${target}.ts`)).default
fs.writeFileSync(`extension-${target}/manifest.json`, JSON.stringify(manifest, null, 2))
