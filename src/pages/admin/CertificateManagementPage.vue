<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { QTableColumn } from 'quasar';
import { useRouter } from 'vue-router';
import { useCertificateStore } from 'src/stores/certificate-store';
import type { ProjectCertificateSummary } from 'src/models/certificate';

const router = useRouter();
const certificateStore = useCertificateStore();
const search = ref('');
const filterStatus = ref<'all' | 'managed' | 'unmanaged'>('all');
const filterTime = ref<'all' | 'year' | 'month' | 'week'>('all');

const viewDialog = ref(false);
const selectedSummary = ref<ProjectCertificateSummary | null>(null);

onMounted(() => {
  certificateStore.fetchSummaries();
});

const columns: QTableColumn[] = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center', sortable: true },
  { name: 'year', label: 'ปีงบประมาณ', field: 'year', align: 'center', sortable: true },
  { name: 'courseName', label: 'ชื่อหลักสูตร', field: 'courseName', align: 'left' },
  { name: 'projectName', label: 'โครงการ', field: 'projectName', align: 'left' },
  { name: 'duration', label: 'ระยะเวลา', field: 'duration', align: 'center' },
  { name: 'regis_open', label: 'เปิดลงทะเบียน', field: 'regisOpen', align: 'center' },
  { name: 'regis_close', label: 'ปิดลงทะเบียน', field: 'regisClose', align: 'center' },
  { name: 'training_date', label: 'อบรมวันที่', field: 'trainingDate', align: 'center' },
  { name: 'manager', label: 'ผู้รับผิดชอบ', field: 'manager', align: 'left' },
  {
    name: 'manage_certificate',
    label: 'จัดการการออกวุฒิบัตร',
    field: 'manage_certificate',
    align: 'center',
  },
  { name: 'view_info', label: 'ข้อมูลการออกวุฒิบัตร', field: 'view_info', align: 'center' },
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

  return items.map((s, idx) => ({
    ...s,
    index: idx + 1,
    regisOpen: formatDate(s.regisOpenDate),
    regisClose: formatDate(s.regisCloseDate),
    trainingDate: s.trainingStartDate
      ? formatDate(s.trainingStartDate) +
        (s.trainingEndDate ? ` – ${formatDate(s.trainingEndDate)}` : '')
      : '-',
  }));
});

const goToIssuance = (summary: ProjectCertificateSummary) => {
  router.push({ name: 'certificate-issuance', params: { projectId: summary.projectId } });
};

const viewInfo = (summary: ProjectCertificateSummary) => {
  selectedSummary.value = summary;
  viewDialog.value = true;
};
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการวุฒิบัตร</div>

    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 8px">
      <q-card-section>
        <!-- Filters -->
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

          <q-space />
          <q-btn
            v-if="certificateStore.isLoading"
            flat
            round
            icon="refresh"
            color="grey-6"
            loading
          />
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
            <q-td :props="props" style="max-width: 240px; white-space: normal; line-height: 1.4">
              {{ props.value }}
            </q-td>
          </template>

          <template v-slot:body-cell-projectName="props">
            <q-td :props="props" style="max-width: 200px; white-space: normal; line-height: 1.4">
              {{ props.value }}
            </q-td>
          </template>

          <template v-slot:body-cell-manage_certificate="props">
            <q-td :props="props">
              <div class="row justify-center items-center">
                <template v-if="props.row.managedAt">
                  <div class="column items-center">
                    <q-chip dense color="positive" text-color="white" icon="check_circle" size="sm">
                      ออกวุฒิบัตรแล้ว
                    </q-chip>
                    <span class="text-caption text-grey-6 q-mt-xs">
                      {{
                        new Date(props.row.managedAt).toLocaleDateString('th-TH', {
                          timeZone: 'Asia/Bangkok',
                        })
                      }}
                    </span>
                    <q-btn
                      flat
                      dense
                      size="xs"
                      color="primary"
                      label="แก้ไข"
                      @click="goToIssuance(props.row)"
                      class="q-mt-xs"
                    />
                  </div>
                </template>
                <template v-else>
                  <q-btn
                    @click="goToIssuance(props.row)"
                    unelevated
                    size="sm"
                    color="primary"
                    text-color="white"
                    icon="edit_note"
                    label="จัดการ"
                    style="border-radius: 6px"
                  />
                </template>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-view_info="props">
            <q-td :props="props">
              <div class="row justify-center">
                <q-btn
                  @click="viewInfo(props.row)"
                  unelevated
                  size="sm"
                  color="light-green-3"
                  text-color="dark"
                  icon="info"
                  style="border-radius: 6px; padding: 6px 10px"
                >
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
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

    <!-- View Info Dialog -->
    <q-dialog v-model="viewDialog">
      <q-card style="min-width: 560px; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">ข้อมูลการออกวุฒิบัตร</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md" v-if="selectedSummary">
          <div class="row q-mb-sm">
            <div class="col-5 text-grey-7 text-weight-bold">หลักสูตร:</div>
            <div class="col-7">{{ selectedSummary.courseName }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-5 text-grey-7 text-weight-bold">โครงการ:</div>
            <div class="col-7">{{ selectedSummary.projectName }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-5 text-grey-7 text-weight-bold">ปีงบประมาณ:</div>
            <div class="col-7">{{ selectedSummary.year }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-5 text-grey-7 text-weight-bold">ผู้รับผิดชอบ:</div>
            <div class="col-7">{{ selectedSummary.manager }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-5 text-grey-7 text-weight-bold">ผู้ลงทะเบียน:</div>
            <div class="col-7">{{ selectedSummary.totalRegistrations }} คน</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-5 text-grey-7 text-weight-bold">เข้าอบรม:</div>
            <div class="col-7">
              <q-chip dense color="positive" text-color="white" size="sm">
                {{ selectedSummary.participantSummary.attended }} คน
              </q-chip>
              <q-chip dense color="negative" text-color="white" size="sm" class="q-ml-xs">
                ไม่มา {{ selectedSummary.participantSummary.notAttended }} คน
              </q-chip>
              <q-chip dense color="grey" text-color="white" size="sm" class="q-ml-xs">
                ยกเลิก {{ selectedSummary.participantSummary.cancelled }} คน
              </q-chip>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-5 text-grey-7 text-weight-bold">สถานะวุฒิบัตร:</div>
            <div class="col-7">
              <q-chip
                dense
                :color="selectedSummary.managedAt ? 'positive' : 'warning'"
                text-color="white"
                size="sm"
              >
                {{ selectedSummary.managedAt ? 'ออกวุฒิบัตรแล้ว' : 'ยังไม่ออกวุฒิบัตร' }}
              </q-chip>
            </div>
          </div>
          <div class="row q-mb-sm" v-if="selectedSummary.managedAt">
            <div class="col-5 text-grey-7 text-weight-bold">ออกเมื่อ:</div>
            <div class="col-7">
              {{
                new Date(selectedSummary.managedAt).toLocaleString('th-TH', {
                  timeZone: 'Asia/Bangkok',
                })
              }}
              <span v-if="selectedSummary.managedBy"> โดย {{ selectedSummary.managedBy }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            flat
            label="ไปจัดการ"
            color="primary"
            @click="
              goToIssuance(selectedSummary!);
              viewDialog = false;
            "
          />
          <q-btn flat label="ปิด" v-close-popup />
        </q-card-actions>
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
