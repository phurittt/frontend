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
      { path: 'courses/all', component: () => import('pages/CourseAllPage.vue') },
      { path: 'courses/open', component: () => import('pages/CourseOpenPage.vue') },
      { path: 'courses/:id', component: () => import('pages/CourseDetailPage.vue') },

      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', component: () => import('pages/RegisterPage.vue') },

      { path: 'contact', component: () => import('pages/ContactPage.vue') },

      { path: 'verify-certificate', component: () => import('pages/VerifyCertificatePage.vue') },
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
        component: () => import('src/pages/admin/ProjectManagementPage.vue'),
        meta: { parent: 'การจัดการหลัก', title: 'โครงการและหลักสูตร' },
      },
      {
        path: 'projects/add',
        component: () => import('pages/admin/ProjectAddPage.vue'),
        meta: { parent: 'จัดการโครงการ', title: 'เพิ่ม' },
      },
      {
        path: 'courses',
        component: () => import('src/pages/admin/MasterCoursePage.vue'),
        meta: { parent: 'จัดการหลักสูตร', title: 'โครงการและหลักสูตร' },
      },
      {
        path: 'project-types',
        component: () => import('pages/admin/CourseProjectTypes.vue'),
        meta: { parent: 'ตั้งค่าระบบ', title: 'ประเภทโครงการ' },
      },
      {
        path: 'user-management',
        component: () => import('pages/admin/UserManagementPage.vue'),
        meta: { parent: 'ตั้งค่าระบบ', title: 'สิทธิ์ผู้ใช้งาน' },
      },
      {
        path: 'course-types',
        component: () => import('pages/admin/CourseCategoryPage.vue'),
        meta: { parent: 'ตั้งค่าระบบ', title: 'ประเภทหลักสูตร' },
      },
      {
        path: 'lecturers',
        component: () => import('pages/admin/LecturerManagePage.vue'),
        meta: { parent: 'ตั้งค่าระบบ', title: 'ข้อมูลวิทยากร' },
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
