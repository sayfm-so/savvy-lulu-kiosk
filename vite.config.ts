import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served at root on Vercel (so /api/* and /clips/* resolve absolutely).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
})
