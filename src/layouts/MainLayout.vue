<script setup lang="ts">
import { ref } from 'vue';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-black" style="border-bottom: 2px solid #1976D2">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-subtitle1 text-grey-8 text-weight-bold">
          TMIS
        </q-toolbar-title>
        <q-space />
        <q-btn unelevated color="grey-9" label="Login" class="q-px-md" to="/login" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list class="q-mt-md">
        <q-item clickable v-ripple to="/home" active-class="bg-blue-1 text-primary">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>หน้าแรก</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/course" active-class="bg-blue-1 text-primary">
          <q-item-section avatar><q-icon name="school" /></q-item-section>
          <q-item-section>หลักสูตร</q-item-section>
        </q-item>

        <q-item clickable v-ripple active-class="bg-blue-1 text-primary">
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
