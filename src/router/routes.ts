import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // ==========================================
  // กลุ่มของผู้ใช้งานทั่วไป (ใช้ MainLayout)
  // ==========================================
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'courses/all', component: () => import('pages/CoursePage.vue') },
      { path: 'courses/open', component: () => import('pages/CoursePage.vue') },
      { path: 'courses/:id', component: () => import('pages/CourseDetailPage.vue') },

      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', component: () => import('pages/RegisterPage.vue') },

      { path: 'contact', component: () => import('pages/ContactPage.vue') },
    ],
  },

  // ==========================================
  // กลุ่มของระบบหลังบ้าน (ใช้ AdminLayout)
  // ==========================================
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', redirect: '/admin/projects' },
      {
        path: 'projects',
        component: () => import('pages/admin/ProjectManagePage.vue'),
        meta: { parent: 'การจัดการหลัก', title: 'โครงการและหลักสูตร' },
      },
      {
        path: 'project-types',
        component: () => import('pages/admin/CourseProjectTypes.vue'),
        meta: { parent: 'ตั้งค่าระบบ', title: 'ประเภทโครงการ' },
      },
    ],
  },

  // ==========================================
  // หน้า 404
  // ==========================================
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
