<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useUserStore } from 'src/stores/user-store';

const leftDrawerOpen = ref(false);
const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

const firstName = computed(() => {
  return userStore.profile?.username?.split(' ')[0] || 'ผู้ใช้งาน';
});

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// ออกจากระบบ
function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-black" style="border-bottom: 2px solid #1976d2">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-subtitle1 text-grey-8 text-weight-bold">
          TMIS
        </q-toolbar-title>

        <q-space />

        <div v-if="authStore.isLoggedIn" class="row q-gutter-sm items-center">
          <q-btn flat round icon="shopping_cart" color="grey-7" />
          <q-btn flat round icon="favorite_border" color="grey-7" />

          <q-btn round flat>
            <q-avatar size="32px">
              <img
                :src="userStore.profile?.avatar || 'https://cdn.quasar.dev/img/boy-avatar.png'"
              />
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup>
                  <q-item-section>โปรไฟล์ ({{ firstName }})</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section class="text-red">ออกจากระบบ</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <q-btn v-else unelevated color="grey-9" label="Login" class="q-px-md" to="/login" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list class="q-mt-md">
        <q-item clickable v-ripple to="/" active-class="bg-grey-3 text-black text-weight-bold">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>หน้าแรก</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/courses"
          active-class="bg-grey-3 text-black text-weight-bold"
        >
          <q-item-section avatar><q-icon name="school" /></q-item-section>
          <q-item-section>หลักสูตร</q-item-section>
        </q-item>

        <template v-if="authStore.isLoggedIn">
          <q-item clickable v-ripple active-class="bg-grey-3 text-black text-weight-bold">
            <q-item-section avatar><q-icon name="history" /></q-item-section>
            <q-item-section>ประวัติการฝึกอบรม</q-item-section>
          </q-item>
        </template>

        <q-item clickable v-ripple active-class="bg-grey-3 text-black text-weight-bold">
          <q-item-section avatar><q-icon name="mail" /></q-item-section>
          <q-item-section>ติดต่อเรา</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
