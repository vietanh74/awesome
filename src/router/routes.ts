import type { RouteRecordRaw } from 'vue-router';

import { RouteName } from '@/shared/constants';
import Homepage from '@/modules/common/homepage/index.vue';
import NotFound from '@/modules/common/notFound/index.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: RouteName.NOT_FOUND,
    component: NotFound,
    meta: {
      isPublic: true,
    },
  },
  {
    path: '',
    name: RouteName.HOMEPAGE,
    component: Homepage,
    meta: { layout: 'defaultNoHeader' },
  },
  {
    path: 'login',
    name: RouteName.LOGIN,
    component: () => import('@/modules/common/login/index.vue'),
    meta: {
      layout: 'defaultNoHeader',
      isPublic: true,
    },
  },
  {
    path: 'cham-cong',
    name: RouteName.LOG_WORK,
    component: () => import('@/modules/logWork/index.vue'),
    meta: { layout: 'defaultNoHeader' },
  },
  {
    path: 'media/upload',
    name: RouteName.UPLOAD,
    component: () => import('@/modules/media/pages/Upload/index.vue'),
    meta: { layout: 'defaultNoHeader' },
  },
];

export default routes;
