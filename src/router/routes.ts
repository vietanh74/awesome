import type { RouteRecordRaw } from 'vue-router';

import { RouteName } from '@/shared/constants';
import Homepage from '@/modules/common/homepage/index.vue';
import ReportPage from '@/modules/common/report/index.vue';
import MailReportPage from '@/modules/common/mailReport/index.vue';
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
  },
  {
    path: 'report',
    name: RouteName.REPORT,
    component: ReportPage,
  },
  {
    path: 'mail-report',
    name: RouteName.MAIL_REPORT,
    component: MailReportPage,
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
  },
  {
    path: 'u',
    name: RouteName.UPLOAD,
    component: () => import('@/modules/media/pages/Upload/index.vue'),
  },
  {
    path: 'u2',
    name: RouteName.UPLOAD_IMAGE,
    component: () => import('@/modules/media/pages/UploadImage/index.vue'),
  },
  {
    path: 'p',
    name: RouteName.PREVIEW,
    component: () => import('@/modules/media/pages/preview/index.vue'),
  },
  {
    path: 'p/:fileId',
    name: RouteName.PREVIEW_DETAIL,
    component: () => import('@/modules/media/pages/previewDetail/index.vue'),
  },
];

export default routes;
