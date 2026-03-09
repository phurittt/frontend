<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="header">
      <q-toolbar class="container-width q-py-sm q-px-md">
        <q-btn flat no-caps class="q-px-none logo-btn" :ripple="false" to="/">
          <div class="row items-center logo-wrapper">
            <img src="~assets/BUCC_TRAINING.svg" style="width: 250px" class="bucc-logo" />
          </div>

          <q-tooltip
            class="text-white"
            :offset="[0, 8]"
            transition-show="scale"
            transition-hide="fade"
            style="font-size: 0.8rem; border-radius: 8px"
          >
            ระบบฝึกอบรม สำนักคอมพิวเตอร์ มหาวิทยาลัยบูรพา
          </q-tooltip>
        </q-btn>

        <q-space />

        <div class="gt-sm row items-center q-gutter-x-sm">
          <q-btn
            flat
            no-caps
            label="หน้าแรก"
            class="nav-btn"
            to="/"
            :class="{ 'is-active': route.path === '/' }"
          />

          <q-btn
            flat
            no-caps
            label="หลักสูตร"
            class="nav-btn"
            :class="{ 'is-active': route.path.startsWith('/courses') }"
          >
            <q-menu transition-show="jump-down" transition-hide="jump-up" :offset="[0, 8]">
              <q-list style="min-width: 220px" class="nav-dropdown">
                <q-item clickable v-ripple to="/courses/open" class="dropdown-item">
                  <q-item-section class="text-weight-medium">หลักสูตรที่เปิดอบรม</q-item-section>
                </q-item>
                <q-separator inset />
                <q-item clickable v-ripple to="/courses/all" class="dropdown-item">
                  <q-item-section class="text-weight-medium">หลักสูตรทั้งหมด</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn
            flat
            no-caps
            label="ตรวจสอบวุฒิบัตร"
            class="nav-btn"
            to="/verify"
            :class="{ 'is-active': route.path.startsWith('/verify') }"
          />
          <q-btn
            flat
            no-caps
            label="ติดต่อเรา"
            class="nav-btn"
            to="/contact"
            :class="{ 'is-active': route.path.startsWith('/contact') }"
          />

          <div v-if="authStore.isLoggedIn" class="q-ml-md">
            <q-btn flat no-caps rounded class="profile-btn q-px-sm q-py-xs">
              <div class="row items-center q-gutter-x-sm">
                <q-avatar size="32px" class="profile-avatar shadow-1">
                  <img
                    :src="userStore.profile?.avatar || 'https://cdn.quasar.dev/img/boy-avatar.png'"
                  />
                </q-avatar>
                <div class="gt-xs text-weight-medium text-body2 profile-name q-pr-xs">
                  {{ firstName }}
                </div>
              </div>

              <q-menu transition-show="jump-down" transition-hide="jump-up" :offset="[0, 8]">
                <q-list style="min-width: 180px" class="nav-dropdown">
                  <q-item clickable v-close-popup class="dropdown-item" to="/profile">
                    <q-item-section avatar>
                      <q-icon name="account_circle" size="sm" color="primary" />
                    </q-item-section>
                    <q-item-section class="text-weight-medium">โปรไฟล์ของฉัน</q-item-section>
                  </q-item>

                  <q-separator inset class="q-my-xs" />

                  <q-item clickable v-close-popup class="dropdown-item" @click="handleLogout">
                    <q-item-section avatar>
                      <q-icon name="logout" size="sm" color="negative" />
                    </q-item-section>
                    <q-item-section class="text-weight-bold text-negative"
                      >ออกจากระบบ</q-item-section
                    >
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <template v-else>
            <q-btn
              v-if="route.path !== '/login'"
              unelevated
              rounded
              no-caps
              icon="login"
              label="เข้าสู่ระบบ"
              color="primary"
              class="q-ml-md q-px-lg text-weight-bold nav-btn-login"
              to="/login"
            />
            <q-btn
              v-else
              outline
              rounded
              no-caps
              icon="person_add"
              label="สมัครสมาชิก"
              color="primary"
              class="q-ml-md q-px-lg text-weight-bold nav-btn-login"
              to="/register"
            />
          </template>
        </div>

        <div class="lt-md">
          <q-btn
            flat
            round
            :icon="menuOpen ? 'close' : 'menu'"
            color="blue-grey-8"
            class="mobile-toggle-btn"
            :class="{ 'is-active': menuOpen }"
            @click="menuOpen = !menuOpen"
            aria-label="Toggle menu"
          />
        </div>
      </q-toolbar>

      <q-slide-transition>
        <div v-show="menuOpen" class="lt-md nav-menu full-width">
          <q-list padding class="q-px-lg q-pb-lg stagger-menu">
            <q-item
              clickable
              v-ripple
              to="/"
              class="mobile-nav-item"
              :class="{ 'is-active-mobile': route.path === '/' }"
              @click="menuOpen = false"
            >
              <q-item-section avatar><q-icon name="home" size="sm" /></q-item-section>
              <q-item-section>หน้าแรก</q-item-section>
            </q-item>

            <q-expansion-item
              icon="menu_book"
              label="หลักสูตร"
              class="mobile-nav-item"
              :class="{ 'is-active-mobile': route.path.startsWith('/courses') }"
            >
              <q-list class="q-pl-xl">
                <q-item
                  clickable
                  v-ripple
                  to="/courses/open"
                  class="sub-item"
                  exact
                  active-class="is-active-sub"
                  @click="menuOpen = false"
                >
                  <q-item-section>หลักสูตรที่เปิดอบรม</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  to="/courses/all"
                  class="sub-item"
                  exact
                  active-class="is-active-sub"
                  @click="menuOpen = false"
                >
                  <q-item-section>หลักสูตรทั้งหมด</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <q-item
              clickable
              v-ripple
              to="/verify"
              class="mobile-nav-item"
              :class="{ 'is-active-mobile': route.path.startsWith('/verify') }"
              @click="menuOpen = false"
            >
              <q-item-section avatar><q-icon name="search" size="sm" /></q-item-section>
              <q-item-section>ตรวจสอบวุฒิบัตร</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              to="/contact"
              class="mobile-nav-item"
              :class="{ 'is-active-mobile': route.path.startsWith('/contact') }"
              @click="menuOpen = false"
            >
              <q-item-section avatar><q-icon name="phone" size="sm" /></q-item-section>
              <q-item-section>ติดต่อเรา</q-item-section>
            </q-item>

            <q-separator class="q-my-md opacity-50" />

            <template v-if="authStore.isLoggedIn">
              <q-item
                clickable
                v-ripple
                to="/profile"
                class="mobile-profile-card q-mb-sm q-pa-md"
                @click="menuOpen = false"
              >
                <q-item-section avatar>
                  <q-avatar size="54px" class="mobile-profile-avatar shadow-3">
                    <img
                      :src="
                        userStore.profile?.avatar || 'https://cdn.quasar.dev/img/boy-avatar.png'
                      "
                    />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold text-subtitle1 text-dark">
                    {{ firstName }}
                  </q-item-label>
                  <q-item-label
                    caption
                    class="text-primary flex items-center q-mt-xs text-weight-medium"
                  >
                    ดูโปรไฟล์ของฉัน <q-icon name="chevron_right" size="xs" class="q-ml-xs" />
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-btn
                outline
                rounded
                color="negative"
                icon="logout"
                label="ออกจากระบบ"
                class="full-width q-py-sm q-mt-xs text-weight-bold"
                @click="handleLogout"
              />
            </template>

            <template v-else>
              <q-btn
                v-if="route.path !== '/login'"
                unelevated
                rounded
                color="primary"
                label="เข้าสู่ระบบ"
                class="full-width q-py-sm text-weight-bold nav-btn-login"
                to="/login"
                @click="menuOpen = false"
              />

              <q-btn
                v-else
                outline
                rounded
                color="primary"
                label="สมัครสมาชิก"
                class="full-width q-py-md text-weight-bold nav-btn-login"
                to="/register"
                @click="menuOpen = false"
              />
            </template>
          </q-list>
        </div>
      </q-slide-transition>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useUserStore } from 'src/stores/user-store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const menuOpen = ref(false);

// ดึงชื่อผู้ใช้มาแสดงแบบสั้นๆ
const firstName = computed(() => {
  const name = userStore.profile?.username?.split(' ')[0] || 'ผู้ใช้งาน';
  return name.length > 20 ? name.substring(0, 20) + '...' : name;
});

// ฟังก์ชันออกจากระบบ
function handleLogout() {
  authStore.logout();
  menuOpen.value = false; // ปิดเมนูมือถือเผื่อเปิดค้างไว้
  router.push('/login');
}

// ปิดเมนูมือถืออัตโนมัติเมื่อเปลี่ยนหน้า
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);

// ล็อก Scroll หน้าจอเวลาเปิดเมนูในมือถือ
watch(menuOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});
</script>

<style scoped lang="scss">
.q-layout {
  background-color: $background;
  min-height: 100vh;
}

.container-width {
  max-width: 1500px;
  width: 100%;
  margin: 0 auto;
  transition: padding 0.3s ease;
}

.header {
  z-index: 2000;
  background-color: $background;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02) !important;
  color: #4b5563;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-btn {
  :deep(.q-focus-helper) {
    display: none !important;
  }
}
.logo-wrapper {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  &:hover {
    transform: scale(1.02);
  }
}

.nav-btn {
  color: #555;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  padding: 8px 16px;
  position: relative;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background-color: $primary;
    transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-radius: 3px;
    opacity: 0.8;
  }

  &:not(.is-active):hover {
    color: $primary;
    background: transparent;
    &::after {
      width: 30%;
    }
  }

  &.is-active {
    color: $primary;
    font-weight: 700;

    &::after {
      width: 60%;
      opacity: 1;
    }
  }
}

.nav-dropdown {
  color: #4b5563;
  border-radius: 6px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  padding: 8px;
}
.dropdown-item {
  border-radius: 10px;
  margin: 2px 0;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba($primary, 0.05);
    color: $primary;
    transform: translateX(2px);
  }

  &.is-active-dropdown {
    background-color: rgba($primary, 0.1);
    color: $primary;
    font-weight: bold;
    border-left: 3px solid $primary;
    transform: translateX(0);
  }
}

.nav-btn-login {
  box-shadow: 0 4px 15px rgba($primary, 0.25) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-2px) scale(1.02);
  }
  &:active {
    transform: translateY(0) scale(0.98);
  }
}

.nav-menu {
  z-index: 1999;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: $background;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  clip-path: inset(0px -100px -100px -100px);
}

.mobile-nav-item {
  border-radius: 12px;
  margin-bottom: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    color: $primary;
    background-color: rgba($primary, 0.02);
  }

  &.is-active-mobile {
    color: $primary;
    background-color: rgba($primary, 0.08);
    font-weight: 700;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10%;
      height: 80%;
      width: 4px;
      background-color: $primary;
      border-radius: 0 4px 4px 0;
    }

    .q-icon {
      color: $primary;
    }
  }
}
.sub-item {
  font-size: 0.9rem;
  color: #4b5563;
  border-radius: 8px;
  margin-top: 4px;
  margin-left: 12px;
  margin-right: 10px;
  transition: all 0.2s ease;

  &:hover {
    color: $primary;
    background-color: rgba($primary, 0.05);
    transform: translateX(4px);
  }

  &.is-active-sub {
    color: $primary;
    background-color: rgba($primary, 0.08);
    font-weight: 700;
    transform: translateX(4px);
  }
}

.mobile-toggle-btn {
  transition: transform 0.3s ease;
  &.is-active {
    transform: rotate(90deg);
  }
}

.stagger-menu > * {
  animation: fadeUp 0.4s ease forwards;
  opacity: 0;
  transform: translateY(15px);
}

@for $i from 1 through 10 {
  .stagger-menu > *:nth-child(#{$i}) {
    animation-delay: #{$i * 0.05}s;
  }
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- Profile Button Styles --- */
.profile-btn {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: white;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  .profile-avatar {
    border: 2px solid white;
    transition: transform 0.3s ease;
  }

  .profile-name {
    color: #555555;
    transition: color 0.3s ease;
  }

  &:hover {
    background-color: rgba($primary, 0.04);
    border-color: rgba($primary, 0.3);
    box-shadow: 0 4px 12px rgba($primary, 0.1);
    transform: translateY(-1px);

    .profile-name {
      color: $primary;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba($primary, 0.1);
  }
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

/* --- Mobile Profile Card Styles --- */
.mobile-profile-card {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-bottom: 12px;

  .mobile-profile-avatar {
    border: 2px solid white;
    transition: transform 0.3s ease;
  }

  &:hover,
  &:active {
    background-color: rgba($primary, 1);
    border-color: rgba($primary, 0.3);
    box-shadow: 0 4px 12px rgba($primary, 0.1);
    transform: translateY(-1px);

    .mobile-profile-avatar {
      transform: scale(1.05);
    }
  }
}
</style>
