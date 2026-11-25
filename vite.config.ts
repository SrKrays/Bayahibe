import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // Pixi y GSAP en chunks propios: se cachean aparte del código de la app
        manualChunks(id) {
          if (id.includes('node_modules/pixi.js')) return 'pixi';
          if (id.includes('node_modules/gsap')) return 'gsap';
        },
      },
    },
  },
});
