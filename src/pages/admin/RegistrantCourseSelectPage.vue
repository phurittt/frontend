<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMasterCourseStore } from 'src/stores/masterCourse-store';
import { useRegistrantStore } from 'src/stores/registrant-store';
import type { QTableColumn } from 'quasar';

const router = useRouter();
const courseStore = useMasterCourseStore();
const registrantStore = useRegistrantStore();

onMounted(() => {
  courseStore.fetchCourses();
  registrantStore.fetchRegistrants();
});

const columns: QTableColumn[] = [
  { name: 'id', label: 'รหัส', field: 'id', align: 'center' },
  { name: 'name', label: 'ชื่อหลักสูตร', field: 'name', align: 'left' },
  { name: 'category', label: 'หมวดหมู่', field: 'category', align: 'left' },
  { name: 'regCount', label: 'จำนวนผู้ลงทะเบียน', field: 'regCount', align: 'center' },
  { name: 'actions', label: 'จัดการผู้ลงทะเบียน', field: 'actions', align: 'center' }
];

// ดึงข้อมูลหลักสูตร และนับจำนวนผู้ลงทะเบียนที่เชื่อมกับ courseId นั้นๆ
const rows = computed(() => {
  return courseStore.courses.map(course => {
    const count = registrantStore.registrants.filter(r => r.courseId === course.id).length;
    return { ...course, regCount: count };
  });
});

const goToManage = (courseId: number) => {
  // นำทางไปหน้ารายชื่อของหลักสูตรนั้นๆ
  router.push(`/admin/registrants/${courseId}`);
};
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">เลือกหลักสูตรเพื่อจัดการผู้ลงทะเบียน</div>

    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 8px;">
      <q-card-section>
        <q-table flat bordered :rows="rows" :columns="columns" row-key="id" separator="horizontal"
          table-header-class="bg-grey-1 text-weight-bold text-dark">
          <template v-slot:body-cell-regCount="props">
            <q-td :props="props">
              <q-badge color="primary" class="q-pa-sm text-weight-bold">{{ props.value }} คน</q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn unelevated color="blue-6" text-color="white" label="ดูรายชื่อ" icon="group" size="sm"
                style="border-radius: 6px;" @click="goToManage(props.row.id)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped>
:deep(.q-table th) {
  font-size: 13px;
  color: #555;
}

:deep(.q-table td) {
  font-size: 14px;
  color: #333;
}
</style>
