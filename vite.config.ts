import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' so the build works on any host/path (Vercel, local preview, file).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
})
