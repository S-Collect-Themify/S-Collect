import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  let proxyTarget: string | undefined = env.VITE_PROXY_TARGET;
  if (!proxyTarget && env.VITE_API_URL && env.VITE_API_URL.startsWith('http')) {
    try {
      proxyTarget = new URL(env.VITE_API_URL).origin;
    } catch {
      // ignore invalid URL format
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      sitemap({
        hostname: env.VITE_SITE_URL,
        dynamicRoutes: ['/', '/orders', '/products', '/returns'],
      }),
    ],
    server: proxyTarget
      ? {
          proxy: {
            '/api/v1': {
              target: proxyTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  };
});
