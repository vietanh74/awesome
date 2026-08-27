import { copyFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const ROOT_DIR = import.meta.dirname;
const BUILD_DIR = resolve(ROOT_DIR, 'dist');

const DEFAULT_PORT = 3000;

function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    async closeBundle() {
      await copyFile(join(BUILD_DIR, 'index.html'), join(BUILD_DIR, '404.html'));
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, ROOT_DIR) };

  return {
    base: env.VITE_APP_SUB_FOLDER ? `/${env.VITE_APP_SUB_FOLDER}/` : '/',
    plugins: [
      tailwindcss(),
      vue(),
      svgLoader(),
      viteStaticCopy({
        targets: [{ src: '.nojekyll', dest: '.' }],
      }),
      spaFallback(),
    ],
    resolve: {
      alias: {
        '@': resolve(ROOT_DIR, 'src'),
      },
    },
    preview: {
      port: DEFAULT_PORT,
    },
    server: {
      port: Number(env.VITE_APP_PORT) || DEFAULT_PORT,
    },
  };
});
