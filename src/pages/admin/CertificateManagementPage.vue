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
  { name: 'duration', label: 'ระยะเวลา', field: 'duration', align: 'left' },
  { name: 'regis_open', label: 'เปิดลงทะเบียน', field: 'regis_open', align: 'center' },
  { name: 'regis_close', label: 'ปิดลงทะเบียน', field: 'regis_close', align: 'center' },
  { name: 'manager', label: 'ผู้รับผิดชอบ', field: 'manager', align: 'left' },
  {
    name: 'manage_certificate',
    label: 'จัดการการออกวุฒิบัตร',
    field: 'manage_certificate',
    align: 'center',
  },
  {
    name: 'register_certificate',
    label: 'ทะเบียนคุมวุฒิบัตร',
    field: 'register_certificate',
    align: 'center',
  },
  { name: 'view_info', label: 'ข้อมูลการออกวุฒิบัตร', field: 'view_info', align: 'center' },
];

const rows = computed(() => {
  return certificateStore.certificates.map((cert, idx) => ({
    rawId: cert.id,
    index: idx + 1,
    year: cert.year || '-',
    courseName: cert.courseName || 'ไม่ได้ระบุชื่อหลักสูตร',
    duration: cert.duration || '-',
    regis_open: cert.regisOpenDate || '-',
    regis_close: cert.regisCloseDate || '-',
    manager: cert.manager || '-',
    _raw: cert,
  }));
});

// ฟังก์ชันดูรายละเอียด
const viewItem = (certificate: CertificateIssuance) => {
  selectedCertificate.value = certificate;
  viewDialog.value = true;
};

// ฟังก์ชันแก้ไขการออกวุฒิบัตร
const editCertificateIssuance = (certificate: CertificateIssuance) => {
  certificateStore.setCertificateData(certificate);
  router.push({
    name: 'certificate-issuance',
    params: { courseId: certificate.courseId },
  });
};

// ฟังก์ชันพิมพ์ทะเบียนคุมวุฒิบัตร
const printCertificateRegister = (certificate: CertificateIssuance) => {
  $q.notify({
    type: 'info',
    message: 'กำลังเตรียมพิมพ์ทะเบียนคุมวุฒิบัตรสำหรับ ' + certificate.courseName,
    position: 'top',
  });
  // TODO: ใช้งานจริง เพิ่มฟังก์ชั่นพิมพ์
};
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการวุฒิบัตร</div>

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

          <q-btn outline color="grey-4" text-color="grey-8" icon="tune" padding="6px 12px"
            ><q-tooltip>ตัวกรอง</q-tooltip></q-btn
          >
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

          <template v-slot:body-cell-register_certificate="props">
            <q-td :props="props">
              <div class="row justify-center">
                <q-btn
                  @click="printCertificateRegister(props.row._raw)"
                  unelevated
                  size="sm"
                  color="light-blue-1"
                  text-color="dark"
                  icon="print"
                  style="border-radius: 6px; padding: 6px 10px"
                  ><q-tooltip>พิมพ์ทะเบียนคุมวุฒิบัตร</q-tooltip></q-btn
                >
              </div>
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
                  ><q-tooltip>ดูรายละเอียดข้อมูลการออกวุฒิบัตร</q-tooltip></q-btn
                >
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-manage_certificate="props">
            <q-td :props="props">
              <div class="row justify-center items-center">
                <template v-if="props.row._raw.managedAt">
                  <span
                    class="text-caption text-grey-8"
                    style="font-size: 12px; line-height: 1.4; white-space: normal; max-width: 250px"
                  >
                    ออกวุฒิบัตรเรียบร้อย ณ วันที่ {{ props.row._raw.managedAt }} เวลา
                    {{ props.row._raw.managedTime }} โดย {{ props.row._raw.managedBy }}
                  </span>
                </template>
                <template v-else>
                  <q-btn
                    @click="editCertificateIssuance(props.row._raw)"
                    unelevated
                    size="sm"
                    color="light-blue-1"
                    text-color="dark"
                    icon="edit"
                    style="border-radius: 6px; padding: 6px 10px"
                  >
                    <q-tooltip>จัดการการออกวุฒิบัตร</q-tooltip>
                  </q-btn>
                </template>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="viewDialog">
      <q-card style="min-width: 600px; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">ข้อมูลการออกวุฒิบัตร</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md" v-if="selectedCertificate">
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">ชื่อหลักสูตร:</div>
            <div class="col-7">{{ selectedCertificate.courseName }}</div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">ปีงบประมาณ:</div>
            <div class="col-7">{{ selectedCertificate.year }}</div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">ผู้รับผิดชอบ:</div>
            <div class="col-7">{{ selectedCertificate.manager }}</div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">จำนวนผู้ลงทะเบียน:</div>
            <div class="col-7">
              {{ selectedCertificate.participantSummary.attended }} คน มา
              {{ selectedCertificate.participantSummary.attended }} ไม่มา
              {{ selectedCertificate.participantSummary.notAttended }} ยกเลิก
              {{ selectedCertificate.participantSummary.cancelled }}
            </div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">สถานะการสร้างไฟล์:</div>
            <div class="col-7">
              {{
                selectedCertificate.certificateStatus.status === 'create'
                  ? 'สร้างไฟล์'
                  : 'ไม่สร้างไฟล์'
              }}
            </div>
          </div>
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
