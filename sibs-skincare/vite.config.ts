import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// I checked the Vite guide for this setup. It keeps the config small and clean.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        fallback: fileURLToPath(new URL('./404.html', import.meta.url)),
      },
    },
  },
})
