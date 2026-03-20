<script setup lang="ts">
import { ref, computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useProjectStore } from 'src/stores/project-store';

const projectStore = useProjectStore();
const search = ref('');

const columns: QTableColumn[] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'center', sortable: true },
  { name: 'year', label: 'ปีงบประมาณ', field: 'year', align: 'center', sortable: true },
  { name: 'name', label: 'ชื่อโครงการ', field: 'name', align: 'left' },
  { name: 'duration', label: 'ระยะเวลา', field: 'duration', align: 'left' },
  { name: 'regis_open', label: 'เปิดลงทะเบียน', field: 'regis_open', align: 'left' },
  { name: 'regis_close', label: 'ปิดลงทะเบียน', field: 'regis_close', align: 'left' },
  { name: 'manager', label: 'ผู้รับผิดชอบ', field: 'manager', align: 'left' },
  { name: 'course_count', label: 'จำนวนหลักสูตร', field: 'course_count', align: 'center' },
  { name: 'ask_food', label: 'สอบถามเรื่องอาหาร', field: 'ask_food', align: 'center' },
  { name: 'status', label: 'สถานะการเปิดอบรม', field: 'status', align: 'center' },
  { name: 'show_on_web', label: 'การแสดงผลบนหน้าเว็บ', field: 'show_on_web', align: 'center' },
  { name: 'actions', label: 'ดูรายละเอียดและการจัดการ', field: 'actions', align: 'center' },
];

// ข้อมูลจำลอง (Mock Data) เดิมที่มีอยู่แล้ว
const defaultMockRows = [
  {
    id: 1, year: '2569',
    name: 'โครงการพัฒนาทักษะดิจิทัลสำหรับบุคลากรกองกิจการนิสิต Unlock Potential พลิกโฉมงานกองกิจการนิสิตยุคใหม่ด้วย Generative AI',
    duration: '27-01-2569 ถึง 27-01-2569',
    regis_open: '27-01-2569 08:30 น.',
    regis_close: '27-01-2569 10:00 น.',
    manager: 'อนุทิน ชาญชัย', course_count: 1, ask_food: 'ไม่สอบถาม', status: 'เปิด', show_on_web: false,
  },
  {
    id: 2, year: '2569',
    name: 'โครงการอบรมเชิงปฏิบัติการ การใช้งานระบบ ERP',
    duration: '15-02-2569 ถึง 16-02-2569',
    regis_open: '01-02-2569 08:30 น.',
    regis_close: '10-02-2569 16:00 น.',
    manager: 'สมชาย ใจดี', course_count: 2, ask_food: 'สอบถาม', status: 'เปิด', show_on_web: true,
  }
];

// รวมข้อมูลที่ดึงจาก Store (ที่เพิ่งกดเพิ่ม) เข้ากับข้อมูล Mock เดิม
const rows = computed(() => {
  // แปลงโครงสร้างข้อมูลจาก Store ให้เข้ากับตาราง
  const storeRows = projectStore.projects.map((p, index) => ({
    id: `NEW-${index + 1}`, // ทำสัญลักษณ์ว่าเป็นอันใหม่
    year: p.projectData.year || '-',
    name: p.projectData.projectName || 'ไม่ได้ระบุชื่อโครงการ',
    duration: `${p.projectData.dateFrom || '-'} ถึง ${p.projectData.dateTo || '-'}`,
    regis_open: `${p.projectData.regisOpenDate || '-'} ${p.projectData.timeFrom || '-'} น.`,
    regis_close: `${p.projectData.regisCloseDate || '-'} ${p.projectData.timeTo || '-'} น.`,
    manager: p.projectData.manager?.label || '-',
    course_count: p.courses.length,
    ask_food: p.projectData.askFood ? 'สอบถาม' : 'ไม่สอบถาม',
    status: p.projectData.isOpen ? 'เปิด' : 'ปิด',
    show_on_web: false,
  }));

  // นำอันใหม่ไว้บนสุด แล้วต่อด้วยอันเก่า
  return [...storeRows, ...defaultMockRows];
});
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการโครงการและหลักสูตร</div>

    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 8px;">
      <q-card-section>

        <div class="row items-center q-mb-md q-gutter-x-sm">
          <q-input outlined dense v-model="search" placeholder="ค้นหาโครงการ..." rounded bg-color="grey-1"
            style="width: 320px;">
            <template v-slot:append><q-icon name="search" color="grey-7" /></template>
          </q-input>

          <q-btn outline color="grey-4" text-color="grey-8" icon="tune" padding="6px 12px">
            <q-tooltip>ตัวกรอง</q-tooltip>
          </q-btn>

          <q-btn unelevated color="grey-8" text-color="white" label="เพิ่มโครงการใหม่" no-caps
            class="q-px-md text-weight-medium" to="/admin/projects/add" />
        </div>

        <q-table flat bordered :rows="rows" :columns="columns" row-key="id" separator="cell" :filter="search"
          :rows-per-page-options="[10, 20, 50]" table-header-class="bg-grey-1 text-weight-bold text-dark">
          <template v-slot:body-cell-name="props">
            <q-td :props="props" style="max-width: 320px; white-space: normal; line-height: 1.4;">
              <q-badge v-if="String(props.row.id).includes('NEW')" color="green" class="q-mr-sm">ใหม่</q-badge>
              {{ props.value }}
            </q-td>
          </template>

          <template v-slot:body-cell-duration="props">
            <q-td :props="props">
              <div>{{ props.row.duration.split(' ถึง ')[0] }} ถึง</div>
              <div>{{ props.row.duration.split(' ถึง ')[1] }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-regis_open="props">
            <q-td :props="props">
              <div>{{ props.row.regis_open.split(' ')[0] }}</div>
              <div>{{ props.row.regis_open.split(' ')[1] || '' }} น.</div>
            </q-td>
          </template>

          <template v-slot:body-cell-regis_close="props">
            <q-td :props="props">
              <div>{{ props.row.regis_close.split(' ')[0] }}</div>
              <div>{{ props.row.regis_close.split(' ')[1] || '' }} น.</div>
            </q-td>
          </template>

          <template v-slot:body-cell-show_on_web="props">
            <q-td :props="props">
              <q-checkbox v-model="props.row.show_on_web" dense color="primary" />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row justify-center q-gutter-x-sm no-wrap">
                <q-btn unelevated size="sm" color="light-green-3" text-color="dark" icon="search"
                  style="border-radius: 6px; padding: 6px 10px;">
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-btn>
                <q-btn unelevated size="sm" color="light-blue-1" text-color="dark" icon="edit"
                  style="border-radius: 6px; padding: 6px 10px;">
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-btn>
                <q-btn unelevated size="sm" color="pink-1" text-color="dark" icon="delete"
                  style="border-radius: 6px; padding: 6px 10px;">
                  <q-tooltip>ลบ</q-tooltip>
                </q-btn>
              </div>
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
  text-align: center !important;
}

:deep(.q-table td) {
  font-size: 13px;
  color: #333;
}

:deep(.q-table tbody td),
:deep(.q-table thead th) {
  border-color: #f0f0f0 !important;
}
</style>
