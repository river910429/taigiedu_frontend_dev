import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    // If you want to bind the server to all network interfaces
    host: true,
    // Specify which hosts are allowed to access the preview server
    allowedHosts: ['dev.taigiedu.com']
  }

})
