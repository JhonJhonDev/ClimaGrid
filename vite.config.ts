import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: {
      origin: 'https://sturdycanoe-1015339393080.northamerica-northeast2.run.app',
    },
  },
  build: {
    manifest: true,
  },
})
