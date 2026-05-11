import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// I checked the Vite guide for this setup. It keeps the config small and clean.
export default defineConfig({
  plugins: [react()],
})
