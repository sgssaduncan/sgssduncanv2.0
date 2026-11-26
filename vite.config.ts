import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SGD Duncan 2.0',
        short_name: 'SGD Duncan',
        description: 'Sistema de Gestión Digital de Inspecciones SSA del Grupo Duncan',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'es',
        icons: [
          { src: '/icons/icon.svg', sizes: '192x192 512x512', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/duncan-logo-color.png', sizes: '832x356', type: 'image/png' },
          { src: '/duncan-logo-bw.png', sizes: '147x52', type: 'image/png' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/consolidador_ssa_duncan.html', '**/pdf.worker*.mjs'],
        navigateFallbackDenylist: [/^\/api\//, /\/consolidador_ssa_duncan\.html$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/script\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-sheets-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 8,
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: false,
    target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14', 'ios14'],
    cssTarget: ['chrome87', 'edge88', 'firefox78', 'safari14', 'ios14'],
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) {
              return 'vendor-react';
            }
            if (id.includes('/lucide-react/')) {
              return 'vendor-icons';
            }
            if (id.includes('/pdfjs-dist/')) {
              return 'vendor-pdfjs';
            }
            if (id.includes('/exceljs/')) {
              return 'vendor-exceljs';
            }
            if (id.includes('/xlsx/')) {
              return 'vendor-xlsx';
            }
            if (id.includes('/jspdf') || id.includes('/html2canvas') || id.includes('/html2pdf')) {
              return 'vendor-pdfgen';
            }
            if (id.includes('/recharts/') || id.includes('/d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('/motion/')) {
              return 'vendor-motion';
            }
          }
          return undefined;
        },
      },
    },
  },
});
