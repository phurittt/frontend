<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const leftDrawerOpen = ref(true);
const route = useRoute();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// รายการเมนูทั้งหมด (กำหนด Icon และ Link ที่นี่)
const menuList = [
  { icon: 'lock_outline', label: 'จัดการสิทธิ์ผู้ใช้งาน', to: '/admin/permissions' },
  { icon: 'grid_view', label: 'จัดการโครงการและหลักสูตร', to: '/admin/projects' }, // หน้าปัจจุบัน
  { icon: 'people_outline', label: 'จัดการผู้ลงทะเบียนอบรม', to: '/admin/registrations' },
  { icon: 'image', label: 'จัดการข้อมูล slide show', to: '/admin/slideshow' },
  { icon: 'account_balance_wallet', label: 'จัดการรายรับและรายจ่าย', to: '/admin/finance' },
  { icon: 'workspace_premium', label: 'จัดการวุฒิบัตร', to: '/admin/certificates' },
  { icon: 'print', label: 'พิมพ์วุฒิบัตร', to: '/admin/print' },
  { icon: 'manage_accounts', label: 'จัดการข้อมูลสมาชิก', to: '/admin/members' },
  { icon: 'bar_chart', label: 'รายงาน', to: '/admin/reports' },
  { icon: 'layers', label: 'จัดการประเภทโครงการ', to: '/admin/project-types' },
  { icon: 'show_chart', label: 'จัดการประเภทหลักสูตร', to: '/admin/course-types' },
  { icon: 'book', label: 'จัดการหลักสูตร', to: '/admin/courses' },
  { icon: 'school', label: 'จัดการข้อมูลวิทยากร', to: '/admin/lecturers' },
];
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey-9 shadow-1" bordered>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-subtitle1 text-weight-bold">
          ระบบจัดการการฝึกอบรม (Admin)
        </q-toolbar-title>
        <q-space />
        <q-btn flat round icon="account_circle" size="md" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-white text-grey-8">

      <div class="q-pa-md flex column flex-center q-mb-md">
        <q-avatar size="64px" color="grey-3" text-color="grey-8" class="q-mb-sm">
          <q-icon name="person" size="40px" />
        </q-avatar>
        <div class="text-weight-bold text-subtitle1">เหนือภพ อวกาศ</div>
      </div>

      <q-separator class="q-mb-sm" />

      <q-list padding>

        <q-item
          v-for="(item, index) in menuList"
          :key="index"
          clickable
          v-ripple
          :to="item.to"
          active-class="bg-grey-3 text-black text-weight-bold"
        >
          <q-item-section avatar style="min-width: 40px;">
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item clickable v-ripple class="text-red">
          <q-item-section avatar style="min-width: 40px;">
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>ออกจากระบบ</q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>
