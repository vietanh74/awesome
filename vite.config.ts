import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';

import { resolve } from 'path';

const ENV_PATH = './env';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [vue(), svgLoader()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    envDir: resolve(__dirname, ENV_PATH),
    preview: {
      port: 3000,
    },
    server: {
      port: parseInt(process.env.VITE_APP_PORT) || 3000,
    },
  });
};
