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
  // --- กลุ่มที่ 3: Admin (ใช้ AdminLayout ใหม่) ---
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'), // <-- Layout ใหม่
    children: [
      // เข้า /admin เฉยๆ ให้เด้งไปหน้า projects หรือ Dashboard
      { path: '', redirect: '/admin/projects' },

      // หน้าจัดการโครงการ
      { path: 'projects', component: () => import('pages/admin/ProjectManagePage.vue') },

      // หน้าอื่นๆ ก็เพิ่มต่อตรงนี้...
      // { path: 'users', component: ... },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
