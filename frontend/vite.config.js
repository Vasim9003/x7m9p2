import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Docker-kulla external access allow panrathukku
    port: 5173,
    watch: {
      usePolling: true // Windows WSL-kulla file changes-a watch panrathukku
    }
  }
})