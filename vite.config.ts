import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import copy from 'rollup-plugin-copy';

import { resolve } from 'path';

const BUILD_PATH = 'dist';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [vue(), svgLoader()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    preview: {
      port: 3000,
    },
    server: {
      port: parseInt(process.env.VITE_APP_PORT) || 3000,
    },
    build: {
      rollupOptions: {
        plugins: [
          copy({
            targets: [{ src: `${BUILD_PATH}/index.html`, dest: BUILD_PATH, rename: '404.html' }],
            hook: 'closeBundle',
          }),
        ],
      },
    },
  });
};
