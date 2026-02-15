import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: 'home', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: 'course', component: () => import('pages/CoursePage.vue') }],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'), // <-- เรียกใช้ Layout ใหม่ที่เพิ่งสร้าง
    children: [{ path: 'login', component: () => import('pages/LoginPage.vue') }],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
