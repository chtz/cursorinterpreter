import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Improve chunking strategy
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          interpreter: ['./src/interpreter/index.js', './src/interpreter/parser.js', './src/interpreter/lexer.js', './src/interpreter/ast.js', './src/interpreter/tokens.js'],
        }
      }
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Minimize output for production
    minify: 'terser',
  }
})
