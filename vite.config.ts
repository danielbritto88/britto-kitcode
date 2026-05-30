import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Tanque Cheio',
        short_name: 'Tanque Cheio',
        description: 'Controle de automóveis — combustível, manutenção e financeiro',
        theme_color: '#F4EFE6',
        background_color: '#F4EFE6',
        display: 'standalone',
        orientation: 'portrait-primary',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Novo abastecimento',
            url: '/combustivel/novo',
            icons: [{ src: '/icons/shortcut-fuel.png', sizes: '96x96' }],
          },
          {
            name: 'Nova manutenção',
            url: '/manutencao/nova',
            icons: [{ src: '/icons/shortcut-maintenance.png', sizes: '96x96' }],
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
