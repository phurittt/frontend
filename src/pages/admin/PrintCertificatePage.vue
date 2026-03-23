<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useCertificateStore } from 'src/stores/certificate-store';
import type { CertificateIssuance } from 'src/models/certificate';

const $q = useQuasar();
const router = useRouter();
const certificateStore = useCertificateStore();
const search = ref('');
const filterStatus = ref<'all' | 'managed' | 'unmanaged'>('all');

// ตัวแปรสำหรับ Dialog ดูรายละเอียด
const viewDialog = ref(false);
const selectedCertificate = ref<CertificateIssuance | null>(null);

onMounted(() => {
  certificateStore.fetchCertificates();
});

const columns: QTableColumn[] = [
  { name: 'id', label: 'ลำดับ', field: 'index', align: 'center', sortable: true },
  { name: 'year', label: 'ปีงบประมาณ', field: 'year', align: 'center', sortable: true },
  { name: 'courseName', label: 'ชื่อหลักสูตร', field: 'courseName', align: 'left' },
  { name: 'project', label: 'โครงการ', field: 'project', align: 'left' },
  { name: 'duration', label: 'ระยะเวลา', field: 'duration', align: 'left' },
  { name: 'regis_open', label: 'เปิดลงทะเบียน', field: 'regis_open', align: 'center' },
  { name: 'regis_close', label: 'ปิดลงทะเบียน', field: 'regis_close', align: 'center' },
  { name: 'training_date', label: 'อบรมวันที่', field: 'training_date', align: 'center' },
  { name: 'manager', label: 'ผู้รับผิดชอบ', field: 'manager', align: 'left' },
  { name: 'view_info', label: 'รายชื่อผู้ลงทะเบียน', field: 'view_info', align: 'center' },
  {
    name: 'print_participants',
    label: 'พิมพ์รายชื่อผู้ลงทะเบียนอบรม',
    field: 'print_participants',
    align: 'center',
  },
];

const participantColumns: QTableColumn[] = [
  { name: 'id', label: 'ลำดับ', field: (row) => row.id, align: 'center' },
  { name: 'participantName', label: 'ชื่อ-นามสกุล', field: 'participantName', align: 'left' },
  { name: 'department', label: 'หน่วยงาน', field: 'department', align: 'left' },
  { name: 'registrationType', label: 'ประเภทบุคลากร', field: 'registrationType', align: 'center' },
  { name: 'passStatus', label: 'สถานะ', field: 'passStatus', align: 'center' },
];

const rows = computed(() => {
  let certs = certificateStore.certificates;

  if (filterStatus.value === 'managed') {
    certs = certs.filter((c) => !!c.managedAt);
  } else if (filterStatus.value === 'unmanaged') {
    certs = certs.filter((c) => !c.managedAt);
  }

  return certs.map((cert, idx) => ({
    rawId: cert.id,
    index: idx + 1,
    year: cert.year || '-',
    courseName: cert.courseName || 'ไม่ได้ระบุชื่อหลักสูตร',
    project: cert.project || '-',
    duration: cert.duration || '-',
    regis_open: cert.regisOpenDate || '-',
    regis_close: cert.regisCloseDate || '-',
    training_date: cert.trainingDate || '-',
    manager: cert.manager || '-',
    _raw: cert,
  }));
});

// ฟังก์ชันดูรายละเอียด
const viewItem = (certificate: CertificateIssuance) => {
  selectedCertificate.value = certificate;
  viewDialog.value = true;
};

// ฟังก์ชันพิมพ์รายชื่อผู้ลงทะเบียนอบรม
const printParticipants = (certificate: CertificateIssuance) => {
  $q.notify({
    type: 'info',
    message: 'กำลังเตรียมพิมพ์รายชื่อผู้ลงทะเบียนอบรมสำหรับ ' + certificate.courseName,
    position: 'top',
  });
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
            placeholder="ค้นหาหลักสูตร..."
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
                  clickable
                  v-close-popup
                  @click="filterStatus = 'all'"
                  :active="filterStatus === 'all'"
                  active-class="text-primary text-weight-bold"
                >
                  <q-item-section>ทั้งหมด</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="filterStatus = 'managed'"
                  :active="filterStatus === 'managed'"
                  active-class="text-primary text-weight-bold"
                >
                  <q-item-section>ออกวุฒิบัตรแล้ว</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="filterStatus = 'unmanaged'"
                  :active="filterStatus === 'unmanaged'"
                  active-class="text-primary text-weight-bold"
                >
                  <q-item-section>ยังไม่ออกวุฒิบัตร</q-item-section>
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
          row-key="rawId"
          separator="cell"
          :filter="search"
          :rows-per-page-options="[10, 20, 50]"
          table-header-class="bg-grey-1 text-weight-bold text-dark"
        >
          <template v-slot:body-cell-courseName="props">
            <q-td :props="props" style="max-width: 280px; white-space: normal; line-height: 1.4">{{
              props.value
            }}</q-td>
          </template>

          <template v-slot:body-cell-duration="props">
            <q-td :props="props" style="white-space: normal; font-size: 12px">
              {{ props.value }}
            </q-td>
          </template>

          <template v-slot:body-cell-view_info="props">
            <q-td :props="props">
              <div class="row justify-center">
                <q-btn
                  @click="viewItem(props.row._raw)"
                  unelevated
                  size="sm"
                  color="light-green-3"
                  text-color="dark"
                  icon="search"
                  style="border-radius: 6px; padding: 6px 10px"
                  ><q-tooltip>ดูรายชื่อผู้ลงทะเบียน</q-tooltip></q-btn
                >
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-print_participants="props">
            <q-td :props="props">
              <div class="row justify-center">
                <q-btn
                  @click="printParticipants(props.row._raw)"
                  unelevated
                  size="sm"
                  color="purple-2"
                  text-color="dark"
                  icon="print"
                  style="border-radius: 6px; padding: 6px 10px"
                  ><q-tooltip>พิมพ์รายชื่อผู้ลงทะเบียนอบรม</q-tooltip></q-btn
                >
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="viewDialog">
      <q-card style="min-width: 800px; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">รายชื่อผู้ลงทะเบียนอบรม</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md" v-if="selectedCertificate">
          <div class="text-subtitle1 text-weight-bold q-mb-md text-primary">
            หลักสูตร: {{ selectedCertificate.courseName }}
          </div>
          <q-table
            flat
            bordered
            :rows="selectedCertificate.participants"
            :columns="participantColumns"
            row-key="id"
            :rows-per-page-options="[10, 20, 50]"
            table-header-class="bg-grey-1 text-weight-bold"
          >
            <template v-slot:body-cell-passStatus="props">
              <q-td :props="props">
                <q-chip
                  :color="props.value === 'passed' ? 'green-2' : 'red-2'"
                  :text-color="props.value === 'passed' ? 'green-9' : 'red-9'"
                  size="sm"
                  class="text-weight-bold"
                >
                  {{ props.value === 'passed' ? 'ผ่าน' : 'ไม่ผ่าน' }}
                </q-chip>
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
