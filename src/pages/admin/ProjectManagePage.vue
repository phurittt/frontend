<script setup lang="ts">
import { ref } from 'vue';
import type { QTableColumn } from 'quasar'; // <--- 1. เพิ่มบรรทัดนี้

// Mock Data สำหรับตาราง
const columns: QTableColumn[] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'left', sortable: true },
  { name: 'year', label: 'ปีงบประมาณ', field: 'year', align: 'center', sortable: true },
  { name: 'name', label: 'ชื่อโครงการ', field: 'name', align: 'left' },
  { name: 'duration', label: 'ระยะเวลา', field: 'duration', align: 'left' },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' },
];

const rows = [
  {
    id: 1,
    year: '2569',
    name: 'โครงการพัฒนาทักษะดิจิทัลสำหรับบุคลากร...',
    duration: '27-01-2569 ถึง 27-01-2569',
    status: 'เปิด'
  },
  {
    id: 2,
    year: '2569',
    name: 'หลักสูตรอบรมเชิงปฏิบัติการ Vue.js Framework',
    duration: '15-02-2569 ถึง 16-02-2569',
    status: 'เปิด'
  },
  // ... เพิ่มข้อมูลจำลองได้
];

const search = ref('');
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการโครงการและหลักสูตร</div>

    <q-card flat bordered class="bg-white">
      <q-card-section>
        <div class="row q-col-gutter-sm justify-between items-center q-mb-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="search" placeholder="ค้นหาวิทยากร" rounded>
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto row q-gutter-sm">
            <q-btn outline color="grey-7" icon="tune" />
            <q-btn unelevated color="grey-9" text-color="white" label="เพิ่มประเภทหลักสูตรใหม่" icon="add" no-caps />
          </div>
        </div>

        <q-table flat :rows="rows" :columns="columns" row-key="id" separator="horizontal">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-xs">
              <q-btn unelevated round size="sm" color="light-green-13" text-color="white" icon="search" />
              <q-btn unelevated round size="sm" color="light-blue-4" text-color="white" icon="edit" />
              <q-btn unelevated round size="sm" color="pink-4" text-color="white" icon="delete" />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <div class="row items-center justify-center">
                <span>{{ props.value }}</span>
                <q-toggle v-model="props.row.isActive" color="green" dense size="sm" class="q-ml-sm" />
              </div>
            </q-td>
          </template>

        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>
