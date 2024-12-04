import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: true
  },

  server: {
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://remote-dev-test.ouyangzhiyong0415.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
