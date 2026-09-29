import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative base + hash routing: the build drops into any folder on the PHP server.
  base: './',
  // Expose on LAN so phones can open /#/capture during development.
  server: { host: true },
})
