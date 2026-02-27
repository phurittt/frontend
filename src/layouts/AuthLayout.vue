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
          <q-btn flat no-caps label="หน้าแรก" class="nav-btn" to="/" />

          <q-btn flat no-caps label="หลักสูตร" class="nav-btn">
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

          <q-btn flat no-caps label="ตรวจสอบวุฒิบัตร" class="nav-btn" to="/verify" />
          <q-btn flat no-caps label="ติดต่อเรา" class="nav-btn" to="/contact" />

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
            <q-item clickable v-ripple to="/" class="mobile-nav-item" @click="menuOpen = false">
              <q-item-section avatar><q-icon name="home" size="sm" /></q-item-section>
              <q-item-section>หน้าแรก</q-item-section>
            </q-item>

            <q-expansion-item icon="menu_book" label="หลักสูตร" class="mobile-nav-item">
              <q-list class="q-pl-xl">
                <q-item
                  clickable
                  v-ripple
                  to="/courses/open"
                  @click="menuOpen = false"
                  class="sub-item"
                >
                  <q-item-section>หลักสูตรที่เปิดอบรม</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  to="/courses/all"
                  @click="menuOpen = false"
                  class="sub-item"
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
              @click="menuOpen = false"
            >
              <q-item-section avatar><q-icon name="phone" size="sm" /></q-item-section>
              <q-item-section>ติดต่อเรา</q-item-section>
            </q-item>

            <q-separator class="q-my-lg opacity-50" />

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
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const menuOpen = ref(false);
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);

watch(menuOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});
</script>

<style scoped lang="scss">
.q-layout {
  background-color: #faf8f6;
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
  transition: color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background-color: $primary;
    transition: width 0.3s ease-out;
    border-radius: 2px;
  }

  &:hover {
    color: $primary;
    background: transparent;
    &::after {
      width: 40%;
    }
  }
}

.nav-dropdown {
  color: #4b5563;
  border-radius: 16px;
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
    transform: translateX(1px);
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

.sub-item {
  font-size: 0.9rem;
  color: #4b5563;
  border-radius: 8px;
  margin-top: 4px;
  margin-left: 12px;
  margin-right: 10px;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    color: $primary;
    background-color: rgba($primary, 0.05);
    transform: translateX(4px);
  }
}

.mobile-nav-item {
  border-radius: 12px;
  margin-bottom: 4px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    color: $primary;
    background-color: rgba(0, 0, 0, 0.02);
    overflow: hidden;
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
</style>
