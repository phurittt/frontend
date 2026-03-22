<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useReportStore } from 'src/stores/report-store';

const $q = useQuasar();
const reportStore = useReportStore();

onMounted(() => {
  reportStore.fetchInitialReportData();
});

const yearOptions = ['2567', '2568', '2569'];
const typeOptions = [
  { label: 'ทั้งหมด', value: '' },
  { label: 'ออนไลน์', value: 'online' },
  { label: 'อบรมในที่ตั้ง (Onsite)', value: 'onsite' },
];

const activeTab = ref('summary');

// ==========================================
// 📍 Table Configurations
// ==========================================
const summaryColumns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center' as const },
  { name: 'projectName', label: 'ชื่อโครงการ', field: 'projectName', align: 'left' as const },
  { name: 'date', label: 'วันที่จัดโครงการ', field: 'date', align: 'center' as const },
  { name: 'format', label: 'รูปแบบการจัด', field: 'format', align: 'center' as const },
  { name: 'registered', label: 'ผู้ลงทะเบียน', field: 'registered', align: 'center' as const },
  { name: 'attended', label: 'ผู้เข้าร่วมจริง', field: 'attended', align: 'center' as const },
];

const lecturerColumns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center' as const },
  { name: 'lecturerName', label: 'ชื่อวิทยากร', field: 'lecturerName', align: 'left' as const },
  { name: 'lecturerType', label: 'ประเภท', field: 'lecturerType', align: 'center' as const },
  { name: 'courseName', label: 'หลักสูตรที่สอน', field: 'courseName', align: 'left' as const },
  { name: 'projectName', label: 'ในโครงการ', field: 'projectName', align: 'left' as const },
  { name: 'teachingDate', label: 'วันที่สอน', field: 'teachingDate', align: 'center' as const },
];

const financeColumns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center' as const },
  { name: 'projectName', label: 'ชื่อโครงการ', field: 'projectName', align: 'left' as const },
  { name: 'format', label: 'รูปแบบ', field: 'format', align: 'center' as const },
  {
    name: 'totalAttendees',
    label: 'ผู้เข้าร่วม (คน)',
    field: 'totalAttendees',
    align: 'center' as const,
  },
  { name: 'income', label: 'รายรับ (บาท)', field: 'income', align: 'right' as const },
  { name: 'expense', label: 'รายจ่าย (บาท)', field: 'expense', align: 'right' as const },
  { name: 'profit', label: 'คงเหลือ (บาท)', field: 'profit', align: 'right' as const },
];

// Computed Data
const summaryRows = computed(() => reportStore.summaryReportData);
const lecturerRows = computed(() => reportStore.lecturerReportData);
const financeRows = computed(() => reportStore.financeReportData);

// Format Number (สำหรับโชว์เงินบาท)
const formatMoney = (val: number) => new Intl.NumberFormat('th-TH').format(val);

// Actions
const exportToExcel = () => {
  $q.notify({
    type: 'positive',
    icon: 'table_view',
    message: `Export ข้อมูลรายงานปี ${reportStore.filters.year} สำเร็จ`,
  });
};
const printReport = () => {
  setTimeout(() => window.print(), 500);
};
</script>

<template>
  <q-page class="q-pa-md q-pa-lg-xl bg-grey-1">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-icon name="assessment" size="lg" color="primary" class="q-mr-sm" />
        <h1 class="text-h5 text-weight-bold text-dark q-my-none tracking-tight">
          ระบบรายงาน (Report Dashboard)
        </h1>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          unelevated
          color="green-7"
          icon="description"
          label="Export เป็น Excel"
          no-caps
          class="text-weight-bold"
          style="border-radius: 8px"
          @click="exportToExcel"
        />
        <q-btn
          outline
          color="grey-8"
          icon="print"
          label="พิมพ์ / Export PDF"
          no-caps
          class="text-weight-bold bg-white"
          style="border-radius: 8px"
          @click="printReport"
        />
      </div>
    </div>

    <q-card
      flat
      bordered
      class="bg-white q-mb-md q-pa-md"
      style="border-radius: 12px; border: 1px solid #e0e0e0"
    >
      <div class="text-subtitle2 text-weight-bold text-dark q-mb-sm">ตัวกรองข้อมูลรายงาน</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3">
          <q-select
            outlined
            dense
            v-model="reportStore.filters.year"
            :options="yearOptions"
            label="ปีงบประมาณ *"
            bg-color="white"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            outlined
            dense
            v-model="reportStore.filters.type"
            :options="typeOptions"
            emit-value
            map-options
            label="รูปแบบโครงการ"
            bg-color="white"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            outlined
            dense
            v-model="reportStore.filters.search"
            placeholder="ค้นหาชื่อโครงการ..."
            bg-color="white"
            clearable
          >
            <template v-slot:append><q-icon name="search" color="grey-6" /></template>
          </q-input>
        </div>
      </div>
    </q-card>

    <q-card
      flat
      bordered
      class="bg-white"
      style="border-radius: 12px; border: 1px solid #e0e0e0; overflow: hidden"
    >
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-7 bg-grey-2"
        active-color="primary"
        active-bg-color="white"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="summary" label="ภาพรวมรายปี" class="text-weight-bold" />
        <q-tab name="attendance" label="ใบเซ็นชื่อ" class="text-weight-bold" />
        <q-tab name="certificate" label="ทะเบียนวุฒิบัตร" class="text-weight-bold" />
        <q-tab name="lecturer" label="ประวัติวิทยากร" class="text-weight-bold" />
        <q-tab name="finance" label="สรุปการเงิน" class="text-weight-bold" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="activeTab" animated class="bg-white">
        <q-tab-panel name="summary" class="q-pa-none">
          <q-table
            flat
            :rows="summaryRows"
            :columns="summaryColumns"
            row-key="id"
            separator="cell"
            :pagination="{ rowsPerPage: 15 }"
            table-header-class="bg-blue-grey-1 text-weight-bold text-dark"
            hide-pagination
          >
            <template v-slot:body-cell-format="props">
              <q-td :props="props"
                ><q-chip
                  :color="props.row.format === 'ออนไลน์' ? 'blue-1' : 'orange-1'"
                  :text-color="props.row.format === 'ออนไลน์' ? 'blue-8' : 'orange-9'"
                  size="sm"
                  class="text-weight-bold"
                  square
                  >{{ props.row.format }}</q-chip
                ></q-td
              >
            </template>
            <template v-slot:body-cell-registered="props"
              ><q-td :props="props"
                ><span class="text-weight-bold text-primary"
                  >{{ props.row.registered }} คน</span
                ></q-td
              ></template
            >
            <template v-slot:body-cell-attended="props"
              ><q-td :props="props"
                ><span class="text-weight-bold text-green-7"
                  >{{ props.row.attended }} คน</span
                ></q-td
              ></template
            >
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="attendance" class="q-pa-xl text-center">
          <q-icon name="how_to_reg" size="xl" color="grey-4" class="q-mb-md" />
          <div class="text-h6 text-grey-6">ระบบจัดการใบเซ็นชื่อเข้าอบรม</div>
          <div class="text-body2 text-grey-5 q-mb-md">
            ข้อมูลพร้อมใช้งานตามโครงการปี {{ reportStore.filters.year }}
          </div>
        </q-tab-panel>

        <q-tab-panel name="certificate" class="q-pa-xl text-center">
          <q-icon name="card_membership" size="xl" color="grey-4" class="q-mb-md" />
          <div class="text-h6 text-grey-6">ทะเบียนคุมวุฒิบัตร</div>
        </q-tab-panel>

        <q-tab-panel name="lecturer" class="q-pa-none">
          <q-table
            flat
            :rows="lecturerRows"
            :columns="lecturerColumns"
            row-key="id"
            separator="cell"
            :pagination="{ rowsPerPage: 15 }"
            table-header-class="bg-blue-grey-1 text-weight-bold text-dark"
            hide-pagination
          >
            <template v-slot:body-cell-lecturerType="props">
              <q-td :props="props"
                ><q-chip
                  :color="props.row.lecturerType === 'ภายใน' ? 'purple-1' : 'teal-1'"
                  :text-color="props.row.lecturerType === 'ภายใน' ? 'purple-8' : 'teal-8'"
                  size="sm"
                  class="text-weight-bold"
                  square
                  >{{ props.row.lecturerType }}</q-chip
                ></q-td
              >
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="finance" class="q-pa-none">
          <q-table
            flat
            :rows="financeRows"
            :columns="financeColumns"
            row-key="id"
            separator="cell"
            :pagination="{ rowsPerPage: 15 }"
            table-header-class="bg-blue-grey-1 text-weight-bold text-dark"
            hide-pagination
          >
            <template v-slot:body-cell-income="props"
              ><q-td :props="props" class="text-green-8 text-weight-bold">{{
                formatMoney(props.row.income)
              }}</q-td></template
            >
            <template v-slot:body-cell-expense="props"
              ><q-td :props="props" class="text-red-8">{{
                formatMoney(props.row.expense)
              }}</q-td></template
            >
            <template v-slot:body-cell-profit="props">
              <q-td
                :props="props"
                :class="
                  props.row.profit >= 0
                    ? 'text-primary text-weight-bold'
                    : 'text-red-9 text-weight-bold'
                "
              >
                {{ formatMoney(props.row.profit) }}
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<style scoped lang="scss">
.tracking-tight {
  letter-spacing: -0.5px;
}
:deep(.q-table th) {
  font-size: 14px;
  color: #333;
}
:deep(.q-table td) {
  font-size: 14px;
  color: #333;
}
@media print {
  .q-page {
    padding: 0 !important;
    background: white !important;
  }
  .q-card {
    border: none !important;
    box-shadow: none !important;
  }
  .q-btn,
  .q-tabs,
  .q-input,
  .q-select,
  .text-subtitle2 {
    display: none !important;
  }
  .text-h5 {
    text-align: center;
    margin-bottom: 20px;
  }
}
</style>
