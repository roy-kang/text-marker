import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'wordMarker',
      fileName: 'index'
    }
  }
})
