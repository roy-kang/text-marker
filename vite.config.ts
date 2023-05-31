import { defineConfig } from 'vite'
import pkg from './package.json'

const createBanner = () => {
  const date = new Date()
  return `\
/** wordMarker v${pkg.version}
  * (c) ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}
  * @license MIT
  */
`
}

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    rollupOptions: {
      output: {
        banner: createBanner()
      }
    },
    lib: {
      entry: './lib/index.ts',
      name: 'wordMarker',
      fileName: format => `index.${format}.js`
    }
  }
})
