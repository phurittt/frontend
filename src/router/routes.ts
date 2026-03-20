import type { RouteRecordRaw } from 'vue-router';
import { RouterView } from 'vue-router';

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
      // --------------------------------------------------------------------------------
      { path: '', redirect: '/admin/projects' },
      // --------------------------------------------------------------------------------
      {
        path: 'projects',
        component: RouterView,
        children: [
          {
            path: '',
            component: () => import('pages/admin/ProjectManagementPage.vue'),
            meta: {
              title: 'จัดการโครงการและหลักสูตร',
              breadcrumbs: [{ label: 'จัดการโครงการและหลักสูตร' }],
            },
          },
          {
            path: 'add',
            component: () => import('pages/admin/ProjectAddPage.vue'),
            meta: {
              title: 'เพิ่มหลักสูตร',
              breadcrumbs: [
                { label: 'จัดการโครงการและหลักสูตร', to: '/admin/projects' },
                { label: 'เพิ่มหลักสูตร' },
              ],
            },
          },
          {
            path: 'edit/:id',
            name: 'project-edit',
            component: () => import('pages/admin/ProjectAddPage.vue'),
            meta: {
              title: 'แก้ไขหลักสูตร',
              breadcrumbs: [
                { label: 'จัดการโครงการและหลักสูตร', to: '/admin/projects' },
                { label: 'แก้ไขหลักสูตร' },
              ],
            },
          },
        ],
      },
      // --------------------------------------------------------------------------------
      {
        path: 'courses',
        component: () => import('pages/admin/MasterCoursePage.vue'),
        meta: { parent: 'จัดการหลักสูตร', title: 'โครงการและหลักสูตร' },
      },
      // --------------------------------------------------------------------------------
      {
        path: 'registrants',
        component: RouterView,
        children: [
          {
            path: '',
            component: () => import('pages/admin/RegistrantPage.vue'),
            meta: {
              title: 'จัดการผู้ลงทะเบียนอบรม',
              breadcrumbs: [{ label: 'จัดการผู้ลงทะเบียนอบรม' }],
            },
          },
          {
            path: ':courseId',
            name: 'registrant-manage',
            component: () => import('pages/admin/RegistrantManagementPage.vue'),
            meta: {
              title: 'จัดการผู้ลงทะเบียนอบรม',
              breadcrumbs: [
                { label: 'จัดการผู้ลงทะเบียนอบรม', to: '/admin/registrants' },
                { label: 'ตรวจสอบรายชื่อผู้ลงทะเบียนอบรม' },
              ],
            },
          },
        ],
      },
      // --------------------------------------------------------------------------------
      {
        path: 'project-types',
        component: () => import('pages/admin/CourseProjectTypes.vue'),
        meta: { parent: 'ตั้งค่าระบบ', title: 'ประเภทโครงการ' },
      },
      // --------------------------------------------------------------------------------
      {
        path: 'user-management',
        component: () => import('pages/admin/UserManagementPage.vue'),
        meta: { parent: 'ตั้งค่าระบบ', title: 'สิทธิ์ผู้ใช้งาน' },
      },
      // --------------------------------------------------------------------------------
      {
        path: 'course-types',
        component: () => import('pages/admin/CourseCategoryPage.vue'),
        meta: { parent: 'ตั้งค่าระบบ', title: 'ประเภทหลักสูตร' },
      },
      // --------------------------------------------------------------------------------
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
