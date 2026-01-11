import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Augmenter la limite pour éviter les avertissements
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Optimisation du code splitting
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts', 'chart.js', 'react-chartjs-2'],
          'vendor-export': ['jspdf', 'html2canvas', 'pptxgenjs', 'xlsx'],
          'vendor-utils': ['date-fns', 'uuid', 'dexie', 'zustand'],
          // Lucide icons séparés
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    // Utilise esbuild par défaut (plus rapide)
    minify: 'esbuild',
  },
  esbuild: {
    // Supprime les console.log en production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
