import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5177,
    strictPort: true,
    proxy: {
      '/settings': {
        target: 'http://localhost:3002',
        changeOrigin: false,
      },
      '/api/uptimerobot': {
        target: 'https://api.uptimerobot.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/uptimerobot/, ''),
      },
      '/api/pagespeed': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pagespeed/, ''),
      },
      '/api/ssl': {
        target: 'https://ssl-checker.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ssl/, '/api/v1/check'),
        headers: { 'Accept': 'application/json' },
      },
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
