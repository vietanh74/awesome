import { defineConfig, loadEnv, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';

import { resolve } from 'path';

const BUILD_PATH = 'dist';

function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    async closeBundle() {
      const out = path.resolve(BUILD_PATH);
      await copyFile(path.join(out, 'index.html'), path.join(out, '404.html'));
    },
  };
}

export default ({ mode }: any) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    base: process.env.VITE_APP_SUB_FOLDER ? `/${process.env.VITE_APP_SUB_FOLDER}/` : '/',
    plugins: [
      vue(),
      svgLoader(),
      viteStaticCopy({
        targets: [{ src: '.nojekyll', dest: '.' }],
      }),
      spaFallback(),
    ],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, './src'),
      },
    },
    preview: {
      port: 3000,
    },
    server: {
      port: process.env.VITE_APP_PORT ? parseInt(process.env.VITE_APP_PORT) : 3000,
    },
  });
};
