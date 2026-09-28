import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative base + hash routing: the build drops into any folder on the PHP server.
  base: './',
  server: {
    // Expose on LAN so phones can open /#/capture during development.
    host: true,
    // Same-origin proxy to the PHP API (it sends no CORS headers). Streams SSE as-is.
    proxy: {
      '/api': {
        target: 'http://192.168.1.88',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/ministack/Surf_Goa_Mosaic'),
      },
    },
  },
})
