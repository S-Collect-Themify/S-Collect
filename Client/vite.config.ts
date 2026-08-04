import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sitemap({
      hostname: 'https://s-collect.vercel.app',
      dynamicRoutes: ['/', '/orders', '/products', '/returns'],
    }),
  ],
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://api.collects.ihkam.tech',
        changeOrigin: true,
      },
    },
  },
});
