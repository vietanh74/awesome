import { createRouter, createWebHistory } from 'vue-router';

import routes from './routes';
import MainLayout from '@/shared/layout/MainLayout/index.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_SUB_FOLDER),
  routes: [
    {
      path: '',
      component: MainLayout,
      children: routes,
    },
  ],
});

export default router;
