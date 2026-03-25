<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { useCertificateStore } from 'src/stores/certificate-store';
import { api } from 'src/boot/axios';
import type { CertificateIssuance, CertificateParticipant } from 'src/models/certificate';
import { generateCertificate } from 'src/utils/generateCertificate';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const certificateStore = useCertificateStore();

const projectId = computed(() => parseInt(route.params.projectId as string));
const issuanceData = ref<CertificateIssuance | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);

const createFile = ref(false);
const templateFile = ref<File | null>(null);
const templatePreview = ref<string>('');

// Certificate preview dialog
const previewDialog = ref(false);
const previewParticipant = ref<CertificateParticipant | null>(null);
const previewImageUrl = ref<string>('');
const isGenerating = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    const data = await certificateStore.fetchProjectIssuance(projectId.value);
    issuanceData.value = JSON.parse(JSON.stringify(data));
    createFile.value = data.createFile;
    if (data.templateImage) {
      templatePreview.value = data.templateImage;
    }
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถโหลดข้อมูลได้', position: 'top' });
    router.push('/admin/certificates');
  } finally {
    isLoading.value = false;
  }
});

const columns: QTableColumn[] = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center', sortable: true },
  { name: 'name', label: 'ชื่อ-นามสกุล', field: 'participantName', align: 'left' },
  { name: 'department', label: 'หน่วยงาน', field: 'department', align: 'left' },
  { name: 'phone', label: 'โทรศัพท์', field: 'phone', align: 'center' },
  { name: 'email', label: 'อีเมล', field: 'email', align: 'left' },
  { name: 'regis_date', label: 'วันที่ลงทะเบียน', field: 'registrationDate', align: 'center' },
  { name: 'regis_type', label: 'ประเภท', field: 'registrationType', align: 'center' },
  {
    name: 'attendance_status',
    label: 'สถานะการเข้าร่วม',
    field: 'attendanceStatus',
    align: 'center',
  },
  {
    name: 'pass_status',
    label: 'สถานะการผ่านอบรม',
    field: 'passStatus',
    align: 'center',
  },
  { name: 'remarks', label: 'หมายเหตุ', field: 'remarks', align: 'left' },
  {
    name: 'issued_count',
    label: 'ออกวุฒิบัตร (ครั้ง)',
    field: 'issuedCount',
    align: 'center',
  },
  { name: 'actions', label: 'วุฒิบัตร', field: 'actions', align: 'center' },
];

function attendanceLabel(status: string | undefined): string {
  if (status === 'attended') return 'เข้าร่วม';
  if (status === 'cancelled') return 'ยกเลิก';
  return 'ไม่เข้าร่วม'; // missed + pending
}

function attendanceColor(status: string | undefined): string {
  if (status === 'attended') return 'positive';
  if (status === 'cancelled') return 'grey-5';
  return 'orange-7';
}

const rows = computed(() => {
  if (!issuanceData.value) return [];
  return issuanceData.value.participants.map((p, idx) => ({ ...p, index: idx + 1 }));
});

const passedCount = computed(
  () => issuanceData.value?.participants.filter((p) => p.passStatus === 'passed').length ?? 0,
);

function formatDate(d: string | Date | null | undefined): string {
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

// ─── Image Upload ──────────────────────────────────────────────────────────────

const handleTemplateUpload = async (file: File | null) => {
  if (!file) {
    templatePreview.value = '';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    $q.notify({ type: 'warning', message: 'ไฟล์ต้องมีขนาดไม่เกิน 10MB', position: 'top' });
    templateFile.value = null;
    return;
  }
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    templatePreview.value = res.data.url;
  } catch {
    $q.notify({ type: 'negative', message: 'อัปโหลดรูปภาพไม่สำเร็จ', position: 'top' });
    templateFile.value = null;
  }
};

// ─── Participant Status Editing ────────────────────────────────────────────────

const setPassStatus = (participant: CertificateParticipant, status: 'passed' | 'not-passed') => {
  if (!issuanceData.value) return;
  const idx = issuanceData.value.participants.findIndex(
    (p) => p.registrantId === participant.registrantId,
  );
  if (idx !== -1) {
    issuanceData.value.participants[idx]!.passStatus = status;
  }
};

const setRemarks = (participant: CertificateParticipant, value: string | number | null) => {
  if (!issuanceData.value) return;
  const idx = issuanceData.value.participants.findIndex(
    (p) => p.registrantId === participant.registrantId,
  );
  if (idx !== -1) {
    issuanceData.value.participants[idx]!.remarks = String(value ?? '');
  }
};

const markAllAttendedAsPassed = () => {
  if (!issuanceData.value) return;
  issuanceData.value.participants.forEach((p) => {
    if (p.attendanceStatus === 'attended') p.passStatus = 'passed';
  });
  $q.notify({
    type: 'positive',
    message: 'ทำเครื่องหมายผู้เข้าอบรมทั้งหมดเป็น "ผ่าน" แล้ว',
    position: 'top',
  });
};

// ─── Certificate Generation ────────────────────────────────────────────────────

const buildCertData = (participant: CertificateParticipant) => ({
  participantName: participant.participantName,
  courseTitle: issuanceData.value?.courseName || '-',
  duration: issuanceData.value?.duration || '-',
  dateIssued: new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  certificateCode: participant.certificateCode || null,
});

const openPreview = async (participant: CertificateParticipant) => {
  isGenerating.value = true;
  previewParticipant.value = participant;
  previewDialog.value = true;
  try {
    previewImageUrl.value = await generateCertificate(buildCertData(participant));
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถสร้างวุฒิบัตรได้', position: 'top' });
    previewDialog.value = false;
  } finally {
    isGenerating.value = false;
  }
};

const downloadCertificate = async (participant: CertificateParticipant) => {
  try {
    const dataUrl = await generateCertificate(buildCertData(participant));
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `certificate_${participant.participantName.replace(/\s+/g, '_')}.jpg`;
    a.click();
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถดาวน์โหลดได้', position: 'top' });
  }
};

const downloadAll = async () => {
  const passed = issuanceData.value?.participants.filter((p) => p.passStatus === 'passed') ?? [];
  if (!passed.length) {
    $q.notify({ type: 'warning', message: 'ไม่มีผู้ผ่านการอบรม', position: 'top' });
    return;
  }
  $q.notify({
    type: 'info',
    message: `กำลังสร้างวุฒิบัตร ${passed.length} ใบ...`,
    position: 'top',
  });
  for (const p of passed) {
    await downloadCertificate(p);
    await new Promise((r) => setTimeout(r, 300));
  }
};

// ─── Save ──────────────────────────────────────────────────────────────────────

const save = async () => {
  if (!issuanceData.value) return;
  isSaving.value = true;
  try {
    const payload = {
      createFile: createFile.value,
      templateImage: templatePreview.value || null,
      managedBy: 'admin',
      participants: issuanceData.value.participants.map((p) => ({
        registrantId: p.registrantId,
        passStatus: p.passStatus,
        remarks: p.remarks || '',
      })),
    };
    await certificateStore.saveProjectIssuance(projectId.value, payload);
    $q.notify({ type: 'positive', message: 'บันทึกการออกวุฒิบัตรสำเร็จ', position: 'top' });
    router.push('/admin/certificates');
  } catch {
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาดในการบันทึก', position: 'top' });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการการออกวุฒิบัตร</div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="q-pa-xl text-center text-grey-6">
      <q-spinner-dots color="primary" size="40px" />
      <div class="q-mt-md">กำลังโหลดข้อมูล...</div>
    </div>

    <template v-else-if="issuanceData">
      <!-- Course Details -->
      <q-card flat bordered class="bg-white q-pa-lg q-mb-md" style="border-radius: 8px">
        <div class="text-subtitle1 text-weight-bold q-mb-md">รายละเอียดหลักสูตร</div>

        <div class="row q-col-gutter-lg q-mb-md">
          <div class="col-12 col-md-6">
            <div class="row q-mb-sm">
              <div class="col-5 text-grey-7 text-weight-bold">ปีงบประมาณ:</div>
              <div class="col-7">{{ issuanceData.year }}</div>
            </div>
            <div class="row q-mb-sm">
              <div class="col-5 text-grey-7 text-weight-bold">ชื่อหลักสูตร:</div>
              <div class="col-7" style="word-break: break-word">{{ issuanceData.courseName }}</div>
            </div>
            <div class="row q-mb-sm">
              <div class="col-5 text-grey-7 text-weight-bold">โครงการ:</div>
              <div class="col-7">{{ issuanceData.projectName || '-' }}</div>
            </div>
            <div class="row q-mb-sm">
              <div class="col-5 text-grey-7 text-weight-bold">ระยะเวลา:</div>
              <div class="col-7">{{ issuanceData.duration }}</div>
            </div>
            <div class="row q-mb-sm">
              <div class="col-5 text-grey-7 text-weight-bold">เปิดลงทะเบียน:</div>
              <div class="col-7">{{ formatDate(issuanceData.regisOpenDate) }}</div>
            </div>
            <div class="row q-mb-sm">
              <div class="col-5 text-grey-7 text-weight-bold">ปิดลงทะเบียน:</div>
              <div class="col-7">{{ formatDate(issuanceData.regisCloseDate) }}</div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="row q-mb-sm">
              <div class="col-5 text-grey-7 text-weight-bold">ผู้รับผิดชอบ:</div>
              <div class="col-7">{{ issuanceData.manager }}</div>
            </div>
            <div class="row q-mb-sm">
              <div class="col-5 text-grey-7 text-weight-bold">ค่าลงทะเบียน:</div>
              <div class="col-7">{{ issuanceData.registrationFee.toLocaleString() }} บาท</div>
            </div>
            <div class="row q-mb-sm">
              <div class="col-5 text-grey-7 text-weight-bold">ที่นั่ง:</div>
              <div class="col-7">
                {{ issuanceData.totalSeats }} คน / สำรอง {{ issuanceData.seatReserve }} คน
              </div>
            </div>
            <div class="row q-mb-sm">
              <div class="col-5 text-grey-7 text-weight-bold">ผู้เข้าอบรม:</div>
              <div class="col-7">
                <q-chip dense color="positive" text-color="white" size="sm">
                  มา {{ issuanceData.participantSummary.attended }}
                </q-chip>
                <q-chip dense color="negative" text-color="white" size="sm" class="q-ml-xs">
                  ไม่มา {{ issuanceData.participantSummary.notAttended }}
                </q-chip>
                <q-chip dense color="grey" text-color="white" size="sm" class="q-ml-xs">
                  ยกเลิก {{ issuanceData.participantSummary.cancelled }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Certificate Settings -->
        <div class="text-subtitle1 text-weight-bold q-mb-md">การตั้งค่าวุฒิบัตร</div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-5">
            <div class="text-weight-bold q-mb-sm">สถานะการสร้างไฟล์วุฒิบัตร</div>
            <q-option-group
              v-model="createFile"
              :options="[
                { label: 'สร้างไฟล์วุฒิบัตร', value: true },
                { label: 'ไม่สร้างไฟล์', value: false },
              ]"
              color="primary"
            />

            <div class="q-mt-md">
              <q-btn
                unelevated
                color="teal"
                text-color="white"
                icon="check_circle"
                label="ทำเครื่องหมายผู้เข้าอบรมทั้งหมดเป็น 'ผ่าน'"
                size="sm"
                no-caps
                @click="markAllAttendedAsPassed"
              />
            </div>
          </div>

          <div class="col-12 col-md-7">
            <div class="text-weight-bold q-mb-sm">
              รูปภาพเทมเพลตวุฒิบัตร
              <q-badge
                color="grey-5"
                text-color="dark"
                class="q-ml-xs"
                label="JPG / PNG / max 10MB"
              />
            </div>
            <q-file
              outlined
              dense
              v-model="templateFile"
              label="เลือกรูปภาพเทมเพลต"
              @update:model-value="handleTemplateUpload"
              accept=".jpg,.jpeg,.png"
              class="q-mb-md"
            >
              <template v-slot:prepend><q-icon name="image" /></template>
            </q-file>

            <div class="column items-start q-gutter-sm">
              <div v-if="templatePreview" class="column items-start q-gutter-xs">
                <img
                  :src="templatePreview"
                  alt="Certificate Template"
                  style="
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    object-fit: contain;
                  "
                />
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  label="ลบรูป"
                  size="sm"
                  no-caps
                  @click="
                    templatePreview = '';
                    templateFile = null;
                  "
                />
              </div>
              <div
                v-else
                class="flex items-center justify-center bg-grey-2 text-grey-5"
                style="height: 100px; width: 100%; border-radius: 8px; border: 2px dashed #ccc"
              >
                <div class="text-center">
                  <q-icon name="image" size="2em" />
                  <div class="text-caption q-mt-xs">รูปภาพอ้างอิง (ไม่บังคับ)</div>
                </div>
              </div>
              <q-btn
                v-if="passedCount > 0"
                unelevated
                color="deep-orange"
                text-color="white"
                icon="download"
                :label="`ดาวน์โหลดวุฒิบัตรทั้งหมด (${passedCount} ใบ)`"
                size="sm"
                no-caps
                @click="downloadAll"
              />
            </div>
          </div>
        </div>
      </q-card>

      <!-- Participants Table -->
      <q-card flat bordered class="bg-white q-pa-sm q-mb-md" style="border-radius: 8px">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="text-subtitle1 text-weight-bold">
              รายชื่อผู้เข้าอบรม
              <q-badge color="primary" class="q-ml-sm">{{ rows.length }} คน</q-badge>
              <q-badge color="positive" class="q-ml-xs">ผ่าน {{ passedCount }} คน</q-badge>
            </div>
          </div>

          <q-table
            flat
            bordered
            :rows="rows"
            :columns="columns"
            row-key="registrantId"
            separator="cell"
            :rows-per-page-options="[10, 20, 50, 0]"
            table-header-class="bg-grey-1 text-weight-bold text-dark"
          >
            <template v-slot:body-cell-name="props">
              <q-td :props="props" style="max-width: 160px; white-space: normal">
                {{ props.value }}
              </q-td>
            </template>

            <template v-slot:body-cell-regis_date="props">
              <q-td :props="props">{{ formatDate(props.row.registrationDate) }}</q-td>
            </template>

            <template v-slot:body-cell-attendance_status="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  :color="attendanceColor(props.row.attendanceStatus)"
                  text-color="white"
                  :label="attendanceLabel(props.row.attendanceStatus)"
                  class="text-weight-bold"
                  style="font-size: 11px; padding: 4px 8px; border-radius: 6px"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-pass_status="props">
              <q-td :props="props">
                <q-option-group
                  :model-value="props.row.passStatus"
                  @update:model-value="(val) => setPassStatus(props.row, val)"
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
                  @update:model-value="(val) => setRemarks(props.row, val)"
                  placeholder="หมายเหตุ"
                  style="min-width: 130px"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-issued_count="props">
              <q-td :props="props" class="text-center">
                <q-badge v-if="props.value > 0" color="primary">{{ props.value }}</q-badge>
                <span v-else class="text-grey-5">-</span>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <div class="row justify-center q-gutter-xs">
                  <template v-if="props.row.passStatus === 'passed'">
                    <q-btn
                      unelevated
                      size="xs"
                      color="deep-purple-3"
                      text-color="dark"
                      icon="preview"
                      @click="openPreview(props.row)"
                    >
                      <q-tooltip>ดูตัวอย่างวุฒิบัตร</q-tooltip>
                    </q-btn>
                    <q-btn
                      unelevated
                      size="xs"
                      color="orange-3"
                      text-color="dark"
                      icon="download"
                      @click="downloadCertificate(props.row)"
                    >
                      <q-tooltip>ดาวน์โหลดวุฒิบัตร</q-tooltip>
                    </q-btn>
                  </template>
                  <span v-else class="text-grey-4 text-caption">-</span>
                </div>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-lg text-grey-6">
                <q-icon name="group_off" size="2em" class="q-mr-sm" />
                ยังไม่มีผู้ลงทะเบียนในโครงการนี้
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Action Buttons -->
      <div class="row q-gutter-md justify-end">
        <q-btn
          unelevated
          color="grey-3"
          text-color="grey-8"
          label="ยกเลิก"
          no-caps
          class="q-px-lg"
          @click="router.push('/admin/certificates')"
        />
        <q-btn
          unelevated
          color="primary"
          text-color="white"
          label="บันทึก"
          no-caps
          class="q-px-lg"
          :loading="isSaving"
          @click="save"
        />
      </div>
    </template>

    <!-- Certificate Preview Dialog -->
    <q-dialog v-model="previewDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            ตัวอย่างวุฒิบัตร — {{ previewParticipant?.participantName }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="flex flex-center" style="min-height: 70vh">
          <q-spinner-dots v-if="isGenerating" color="primary" size="60px" />
          <div v-else-if="previewImageUrl" class="column items-center q-gutter-md">
            <img
              :src="previewImageUrl"
              alt="Certificate"
              style="
                max-width: 100%;
                max-height: 80vh;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              "
            />
            <q-btn
              unelevated
              color="deep-orange"
              text-color="white"
              icon="download"
              label="ดาวน์โหลด"
              no-caps
              @click="downloadCertificate(previewParticipant!)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
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
  gap: 8px;
}
</style>
