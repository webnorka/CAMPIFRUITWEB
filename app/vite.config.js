import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json'))

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    '__APP_VERSION__': JSON.stringify(packageJson.version)
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase client (heavy)
          'vendor-supabase': ['@supabase/supabase-js'],
          // Icons library
          'vendor-icons': ['lucide-react'],
          // Utilities
          'vendor-utils': ['lodash', 'react-helmet-async'],
        },
      },
    },
  },
})
