<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { useCertificateStore } from 'src/stores/certificate-store';
import type { CertificateIssuance, CertificateParticipant } from 'src/models/certificate';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const certificateStore = useCertificateStore();

const courseId = computed(() => parseInt(route.params.courseId as string));
const certificateData = ref<CertificateIssuance | null>(null);
const certificateFileStatus = ref<'create' | 'no-create'>('no-create');
const certificateImageFile = ref<File | null>(null);
const certificateImagePreview = ref<string>('');

onMounted(() => {
  const cert =
    certificateStore.selectedCertificate ||
    certificateStore.getCertificateByCourseId(courseId.value);

  if (cert) {
    certificateData.value = JSON.parse(JSON.stringify(cert));
    certificateFileStatus.value = cert.certificateStatus.status;
    if (cert.certificateImage?.data) {
      certificateImagePreview.value = cert.certificateImage.data;
    }
  }
});

const columns: QTableColumn[] = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center', sortable: true },
  { name: 'name', label: 'ชื่อ-นามสกุล', field: 'participantName', align: 'left' },
  { name: 'department', label: 'หน่วยงาน', field: 'department', align: 'left' },
  { name: 'phone', label: 'โทรศัพท์', field: 'phone', align: 'left' },
  { name: 'email', label: 'อีเมล', field: 'email', align: 'left' },
  { name: 'regis_date', label: 'วันที่ลงทะเบียน', field: 'registrationDate', align: 'center' },
  { name: 'regis_type', label: 'ประเภทผู้ลงทะเบียน', field: 'registrationType', align: 'left' },
  { name: 'pass_status', label: 'สถานะการผ่านอบรม', field: 'passStatus', align: 'center' },
  { name: 'remarks', label: 'หมายเหตุ', field: 'remarks', align: 'left' },
  {
    name: 'issued_count',
    label: 'ออกวุฒิบัตรไปแล้ว(ครั้ง)',
    field: 'issuedCount',
    align: 'center',
  },
];

const rows = computed(() => {
  if (!certificateData.value) return [];

  return certificateData.value.participants.map((p, idx) => ({
    ...p,
    index: idx + 1,
  }));
});

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    certificateImageFile.value = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      certificateImagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const onParticipantPassStatusChange = (
  participant: CertificateParticipant,
  status: 'passed' | 'not-passed',
) => {
  if (certificateData.value) {
    const idx = certificateData.value.participants.findIndex((p) => p.id === participant.id);
    if (idx !== -1 && certificateData.value.participants[idx]) {
      certificateData.value.participants[idx].passStatus = status;
    }
  }
};

const onParticipantRemarksChange = (
  participant: CertificateParticipant,
  remarks: string | number | null,
) => {
  if (certificateData.value) {
    const idx = certificateData.value.participants.findIndex((p) => p.id === participant.id);
    if (idx !== -1 && certificateData.value.participants[idx]) {
      certificateData.value.participants[idx].remarks = String(remarks || '');
    }
  }
};

const saveCertificateIssuance = async () => {
  if (!certificateData.value) return;

  try {
    // Update certificate data with current status
    certificateData.value.certificateStatus.status = certificateFileStatus.value;

    if (certificateImageFile.value && certificateImagePreview.value) {
      certificateData.value.certificateImage = {
        data: certificateImagePreview.value,
        fileName: certificateImageFile.value.name,
      };
    }

    // Save to store
    await certificateStore.saveCertificateIssuance(certificateData.value);

    $q.notify({
      type: 'positive',
      message: 'บันทึกการออกวุฒิบัตรสำเร็จ',
      position: 'top',
    });

    // Back to certificate management page
    router.push('/admin/certificates');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'เกิดข้อผิดพลาดในการบันทึก',
      position: 'top',
    });
  }
};

const cancelEdit = () => {
  router.push('/admin/certificates');
};
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการการออกวุฒิบัตร</div>

    <q-card
      flat
      bordered
      class="bg-white q-pa-lg q-mb-md"
      style="border-radius: 8px"
      v-if="certificateData"
    >
      <!-- รายละเอียดหลักสูตร -->
      <div class="text-subtitle1 text-weight-bold q-mb-md">รายละเอียดหลักสูตร</div>

      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-md-6">
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">ปีงบประมาณ:</div>
            <div class="col-7">{{ certificateData.year }}</div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">ชื่อหลักสูตร:</div>
            <div class="col-7" style="word-break: break-word">{{ certificateData.courseName }}</div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">ระยะเวลา:</div>
            <div class="col-7">{{ certificateData.duration }}</div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">เปิดลงทะเบียน:</div>
            <div class="col-7">{{ certificateData.regisOpenDate }}</div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">ปิดลงทะเบียน:</div>
            <div class="col-7">{{ certificateData.regisCloseDate }}</div>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">ผู้รับผิดชอบ:</div>
            <div class="col-7">{{ certificateData.manager }}</div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">ค่าลงทะเบียน:</div>
            <div class="col-7">{{ certificateData.registrationFee.toLocaleString() }} บาท</div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">จำนวนที่เปิด:</div>
            <div class="col-7">
              {{ certificateData.totalSeats }} คน / สำรอง {{ certificateData.seatReserve }} คน
            </div>
          </div>
          <div class="row q-mb-md">
            <div class="col-5 text-grey-7 text-weight-bold">จำนวนผู้ลงทะเบียน:</div>
            <div class="col-7">
              {{ certificateData.participantSummary.attended }} คน มา
              {{ certificateData.participantSummary.attended }} ไม่มา
              {{ certificateData.participantSummary.notAttended }} ยกเลิก
              {{ certificateData.participantSummary.cancelled }}
            </div>
          </div>
        </div>
      </div>

      <q-separator class="q-my-lg" />

      <!-- การตั้งค่าวุฒิบัตร -->
      <div class="text-subtitle1 text-weight-bold q-mb-md">การตั้งค่าวุฒิบัตร</div>

      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-md-6">
          <div class="q-mb-md">
            <div class="text-weight-bold q-mb-sm">สถานะการสร้างไฟล์วุฒิบัตร</div>
            <q-option-group
              v-model="certificateFileStatus"
              :options="[
                { label: 'สร้างไฟล์', value: 'create' },
                { label: 'ไม่สร้างไฟล์', value: 'no-create' },
              ]"
              color="primary"
            />
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="text-weight-bold q-mb-sm">รูปภาพวุฒิบัตรพร้อมชื่อหลักสูตร</div>
          <div class="q-mb-md">
            <q-file
              outlined
              dense
              v-model="certificateImageFile"
              label="เลือกรูปภาพ"
              @update:model-value="handleImageUpload"
              accept=".jpg,.jpeg,.png,.gif"
              max-file-size="5242880"
            />
          </div>
          <div v-if="certificateImagePreview" class="q-mb-md">
            <img
              :src="certificateImagePreview"
              alt="Certificate Preview"
              style="
                max-width: 100%;
                max-height: 300px;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
              "
            />
          </div>
        </div>
      </div>
    </q-card>

    <!-- ตารางรายชื่อผู้เข้าอบรม -->
    <q-card flat bordered class="bg-white q-pa-sm q-mb-md" style="border-radius: 8px">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">รายชื่อผู้เข้าอบรม</div>

        <q-table
          flat
          bordered
          :rows="rows"
          :columns="columns"
          row-key="id"
          separator="cell"
          :rows-per-page-options="[10, 20, 50]"
          table-header-class="bg-grey-1 text-weight-bold text-dark"
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props" style="max-width: 150px; white-space: normal">{{
              props.value
            }}</q-td>
          </template>

          <template v-slot:body-cell-pass_status="props">
            <q-td :props="props">
              <q-option-group
                :model-value="props.row.passStatus"
                @update:model-value="(val) => onParticipantPassStatusChange(props.row, val)"
                :options="[
                  { label: 'ผ่าน', value: 'passed' },
                  { label: 'ไม่ผ่าน', value: 'not-passed' },
                ]"
                color="primary"
                inline
                size="sm"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-remarks="props">
            <q-td :props="props">
              <q-input
                outlined
                dense
                :model-value="props.row.remarks || ''"
                @update:model-value="(val) => onParticipantRemarksChange(props.row, val)"
                placeholder="หมายเหตุ"
                style="width: 150px"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-issued_count="props">
            <q-td :props="props" class="text-center">
              {{ props.value }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- ปุ่ม Save และ Cancel -->
    <div class="row q-gutter-md justify-end">
      <q-btn
        unelevated
        color="grey-3"
        text-color="grey-8"
        label="ยกเลิก"
        no-caps
        class="q-px-lg text-weight-medium"
        @click="cancelEdit"
      />
      <q-btn
        unelevated
        color="primary"
        text-color="white"
        label="บันทึก"
        no-caps
        class="q-px-lg text-weight-medium"
        @click="saveCertificateIssuance"
      />
    </div>
  </q-page>
</template>

<style scoped>
:deep(.q-table th) {
  font-size: 12px;
  color: #555;
  text-align: center !important;
}

:deep(.q-table td) {
  font-size: 12px;
  color: #333;
}

:deep(.q-option-group) {
  display: flex;
  gap: 12px;
}
</style>
