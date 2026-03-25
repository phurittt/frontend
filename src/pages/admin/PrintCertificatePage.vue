<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useCertificateStore } from 'src/stores/certificate-store';
import type { CertificateParticipant, ProjectCertificateSummary } from 'src/models/certificate';

const $q = useQuasar();
const certificateStore = useCertificateStore();
const search = ref('');
const filterStatus = ref<'all' | 'managed' | 'unmanaged'>('all');
const filterTime = ref<'all' | 'year' | 'month' | 'week'>('all');

const viewDialog = ref(false);
const selectedSummary = ref<ProjectCertificateSummary | null>(null);
const participants = ref<CertificateParticipant[]>([]);
const isLoadingParticipants = ref(false);

onMounted(() => {
  certificateStore.fetchSummaries();
});

const columns: QTableColumn[] = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center', sortable: true },
  { name: 'year', label: 'ปีงบประมาณ', field: 'year', align: 'center', sortable: true },
  { name: 'courseName', label: 'ชื่อหลักสูตร', field: 'courseName', align: 'left' },
  { name: 'projectName', label: 'โครงการ', field: 'projectName', align: 'left' },
  { name: 'duration', label: 'ระยะเวลา', field: 'duration', align: 'left' },
  { name: 'manager', label: 'ผู้รับผิดชอบ', field: 'manager', align: 'left' },
  { name: 'view_info', label: 'รายชื่อผู้ลงทะเบียน', field: 'view_info', align: 'center' },
  {
    name: 'print_participants',
    label: 'พิมพ์รายชื่อ',
    field: 'print_participants',
    align: 'center',
  },
];

const participantColumns: QTableColumn[] = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center' },
  { name: 'participantName', label: 'ชื่อ-นามสกุล', field: 'participantName', align: 'left' },
  { name: 'department', label: 'หน่วยงาน', field: 'department', align: 'left' },
  { name: 'registrationType', label: 'ประเภทบุคลากร', field: 'registrationType', align: 'center' },
  { name: 'passStatus', label: 'สถานะ', field: 'passStatus', align: 'center' },
  { name: 'certificateCode', label: 'รหัสวุฒิบัตร', field: 'certificateCode', align: 'center' },
];

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const rows = computed(() => {
  let items = certificateStore.summaries;

  if (filterStatus.value === 'managed') {
    items = items.filter((s) => !!s.managedAt);
  } else if (filterStatus.value === 'unmanaged') {
    items = items.filter((s) => !s.managedAt);
  }

  if (filterTime.value !== 'all') {
    const now = new Date();
    items = items.filter((s) => {
      const date = s.trainingStartDate ? new Date(s.trainingStartDate) : null;
      if (!date || isNaN(date.getTime())) return false;
      if (filterTime.value === 'year') return date.getFullYear() === now.getFullYear();
      if (filterTime.value === 'month')
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      if (filterTime.value === 'week') {
        const day = now.getDay() || 7;
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
        const sunday = new Date(
          monday.getFullYear(),
          monday.getMonth(),
          monday.getDate() + 6,
          23,
          59,
          59,
        );
        return date >= monday && date <= sunday;
      }
      return true;
    });
  }

  if (search.value) {
    const q = search.value.toLowerCase();
    items = items.filter(
      (s) => s.courseName.toLowerCase().includes(q) || s.projectName.toLowerCase().includes(q),
    );
  }

  return items.map((s, idx) => ({ ...s, index: idx + 1 }));
});

const viewItem = async (summary: ProjectCertificateSummary) => {
  selectedSummary.value = summary;
  participants.value = [];
  viewDialog.value = true;
  isLoadingParticipants.value = true;
  try {
    const issuance = await certificateStore.fetchProjectIssuance(summary.projectId);
    participants.value = issuance.participants.map((p, i) => ({ ...p, index: i + 1 }));
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถโหลดรายชื่อได้', position: 'top' });
  } finally {
    isLoadingParticipants.value = false;
  }
};

const printParticipants = (summary: ProjectCertificateSummary) => {
  $q.notify({
    type: 'info',
    message: 'กำลังเตรียมพิมพ์รายชื่อผู้ลงทะเบียนอบรมสำหรับ ' + summary.courseName,
    position: 'top',
  });
  // TODO: HTML print / export PDF
};
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">พิมพ์วุฒิบัตร</div>

    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 8px">
      <q-card-section>
        <div class="row items-center q-mb-md q-gutter-x-sm">
          <q-input
            outlined
            dense
            v-model="search"
            placeholder="ค้นหาหลักสูตร / โครงการ..."
            rounded
            bg-color="grey-1"
            style="width: 320px"
          >
            <template v-slot:append><q-icon name="search" color="grey-7" /></template>
          </q-input>

          <q-btn outline color="grey-4" text-color="grey-8" icon="tune" padding="6px 12px">
            <q-tooltip>ตัวกรอง</q-tooltip>
            <q-menu>
              <q-list style="min-width: 180px">
                <q-item
                  v-for="opt in [
                    { label: 'ทั้งหมด', value: 'all' },
                    { label: 'ออกวุฒิบัตรแล้ว', value: 'managed' },
                    { label: 'ยังไม่ออกวุฒิบัตร', value: 'unmanaged' },
                  ]"
                  :key="opt.value"
                  clickable
                  v-close-popup
                  @click="filterStatus = opt.value as any"
                  :active="filterStatus === opt.value"
                  active-class="text-primary text-weight-bold"
                >
                  <q-item-section>{{ opt.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn
            outline
            color="grey-4"
            text-color="grey-8"
            icon="calendar_month"
            padding="6px 16px"
            label="เวลาอบรม"
          >
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item
                  v-for="opt in [
                    { label: 'ทั้งหมด', value: 'all' },
                    { label: 'รายปี (ปีนี้)', value: 'year' },
                    { label: 'รายเดือน (เดือนนี้)', value: 'month' },
                    { label: 'รายสัปดาห์ (สัปดาห์นี้)', value: 'week' },
                  ]"
                  :key="opt.value"
                  clickable
                  v-close-popup
                  @click="filterTime = opt.value as any"
                  :active="filterTime === opt.value"
                  active-class="text-primary text-weight-bold"
                >
                  <q-item-section>{{ opt.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <q-table
          flat
          bordered
          :rows="rows"
          :columns="columns"
          row-key="projectId"
          separator="cell"
          :rows-per-page-options="[10, 20, 50]"
          table-header-class="bg-grey-1 text-weight-bold text-dark"
          :loading="certificateStore.isLoading"
        >
          <template v-slot:body-cell-courseName="props">
            <q-td :props="props" style="max-width: 280px; white-space: normal; line-height: 1.4">
              {{ props.value }}
            </q-td>
          </template>

          <template v-slot:body-cell-view_info="props">
            <q-td :props="props">
              <div class="row justify-center">
                <q-btn
                  @click="viewItem(props.row)"
                  unelevated
                  size="sm"
                  color="light-green-3"
                  text-color="dark"
                  icon="people"
                  style="border-radius: 6px; padding: 6px 10px"
                >
                  <q-tooltip>ดูรายชื่อผู้ลงทะเบียน</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-print_participants="props">
            <q-td :props="props">
              <div class="row justify-center">
                <q-btn
                  @click="printParticipants(props.row)"
                  unelevated
                  size="sm"
                  color="purple-2"
                  text-color="dark"
                  icon="print"
                  style="border-radius: 6px; padding: 6px 10px"
                >
                  <q-tooltip>พิมพ์รายชื่อผู้ลงทะเบียนอบรม</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-lg text-grey-6">
              <q-icon name="folder_open" size="2em" class="q-mr-sm" />
              ไม่พบข้อมูล
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Participant List Dialog -->
    <q-dialog v-model="viewDialog">
      <q-card style="min-width: min(900px, 95vw); border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">รายชื่อผู้ลงทะเบียนอบรม</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md" v-if="selectedSummary">
          <div class="text-subtitle1 text-weight-bold q-mb-md text-primary">
            {{ selectedSummary.courseName }}
          </div>
          <div class="text-caption text-grey-6 q-mb-md">
            โครงการ: {{ selectedSummary.projectName }} | ผู้รับผิดชอบ: {{ selectedSummary.manager }}
          </div>

          <div v-if="isLoadingParticipants" class="text-center q-pa-lg">
            <q-spinner-dots color="primary" size="40px" />
          </div>

          <q-table
            v-else
            flat
            bordered
            :rows="participants"
            :columns="participantColumns"
            row-key="registrantId"
            :rows-per-page-options="[10, 20, 50, 0]"
            table-header-class="bg-grey-1 text-weight-bold"
          >
            <template v-slot:body-cell-passStatus="props">
              <q-td :props="props">
                <q-chip
                  :color="
                    props.value === 'passed'
                      ? 'green-2'
                      : props.value === 'not-passed'
                        ? 'red-2'
                        : 'grey-3'
                  "
                  :text-color="
                    props.value === 'passed'
                      ? 'green-9'
                      : props.value === 'not-passed'
                        ? 'red-9'
                        : 'grey-8'
                  "
                  size="sm"
                  class="text-weight-bold"
                >
                  {{
                    props.value === 'passed'
                      ? 'ผ่าน'
                      : props.value === 'not-passed'
                        ? 'ไม่ผ่าน'
                        : 'รอประเมิน'
                  }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-certificateCode="props">
              <q-td :props="props" class="text-center">
                <span v-if="props.value" class="text-primary text-caption text-weight-bold">
                  {{ props.value }}
                </span>
                <span v-else class="text-grey-4">-</span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
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
</style>
