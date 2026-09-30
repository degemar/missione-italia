import react from '@vitejs/plugin-react';
import {readFileSync} from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { parsePublicEnvironment } from './src/config/public-env.js';
import {
  MAX_PRECACHE_BYTES,
  PRECACHE_GLOB_IGNORES,
  PRECACHE_GLOB_PATTERNS,
} from './src/platform/pwa-policy.js';

const packageMetadata = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as {version: string};

export default defineConfig(({ mode }) => {
  const environment = parsePublicEnvironment({
    ...process.env,
    ...loadEnv(mode, process.cwd(), ''),
  });
  const base = environment.basePath;

  return {
    base,
    define: {
      __APP_VERSION__: JSON.stringify(packageMetadata.version),
      __COMMIT_SHA__: JSON.stringify(process.env.GITHUB_SHA?.trim().slice(0, 40) || 'local'),
    },
    plugins: [
      react(),
      VitePWA({
        strategies: 'generateSW',
        registerType: 'prompt',
        injectRegister: null,
        manifest: {
          id: base,
          name: 'Missione Italia: The Lost Compass',
          short_name: 'Missione Italia',
          description: 'A cooperative, offline-ready family adventure through Italy.',
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'portrait-primary',
          background_color: '#FFF8E7',
          theme_color: '#005A5D',
          icons: [
            {
              src: `${base}assets/brand/pwa-192x192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}assets/brand/pwa-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}assets/brand/pwa-maskable-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          globPatterns: PRECACHE_GLOB_PATTERNS,
          globIgnores: PRECACHE_GLOB_IGNORES,
          maximumFileSizeToCacheInBytes: MAX_PRECACHE_BYTES,
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/_/, /\/api\//],
          runtimeCaching: [],
        },
      }),
    ],
    build: {
      sourcemap: false,
      reportCompressedSize: true,
    },
  };
});
