// Configuration for bundling the background script
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

export default {
  input: 'src/background.js',
  output: {
    file: 'extension/background.js'
  },
  plugins: [
    nodeResolve(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': '"production"'
    })
  ]
}
