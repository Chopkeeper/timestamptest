import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  server: {
    // ทำให้สามารถเข้าถึงจาก IP Address ในเครือข่ายเดียวกันได้
    host: true, 
  }
})
