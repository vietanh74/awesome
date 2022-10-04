import type { RouteRecordRaw } from 'vue-router';

import { RouteName } from '@/shared/constants';
import Homepage from '@/modules/homepage/index.vue';
import NotFound from '@/modules/notFound/index.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: RouteName.NOT_FOUND,
    component: NotFound,
  },
  {
    path: '',
    name: RouteName.HOMEPAGE,
    component: Homepage,
    meta: { layout: 'defaultNoHeader' },
  },
  {
    path: 'cham-cong',
    name: RouteName.LOG_WORK,
    component: () => import('@/modules/logWork/index.vue'),
    meta: { layout: 'defaultNoHeader' },
  },
];

export default routes;
