<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// เปลี่ยนค่าเริ่มต้นเป็น true เพื่อให้แสดงเสมอ
const leftDrawerOpen = ref(true);
const profileMenu = ref(false);

const route = useRoute();
const router = useRouter();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function handleLogout() {
  router.push('/login');
}

const menuGroups = [
  {
    title: 'การจัดการหลัก',
    items: [
      { icon: 'o_assignment', label: 'โครงการ', to: '/admin/projects' },
      { icon: 'eva-book-open-outline', label: 'หลักสูตร', to: '/admin/courses' },
      { icon: 'eva-people-outline', label: 'ผู้ลงทะเบียนอบรม', to: '/admin/registrants' },
    ],
  },
  {
    title: 'การจัดการวุฒิบัตร',
    items: [
      { icon: 'eva-award-outline', label: 'วุฒิบัตร', to: '/admin/certificates' },
      { icon: 'eva-printer-outline', label: 'พิมพ์วุฒิบัตร', to: '/admin/print' },
    ],
  },
  {
    title: 'รายงานและเว็บไซต์',
    items: [
      { icon: 'eva-bar-chart-outline', label: 'รายงาน', to: '/admin/reports' },
      { icon: 'eva-image-outline', label: 'แบนเนอร์ / สไลด์โชว์', to: '/admin/slideshow' },
    ],
  },
  {
    title: 'ข้อมูลพื้นฐาน',
    items: [
      { icon: 'eva-person-outline', label: 'สมาชิก', to: '/admin/members' },
      { icon: 'o_school', label: 'วิทยากร', to: '/admin/lecturers' },
      { icon: 'eva-layers-outline', label: 'ประเภทโครงการ', to: '/admin/project-types' },
      { icon: 'eva-list-outline', label: 'ประเภทหลักสูตร', to: '/admin/course-types' },
      { icon: 'eva-shield-outline', label: 'บุคลากรและสิทธิ์', to: '/admin/user-management' },
    ],
  },
  {
    title: 'การเงิน',
    items: [{ icon: 'eva-credit-card-outline', label: 'ค่าใช้จ่าย', to: '/admin/finance' }],
  },
];

const getMenuIcon = (item: { icon: string; to: string }) => {
  const isActive = route.path.startsWith(item.to);
  if (!isActive) return item.icon;

  if (item.icon.startsWith('eva-')) {
    return item.icon.replace('-outline', '');
  }

  if (item.icon.startsWith('o_')) {
    return item.icon.replace('o_', '');
  }

  return item.icon;
};
</script>

<template>
  <q-layout view="hHh Lpr lFf">
    <q-header class="header-bar text-dark" height-hint="64">
      <q-toolbar class="q-py-sm q-px-lg" style="min-height: 64px">
        <q-btn
          unelevated
          round
          icon="menu_open"
          @click="toggleLeftDrawer"
          class="burger-btn q-mr-md"
          :class="{ 'rotate-180': !leftDrawerOpen }"
          size="md"
          padding="8px"
        />

        <div class="column justify-center">
          <div class="row items-center q-gutter-x-sm">
            <span
              class="text-h6 text-weight-bolder text-white tracking-tight gt-xs q-mr-sm"
              style="text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1)"
            >
              Computer Center
            </span>

            <q-badge class="text-caption text-weight-medium admin-badge disable-select" rounded>
              Admin Panel
            </q-badge>
          </div>
        </div>

        <q-space />

        <q-btn flat no-caps class="profile-pill" :ripple="false">
          <div class="row items-center no-wrap q-gutter-x-xs q-px-xs">
            <div class="column items-end gt-xs q-pr-xs">
              <span class="text-weight-bold text-body2 line-height-tight text-dark"
                >เหนือภพ อวกาศ</span
              >
              <span class="text-caption text-primary line-height-tight font-weight-600"
                >Administrator</span
              >
            </div>
            <q-avatar size="36px" class="profile-avatar">
              <img src="https://cdn.quasar.dev/img/linux-avatar.png" />
            </q-avatar>
            <q-icon
              name="eva-chevron-down"
              color="grey-4"
              size="sm"
              class="icon-expand"
              :class="{ 'rotate-icon': profileMenu }"
            />
          </div>

          <q-menu
            v-model="profileMenu"
            transition-show="jump-down"
            transition-hide="jump-up"
            :offset="[0, 6]"
            class="nav-dropdown"
          >
            <q-list style="min-width: 220px">
              <q-item clickable v-close-popup class="dropdown-item" to="/profile">
                <q-item-section avatar style="min-width: 36px">
                  <q-icon name="manage_accounts" class="dropdown-icon" size="20px" />
                </q-item-section>
                <q-item-section class="text-weight-medium">ตั้งค่าบัญชี</q-item-section>
              </q-item>

              <q-separator class="q-my-xs q-mx-md horizon-line" />

              <q-item
                clickable
                v-close-popup
                class="dropdown-item text-negative"
                @click="handleLogout"
              >
                <q-item-section avatar style="min-width: 36px">
                  <q-icon name="logout" color="negative" size="20px" />
                </q-item-section>
                <q-item-section class="text-weight-bold">ออกจากระบบ</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above class="" :width="280">
      <q-scroll-area class="fit sidebar-left">
        <q-list padding class="q-px-sm q-pb-xl q-pt-md">
          <template v-for="(group, groupIndex) in menuGroups" :key="groupIndex">
            <q-item-label
              header
              class="text-weight-bold text-grey-5 q-pb-sm q-pt-lg letter-spacing-1"
              style="font-size: 0.7rem; text-transform: uppercase"
            >
              {{ group.title }}
            </q-item-label>

            <q-item
              v-for="(item, index) in group.items"
              :key="`item-${groupIndex}-${index}`"
              clickable
              v-ripple
              :to="item.to"
              class="menu-item q-mb-xs"
              active-class="menu-active"
            >
              <q-item-section avatar style="min-width: 40px">
                <q-icon :name="getMenuIcon(item)" size="20px" class="menu-icon" />
              </q-item-section>
              <q-item-section class="text-weight-medium menu-label">
                {{ item.label }}
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="bg-light">
      <transition name="breadcrumb-slide" mode="out-in">
        <div class="q-px-xl q-pt-lg q-pb-none" style="margin: 0 auto" :key="route.fullPath">
          <q-breadcrumbs class="text-grey-6 text-weight-medium" active-color="primary">
            <template v-slot:separator>
              <q-icon size="1.2em" name="eva-chevron-right" color="grey-4" />
            </template>

            <q-breadcrumbs-el icon="eva-home" to="/admin/dashboard" />

            <template v-if="route.meta.breadcrumbs && Array.isArray(route.meta.breadcrumbs)">
              <q-breadcrumbs-el
                v-for="(crumb, index) in route.meta.breadcrumbs"
                :key="index"
                :label="crumb.label"
                :to="crumb.to"
                :class="{ 'text-dark': index === route.meta.breadcrumbs.length - 1 }"
              />
            </template>

            <template v-else>
              <q-breadcrumbs-el v-if="route.meta.parent" :label="String(route.meta.parent)" />
              <q-breadcrumbs-el
                v-if="route.meta.title"
                :label="String(route.meta.title)"
                class="text-dark"
              />
            </template>
          </q-breadcrumbs>
        </div>
      </transition>

      <div class="q-px-xl q-pt-lg q-pa-xl-xl page-transition" style="margin: 0 auto">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
.bg-light {
  background-color: $background-light;
}

/* ================= Header & Sidebar Borders ================= */
.header-bar {
  z-index: 1998;
  position: absolute;
  left: 0;
  background: linear-gradient(135deg, #fe8d5c, #ff9966, #ff7e5f);
  box-shadow:
    0 4px 10px -2px rgba(254, 141, 92, 0.25),
    0 1px 3px rgba(0, 0, 0, 0.05);

  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  clip-path: inset(0px -100px -100px -100px);
}

.sidebar-left {
  border-right: 1px solid rgba(0, 0, 0, 0.04);
}

/* ================= Burger Button ================= */
.burger-btn {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.35) !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: scale(0.95);
    background-color: rgba(255, 255, 255, 0.4) !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
}

.rotate-180 {
  transform: rotate(180deg);
}

/* ================= Typography ================= */
.tracking-tight {
  letter-spacing: -0.4px;
}

.letter-spacing-1 {
  letter-spacing: 0.8px;
}

.line-height-tight {
  line-height: 1.2;
}

.line-height-none {
  line-height: 1;
}

.font-weight-600 {
  font-weight: 600;
}

/* ================= Badge ================= */
.admin-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #fe5c5c;
  padding: 5px 12px;
  font-weight: 800;
  letter-spacing: 0.5px;
  border: 1px solid white;
  text-transform: uppercase;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.6);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

/* ================= Profile Pill ================= */
.profile-pill {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 6px 4px 12px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  .profile-avatar {
    border: 2px solid white;
    transition: all 0.2s ease;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.35) !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);

    .icon-expand {
      color: $primary !important;
      transition: all 0.2s ease;
    }
  }
}

.icon-expand {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

.rotate-icon {
  transform: rotate(180deg) scale(1.2);
  color: $primary !important;
}

:deep(.q-avatar__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* ================= Sidebar Menu ================= */
.menu-item {
  border-radius: 8px;
  color: #64748b;
  margin: 2px 16px;
  padding: 10px 14px;
  transition: all 0.2s ease;
  position: relative;

  .menu-icon {
    color: #94a3b8;
    transition: all 0.2s ease;
  }

  .menu-label {
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  &:hover {
    background-color: rgba($primary, 0.05);
    color: $primary;

    .menu-icon {
      color: $primary;
      transform: scale(1.1);
    }
  }
}

.menu-active {
  background-color: rgba($primary, 0.08) !important;
  color: $primary !important;
  font-weight: 600 !important;

  .menu-icon {
    color: $primary !important;
  }

  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    height: 60%;
    width: 4px;
    background-color: $primary;
    border-radius: 0 4px 4px 0;
  }
}

/* ================= Animations & Transitions ================= */

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

/* Breadcrumb Animation */

.breadcrumb-slide-enter-active,
.breadcrumb-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.breadcrumb-slide-enter-from {
  opacity: 0;

  transform: translateX(15px);
}

.breadcrumb-slide-leave-to {
  opacity: 0;

  transform: translateX(-15px);
}

/* ================= Scrollbar ================= */
:deep(.q-scrollarea__thumb) {
  background-color: #cbd5e1 !important;
  width: 5px !important;
  border-radius: 5px;
  opacity: 0.3;
}

:deep(.q-scrollarea__thumb:hover) {
  opacity: 0.6;
}
</style>
