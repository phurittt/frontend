<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar, type QTableColumn } from 'quasar';

import { useProjectStore } from 'src/stores/project-store';
import { useProjectTypeStore } from 'src/stores/projectType-store';
import { useUserStore } from 'src/stores/user-store';
import { useMasterCourseStore } from 'src/stores/masterCourse-store';
import { useLecturerStore } from 'src/stores/lecturer-store';
import type { OptionItem, CreateProjectPayload } from 'src/models/project';
import { api } from 'src/boot/axios';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const projectStore = useProjectStore();
const projectTypeStore = useProjectTypeStore();
const userStore = useUserStore();
const masterCourseStore = useMasterCourseStore();
const lecturerStore = useLecturerStore();

const step = ref(1);
const editId = computed(() => (route.params.id ? Number(route.params.id) : null));

// =====================
// Step 1 — Project Basic Info
// =====================
const projectYear = ref('');
const projectType = ref<OptionItem | null>(null);
const name = ref('');
const location = ref('');
const projectDurationStart = ref('');
const projectDurationEnd = ref('');
const registrationStartDate = ref('');
const registrationEndDate = ref('');
const manager = ref<OptionItem | null>(null);
const cancelDaysBefore = ref<number | null>(null);
const requireFoodSurvey = ref(false);
const isVisible = ref(true);
const status = ref(true); // เปิด/ปิดรับอบรม

// =====================
// Step 2 — Course Details
// =====================
const course = ref<OptionItem | null>(null);
const generationNumber = ref('');
const targetAudience = ref<string[]>([]);
const trainingStartDate = ref('');
const trainingStartTime = ref('');
const trainingEndDate = ref('');
const trainingEndTime = ref('');
const capacity = ref<number | null>(null);
const reserveCapacity = ref(0);
const registrationFee = ref(0);
const coverImage = ref('');
const coverImagePreview = ref('');
const coverImageFile = ref<File | null>(null);

// =====================
// Step 3 — Lecturers
// =====================
const selectedLecturers = ref<OptionItem[]>([]);
const lecturerRemuneration = ref(0);

// =====================
// Computed Options
// =====================
const projectTypeOptions = computed(() =>
  projectTypeStore.projectTypes.map((pt) => ({ label: pt.name, value: pt.id })),
);

const managerOptions = computed(() =>
  userStore.usersList
    .filter((u) => u.role === 'admin' || u.role === 'staff')
    .map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id })),
);

const courseOptions = computed(() =>
  masterCourseStore.courses.map((c) => ({ label: c.title, value: c.id })),
);

const lecturerOptions = computed(() =>
  lecturerStore.lecturers.map((l) => ({ label: `${l.firstName} ${l.lastName}`, value: l.id })),
);

const targetOptions = ['นิสิต', 'อาจารย์', 'เจ้าหน้าที่', 'บุคคลทั่วไป', 'บริษัท/หน่วยงานอื่นๆ'];

// =====================
// Auto-format helpers for manual date/time typing
// =====================
const formatDate = (v: string): string => {
  const digits = v.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
};

const formatTime = (v: string): string => {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

// Auto-format watchers — keep date/time refs clean while allowing v-model on the inputs
[trainingStartDate, trainingEndDate].forEach((r) => {
  watch(
    r,
    (v) => {
      const f = formatDate(v);
      if (f !== v) r.value = f;
    },
    { flush: 'sync' },
  );
});
[trainingStartTime, trainingEndTime].forEach((r) => {
  watch(
    r,
    (v) => {
      const f = formatTime(v);
      if (f !== v) r.value = f;
    },
    { flush: 'sync' },
  );
});

// =====================
// Training DateTime (ISO 8601)
// =====================
const trainingStartISO = computed(() => {
  if (!trainingStartDate.value) return '';
  const time = trainingStartTime.value || '00:00';
  return `${trainingStartDate.value}T${time}:00.000Z`;
});

const trainingEndISO = computed(() => {
  if (!trainingEndDate.value) return '';
  const time = trainingEndTime.value || '00:00';
  return `${trainingEndDate.value}T${time}:00.000Z`;
});

// =====================
// Cover Image
// =====================
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const onFileSelect = async (file: File | null) => {
  if (!file) {
    coverImage.value = '';
    coverImagePreview.value = '';
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    $q.notify({ type: 'negative', message: 'ไฟล์รูปภาพต้องมีขนาดไม่เกิน 10MB' });
    coverImageFile.value = null;
    return;
  }
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    coverImage.value = res.data.url;
    coverImagePreview.value = res.data.url;
  } catch {
    $q.notify({ type: 'negative', message: 'อัปโหลดรูปภาพไม่สำเร็จ' });
    coverImageFile.value = null;
  }
};

const clearCoverImage = () => {
  coverImage.value = '';
  coverImagePreview.value = '';
  coverImageFile.value = null;
};

// =====================
// Step 2 Course Table
// =====================
const courseTableRows = computed(() => {
  if (!course.value) return [];
  return [
    {
      seq: 1,
      course: course.value.label,
      targetAudience: targetAudience.value.length ? targetAudience.value.join(', ') : '-',
      registrationFee: `${registrationFee.value.toLocaleString()} บาท`,
      regisStatus:
        registrationStartDate.value && registrationEndDate.value
          ? `${registrationStartDate.value} — ${registrationEndDate.value}`
          : 'ยังไม่ระบุ',
      coverImage: coverImagePreview.value,
    },
  ];
});

const courseColumns: QTableColumn[] = [
  { name: 'seq', label: 'ลำดับ', field: 'seq', align: 'center' },
  { name: 'course', label: 'หลักสูตร', field: 'course', align: 'left' },
  { name: 'targetAudience', label: 'กลุ่มเป้าหมาย', field: 'targetAudience', align: 'left' },
  {
    name: 'registrationFee',
    label: 'ค่าธรรมเนียม',
    field: 'registrationFee',
    align: 'right',
  },
  {
    name: 'regisStatus',
    label: 'ช่วงเวลาลงทะเบียน',
    field: 'regisStatus',
    align: 'center',
  },
  { name: 'coverImage', label: 'รูปภาพ', field: 'coverImage', align: 'center' },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' },
];

const clearCourseEntry = () => {
  course.value = null;
  generationNumber.value = '';
  targetAudience.value = [];
  trainingStartDate.value = '';
  trainingStartTime.value = '';
  trainingEndDate.value = '';
  trainingEndTime.value = '';
  capacity.value = null;
  reserveCapacity.value = 0;
  registrationFee.value = 0;
  clearCoverImage();
};

// =====================
// Step 3 Lecturer Table
// =====================
const lecturerTableRows = computed(() =>
  selectedLecturers.value.map((l, i) => ({
    seq: i + 1,
    course: course.value?.label || '-',
    lecturerName: l.label,
    _value: l.value,
  })),
);

const lecturerColumns: QTableColumn[] = [
  { name: 'seq', label: 'ลำดับ', field: 'seq', align: 'center' },
  { name: 'course', label: 'หลักสูตร', field: 'course', align: 'left' },
  { name: 'lecturerName', label: 'รายชื่อวิทยากร', field: 'lecturerName', align: 'left' },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' },
];

const removeLecturer = (rowValue: string | number) => {
  selectedLecturers.value = selectedLecturers.value.filter((l) => l.value !== rowValue);
};

// =====================
// Edit Mode — Load existing data
// =====================
const populateFromApi = (p: any) => {
  projectYear.value = p.projectYear || '';
  name.value = p.name || '';
  location.value = p.location || '';
  cancelDaysBefore.value = p.cancelDaysBefore ?? null;
  requireFoodSurvey.value = p.requireFoodSurvey ?? false;
  isVisible.value = p.isVisible ?? true;
  status.value = p.status ?? true;
  projectDurationStart.value = p.projectDurationStart ? p.projectDurationStart.slice(0, 10) : '';
  projectDurationEnd.value = p.projectDurationEnd ? p.projectDurationEnd.slice(0, 10) : '';
  registrationStartDate.value = p.registrationStartDate ? p.registrationStartDate.slice(0, 10) : '';
  registrationEndDate.value = p.registrationEndDate ? p.registrationEndDate.slice(0, 10) : '';

  if (p.projectType) {
    projectType.value = { label: p.projectType.name, value: p.projectType.id };
  }
  if (p.manager) {
    manager.value = {
      label: `${p.manager.firstName} ${p.manager.lastName}`,
      value: p.manager.id,
    };
  }

  // Step 2
  if (p.course) {
    course.value = { label: p.course.title, value: p.course.id };
  }
  generationNumber.value = p.generationNumber || '';
  targetAudience.value = p.targetAudience || [];
  capacity.value = p.capacity ?? null;
  reserveCapacity.value = p.reserveCapacity ?? 0;
  registrationFee.value = p.registrationFee ?? 0;
  if (p.coverImage) {
    coverImage.value = p.coverImage;
    coverImagePreview.value = p.coverImage;
  }
  if (p.trainingStartDate) {
    const dt = new Date(p.trainingStartDate);
    trainingStartDate.value = dt.toISOString().slice(0, 10);
    trainingStartTime.value = dt.toISOString().slice(11, 16);
  }
  if (p.trainingEndDate) {
    const dt = new Date(p.trainingEndDate);
    trainingEndDate.value = dt.toISOString().slice(0, 10);
    trainingEndTime.value = dt.toISOString().slice(11, 16);
  }

  // Step 3
  lecturerRemuneration.value = Number(p.lecturerRemuneration) || 0;
  if (p.lecturers?.length) {
    selectedLecturers.value = p.lecturers.map((l: any) => ({
      label: `${l.firstName} ${l.lastName}`,
      value: l.id,
    }));
  }
};

// =====================
// Submit
// =====================
// v-model.number leaves the ref as "" when the input is cleared, so we
// must coerce every numeric field to an actual number before sending.
const toNum = (v: unknown): number => {
  const n = Number(v);
  return isFinite(n) ? n : 0;
};
const toInt = (v: unknown): number => Math.round(toNum(v));

const onSubmit = async () => {
  const payload: CreateProjectPayload = {
    name: name.value,
    projectYear: projectYear.value,
    requireFoodSurvey: requireFoodSurvey.value,
    status: status.value,
    isVisible: isVisible.value,
    reserveCapacity: toInt(reserveCapacity.value),
    registrationFee: toNum(registrationFee.value),
    lecturerRemuneration: toNum(lecturerRemuneration.value),
    lecturerIds: selectedLecturers.value.map((l) => l.value as number),
    ...(projectType.value && { projectTypeId: projectType.value.value as number }),
    ...(manager.value && { managerId: manager.value.value as number }),
    ...(location.value && { location: location.value }),
    ...(cancelDaysBefore.value != null && { cancelDaysBefore: toInt(cancelDaysBefore.value) }),
    ...(projectDurationStart.value && { projectDurationStart: projectDurationStart.value }),
    ...(projectDurationEnd.value && { projectDurationEnd: projectDurationEnd.value }),
    ...(registrationStartDate.value && { registrationStartDate: registrationStartDate.value }),
    ...(registrationEndDate.value && { registrationEndDate: registrationEndDate.value }),
    ...(course.value && { courseId: course.value.value as number }),
    ...(generationNumber.value && { generationNumber: generationNumber.value }),
    ...(targetAudience.value.length && { targetAudience: targetAudience.value }),
    ...(trainingStartISO.value && { trainingStartDate: trainingStartISO.value }),
    ...(trainingEndISO.value && { trainingEndDate: trainingEndISO.value }),
    ...(capacity.value != null && { capacity: toInt(capacity.value) }),
    ...(coverImage.value && { coverImage: coverImage.value }),
  };

  try {
    await projectStore.submitProject(payload, editId.value);
    $q.notify({ type: 'positive', message: 'บันทึกโครงการสำเร็จ!' });
    router.push('/admin/projects');
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error';
    console.error('[ProjectAddPage] submit failed:', err);
    $q.notify({ type: 'negative', message: `บันทึกไม่สำเร็จ: ${msg}` });
  }
};

// =====================
// Lifecycle
// =====================
onMounted(async () => {
  await Promise.all([
    projectTypeStore.fetchProjectTypes(),
    userStore.fetchUsers(),
    masterCourseStore.fetchCourses(),
    lecturerStore.fetchLecturers(),
  ]);

  if (editId.value) {
    try {
      const project = await projectStore.fetchProject(editId.value);
      populateFromApi(project);
    } catch {
      $q.notify({ type: 'negative', message: 'ไม่สามารถโหลดข้อมูลโครงการได้' });
    }
  }
});
</script>

<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="bg-white" style="border-radius: 8px">
      <q-stepper
        v-model="step"
        color="amber-4"
        done-color="amber-4"
        active-color="amber-4"
        inactive-color="grey-4"
        animated
        flat
        class="project-stepper"
      >
        <!-- =============================== -->
        <!-- Step 1: Project Basic Info      -->
        <!-- =============================== -->
        <q-step :name="1" title="โครงการ" icon="folder" :done="step > 1">
          <div class="form-container q-py-lg">
            <!-- ปีงบประมาณ -->
            <div class="form-row">
              <div class="form-label">ปีงบประมาณ</div>
              <div class="form-field">
                <q-input
                  outlined
                  dense
                  v-model="projectYear"
                  placeholder="เช่น 2569"
                  style="max-width: 150px"
                />
              </div>
            </div>

            <!-- ประเภทโครงการ -->
            <div class="form-row">
              <div class="form-label">ประเภทโครงการ</div>
              <div class="form-field">
                <q-select
                  outlined
                  dense
                  v-model="projectType"
                  :options="projectTypeOptions"
                  option-label="label"
                  placeholder="เลือกประเภทโครงการ"
                  clearable
                  style="max-width: 500px"
                />
              </div>
            </div>

            <!-- ชื่อโครงการ -->
            <div class="form-row">
              <div class="form-label">ชื่อโครงการ</div>
              <div class="form-field">
                <q-input
                  outlined
                  dense
                  v-model="name"
                  placeholder="กรอกชื่อโครงการ"
                  style="max-width: 500px"
                />
              </div>
            </div>

            <!-- สถานที่อบรม -->
            <div class="form-row">
              <div class="form-label">สถานที่อบรม</div>
              <div class="form-field">
                <q-input
                  outlined
                  dense
                  v-model="location"
                  placeholder="กรอกสถานที่อบรม"
                  style="max-width: 500px"
                />
              </div>
            </div>

            <!-- ระยะเวลาโครงการ -->
            <div class="form-row">
              <div class="form-label">ระยะเวลาโครงการ</div>
              <div class="form-field row items-center q-gutter-x-sm">
                <q-input
                  outlined
                  dense
                  :model-value="projectDurationStart"
                  @update:model-value="
                    (v) => {
                      projectDurationStart = formatDate(String(v ?? ''));
                    }
                  "
                  placeholder="YYYY-MM-DD"
                  style="width: 160px"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="projectDurationStart" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="ตกลง" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <span class="text-weight-medium">ถึง</span>
                <q-input
                  outlined
                  dense
                  :model-value="projectDurationEnd"
                  @update:model-value="
                    (v) => {
                      projectDurationEnd = formatDate(String(v ?? ''));
                    }
                  "
                  placeholder="YYYY-MM-DD"
                  style="width: 160px"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="projectDurationEnd" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="ตกลง" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- ช่วงเวลาลงทะเบียน -->
            <div class="form-row">
              <div class="form-label">ช่วงเวลาลงทะเบียน</div>
              <div class="form-field row items-center q-gutter-x-sm">
                <q-input
                  outlined
                  dense
                  :model-value="registrationStartDate"
                  @update:model-value="
                    (v) => {
                      registrationStartDate = formatDate(String(v ?? ''));
                    }
                  "
                  placeholder="YYYY-MM-DD"
                  style="width: 160px"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="registrationStartDate" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="ตกลง" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <span class="text-weight-medium">ถึง</span>
                <q-input
                  outlined
                  dense
                  :model-value="registrationEndDate"
                  @update:model-value="
                    (v) => {
                      registrationEndDate = formatDate(String(v ?? ''));
                    }
                  "
                  placeholder="YYYY-MM-DD"
                  style="width: 160px"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="registrationEndDate" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="ตกลง" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- ผู้รับผิดชอบ (admin/staff เท่านั้น) -->
            <div class="form-row">
              <div class="form-label">ผู้รับผิดชอบ</div>
              <div class="form-field">
                <q-select
                  outlined
                  dense
                  v-model="manager"
                  :options="managerOptions"
                  option-label="label"
                  placeholder="เลือกผู้รับผิดชอบ (admin/staff)"
                  clearable
                  style="max-width: 500px"
                />
              </div>
            </div>

            <!-- ยกเลิกได้ก่อนกี่วัน -->
            <div class="form-row">
              <div class="form-label">ยกเลิกได้ก่อน (วัน)</div>
              <div class="form-field">
                <q-input
                  outlined
                  dense
                  v-model.number="cancelDaysBefore"
                  type="number"
                  min="0"
                  placeholder="จำนวนวัน"
                  style="max-width: 150px"
                />
              </div>
            </div>

            <!-- Toggles -->
            <div class="form-row q-mt-sm">
              <div class="form-label"></div>
              <div class="form-field">
                <div class="toggle-card" style="max-width: 500px">
                  <div class="row items-center justify-between q-mb-sm">
                    <span class="text-weight-bold">สอบถามเรื่องอาหาร</span>
                    <div class="row items-center q-gutter-x-sm">
                      <span class="text-grey-6">{{
                        requireFoodSurvey ? 'สอบถาม' : 'ไม่สอบถาม'
                      }}</span>
                      <q-toggle v-model="requireFoodSurvey" color="amber-8" />
                    </div>
                  </div>
                  <div class="row items-center justify-between q-mb-sm">
                    <span class="text-weight-bold">สถานะการแสดงผลบนเว็บ</span>
                    <div class="row items-center q-gutter-x-sm">
                      <span class="text-grey-6">{{ isVisible ? 'แสดง' : 'ซ่อน' }}</span>
                      <q-toggle v-model="isVisible" color="blue-6" />
                    </div>
                  </div>
                  <div class="row items-center justify-between">
                    <span class="text-weight-bold">สถานะการเปิดอบรม</span>
                    <div class="row items-center q-gutter-x-sm">
                      <span class="text-grey-6">{{ status ? 'เปิด' : 'ปิด' }}</span>
                      <q-toggle v-model="status" color="positive" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <q-stepper-navigation>
            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                flat
                color="grey-8"
                label="ย้อนกลับ"
                to="/admin/projects"
                class="border-grey"
              />
              <q-btn unelevated color="blue-6" label="บันทึกและไปขั้นตอนถัดไป" @click="step = 2" />
            </div>
          </q-stepper-navigation>
        </q-step>

        <!-- =============================== -->
        <!-- Step 2: Course Details          -->
        <!-- =============================== -->
        <q-step :name="2" title="หลักสูตร" icon="library_books" :done="step > 2">
          <div class="form-container q-py-lg">
            <!-- ชื่อโครงการ (read-only) -->
            <div class="form-row">
              <div class="form-label">โครงการ</div>
              <div class="form-field">
                <q-input
                  outlined
                  dense
                  disable
                  :model-value="name || '(ยังไม่ได้ระบุชื่อโครงการ)'"
                  style="max-width: 500px"
                />
              </div>
            </div>

            <!-- เลือกหลักสูตร -->
            <div class="form-row">
              <div class="form-label">หลักสูตร</div>
              <div class="form-field">
                <q-select
                  outlined
                  dense
                  v-model="course"
                  :options="courseOptions"
                  option-label="label"
                  placeholder="ค้นหาหลักสูตร"
                  clearable
                  use-input
                  input-debounce="300"
                  style="max-width: 500px"
                />
              </div>
            </div>

            <!-- รุ่นที่ -->
            <div class="form-row">
              <div class="form-label">รุ่นที่</div>
              <div class="form-field">
                <q-input
                  outlined
                  dense
                  v-model="generationNumber"
                  placeholder="เช่น 1, รุ่น 1"
                  style="max-width: 200px"
                />
              </div>
            </div>

            <!-- กลุ่มเป้าหมาย -->
            <div class="form-row items-start">
              <div class="form-label q-pt-sm">กลุ่มเป้าหมาย</div>
              <div class="form-field row q-gutter-x-md flex-wrap">
                <q-checkbox
                  v-for="t in targetOptions"
                  :key="t"
                  v-model="targetAudience"
                  :val="t"
                  :label="t"
                  color="primary"
                />
              </div>
            </div>

            <!-- วันและเวลาอบรม -->
            <div class="form-row">
              <div class="form-label">วันเริ่มอบรม</div>
              <div class="form-field row items-center q-gutter-x-sm">
                <q-input
                  outlined
                  dense
                  v-model="trainingStartDate"
                  placeholder="YYYY-MM-DD"
                  style="width: 160px"
                />
                <q-input
                  outlined
                  dense
                  v-model="trainingStartTime"
                  placeholder="HH:mm"
                  style="width: 110px"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-label">วันสิ้นสุดอบรม</div>
              <div class="form-field row items-center q-gutter-x-sm">
                <q-input
                  outlined
                  dense
                  v-model="trainingEndDate"
                  placeholder="YYYY-MM-DD"
                  style="width: 160px"
                />
                <q-input
                  outlined
                  dense
                  v-model="trainingEndTime"
                  placeholder="HH:mm"
                  style="width: 110px"
                />
              </div>
            </div>

            <!-- ISO Preview -->
            <div v-if="trainingStartISO || trainingEndISO" class="form-row">
              <div class="form-label"></div>
              <div class="form-field">
                <div class="text-caption text-grey-6">
                  <span v-if="trainingStartISO">เริ่ม: {{ trainingStartISO }}</span>
                  <span v-if="trainingStartISO && trainingEndISO" class="q-mx-sm">|</span>
                  <span v-if="trainingEndISO">สิ้นสุด: {{ trainingEndISO }}</span>
                </div>
              </div>
            </div>

            <!-- จำนวนที่รับ / สำรอง -->
            <div class="form-row">
              <div class="form-label">จำนวนที่รับ (คน)</div>
              <div class="form-field row items-center q-gutter-x-md">
                <q-input
                  outlined
                  dense
                  v-model.number="capacity"
                  type="number"
                  min="0"
                  placeholder="จำนวน"
                  style="width: 130px"
                  label="ที่รับ"
                />
                <q-input
                  outlined
                  dense
                  v-model.number="reserveCapacity"
                  type="number"
                  min="0"
                  placeholder="จำนวนสำรอง"
                  style="width: 130px"
                  label="สำรอง"
                />
              </div>
            </div>

            <!-- ค่าธรรมเนียม -->
            <div class="form-row">
              <div class="form-label">ค่าธรรมเนียม (บาท)</div>
              <div class="form-field">
                <q-input
                  outlined
                  dense
                  v-model.number="registrationFee"
                  type="number"
                  min="0"
                  placeholder="0"
                  style="max-width: 200px"
                />
              </div>
            </div>

            <!-- รูปภาพปก -->
            <div class="form-row items-start">
              <div class="form-label q-pt-sm">รูปภาพปก</div>
              <div class="form-field">
                <q-file
                  outlined
                  dense
                  v-model="coverImageFile"
                  label="เลือกรูปภาพ (สูงสุด 2MB)"
                  accept="image/*"
                  @update:model-value="onFileSelect"
                  style="max-width: 400px"
                >
                  <template v-slot:prepend>
                    <q-icon name="image" />
                  </template>
                </q-file>
                <div v-if="coverImagePreview" class="q-mt-sm row items-center q-gutter-x-sm">
                  <img
                    :src="coverImagePreview"
                    style="
                      max-width: 180px;
                      max-height: 110px;
                      border-radius: 4px;
                      border: 1px solid #ddd;
                      object-fit: cover;
                    "
                  />
                  <q-btn
                    flat
                    round
                    size="sm"
                    color="negative"
                    icon="close"
                    @click="clearCoverImage"
                  >
                    <q-tooltip>ลบรูปภาพ</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>

          <!-- Course Summary Table -->
          <div class="form-container q-mb-md">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">สรุปรายละเอียดหลักสูตร</div>
            <q-table
              flat
              bordered
              :rows="courseTableRows"
              :columns="courseColumns"
              row-key="seq"
              separator="horizontal"
              table-header-class="bg-grey-1 text-weight-bold text-dark"
              :no-data-label="'ยังไม่ได้เลือกหลักสูตร'"
              hide-bottom
            >
              <template v-slot:body-cell-coverImage="props">
                <q-td :props="props">
                  <img
                    v-if="props.value"
                    :src="props.value"
                    style="width: 48px; height: 36px; border-radius: 3px; object-fit: cover"
                  />
                  <span v-else class="text-grey-5 text-caption">ไม่มีรูป</span>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    size="sm"
                    color="negative"
                    icon="delete"
                    @click="clearCourseEntry"
                  >
                    <q-tooltip>ล้างข้อมูลหลักสูตร</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>

          <q-stepper-navigation>
            <div class="row q-gutter-sm q-mt-md">
              <q-btn flat color="grey-8" label="ย้อนกลับ" @click="step = 1" class="border-grey" />
              <q-btn unelevated color="blue-6" label="ไปขั้นตอนถัดไป" @click="step = 3" />
            </div>
          </q-stepper-navigation>
        </q-step>

        <!-- =============================== -->
        <!-- Step 3: Lecturers               -->
        <!-- =============================== -->
        <q-step :name="3" title="วิทยากร" icon="school" :done="step > 3">
          <div class="form-container q-py-lg">
            <!-- หลักสูตรที่เลือก (read-only) -->
            <div class="form-row">
              <div class="form-label">หลักสูตร</div>
              <div class="form-field">
                <q-input
                  outlined
                  dense
                  disable
                  :model-value="course?.label || '(ยังไม่ได้เลือกหลักสูตร)'"
                  style="max-width: 500px"
                />
              </div>
            </div>

            <!-- เลือกวิทยากร (multiple) -->
            <div class="form-row">
              <div class="form-label">รายชื่อวิทยากร</div>
              <div class="form-field">
                <q-select
                  outlined
                  dense
                  v-model="selectedLecturers"
                  :options="lecturerOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="เลือกวิทยากร (เลือกได้หลายคน)"
                  multiple
                  use-chips
                  clearable
                  style="max-width: 500px"
                />
              </div>
            </div>

            <!-- ค่าตอบแทนวิทยากร -->
            <div class="form-row">
              <div class="form-label">ค่าตอบแทนวิทยากร (บาท)</div>
              <div class="form-field">
                <q-input
                  outlined
                  dense
                  v-model.number="lecturerRemuneration"
                  type="number"
                  min="0"
                  placeholder="0"
                  style="max-width: 200px"
                />
              </div>
            </div>
          </div>

          <!-- Lecturer Table -->
          <div class="form-container q-mb-md">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              รายชื่อวิทยากร ({{ selectedLecturers.length }} คน)
            </div>
            <q-table
              flat
              bordered
              :rows="lecturerTableRows"
              :columns="lecturerColumns"
              row-key="seq"
              separator="horizontal"
              table-header-class="bg-grey-1 text-weight-bold text-dark"
              :no-data-label="'ยังไม่ได้เลือกวิทยากร'"
              hide-bottom
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    size="sm"
                    color="negative"
                    icon="delete"
                    @click="removeLecturer(props.row._value)"
                  >
                    <q-tooltip>ลบวิทยากร</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>

          <q-stepper-navigation>
            <div class="row q-gutter-sm q-mt-md">
              <q-btn flat color="grey-8" label="ย้อนกลับ" @click="step = 2" class="border-grey" />
              <q-btn unelevated color="blue-6" label="ไปขั้นตอนถัดไป" @click="step = 4" />
            </div>
          </q-stepper-navigation>
        </q-step>

        <!-- =============================== -->
        <!-- Step 4: Review & Confirm        -->
        <!-- =============================== -->
        <q-step :name="4" title="ตรวจสอบและยืนยัน" icon="fact_check">
          <div class="q-py-md">
            <!-- โครงการ -->
            <div class="text-h6 text-weight-bold text-dark q-mb-sm">ข้อมูลโครงการ</div>
            <q-card flat bordered class="q-pa-md q-mb-lg bg-grey-1">
              <div class="row q-col-gutter-y-sm">
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">ปีงบประมาณ:</span>
                  <strong class="q-ml-sm">{{ projectYear || '-' }}</strong>
                </div>
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">ประเภทโครงการ:</span>
                  <strong class="q-ml-sm">{{ projectType?.label || '-' }}</strong>
                </div>
                <div class="col-12">
                  <span class="text-grey-7">ชื่อโครงการ:</span>
                  <strong class="q-ml-sm">{{ name || '-' }}</strong>
                </div>
                <div class="col-12">
                  <span class="text-grey-7">สถานที่:</span>
                  <strong class="q-ml-sm">{{ location || '-' }}</strong>
                </div>
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">ระยะเวลาโครงการ:</span>
                  <strong class="q-ml-sm">
                    {{ projectDurationStart || '-' }} — {{ projectDurationEnd || '-' }}
                  </strong>
                </div>
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">ช่วงเวลาลงทะเบียน:</span>
                  <strong class="q-ml-sm">
                    {{ registrationStartDate || '-' }} — {{ registrationEndDate || '-' }}
                  </strong>
                </div>
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">ผู้รับผิดชอบ:</span>
                  <strong class="q-ml-sm">{{ manager?.label || '-' }}</strong>
                </div>
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">ยกเลิกได้ก่อน:</span>
                  <strong class="q-ml-sm">
                    {{ cancelDaysBefore != null ? `${cancelDaysBefore} วัน` : '-' }}
                  </strong>
                </div>
                <div class="col-12 col-md-4">
                  <span class="text-grey-7">สอบถามอาหาร:</span>
                  <q-badge class="q-ml-sm" :color="requireFoodSurvey ? 'positive' : 'grey-5'">
                    {{ requireFoodSurvey ? 'สอบถาม' : 'ไม่สอบถาม' }}
                  </q-badge>
                </div>
                <div class="col-12 col-md-4">
                  <span class="text-grey-7">แสดงบนเว็บ:</span>
                  <q-badge class="q-ml-sm" :color="isVisible ? 'blue-6' : 'grey-5'">
                    {{ isVisible ? 'แสดง' : 'ซ่อน' }}
                  </q-badge>
                </div>
                <div class="col-12 col-md-4">
                  <span class="text-grey-7">สถานะการอบรม:</span>
                  <q-badge class="q-ml-sm" :color="status ? 'positive' : 'negative'">
                    {{ status ? 'เปิด' : 'ปิด' }}
                  </q-badge>
                </div>
              </div>
            </q-card>

            <!-- หลักสูตร -->
            <div class="text-h6 text-weight-bold text-dark q-mb-sm">รายละเอียดหลักสูตร</div>
            <q-card flat bordered class="q-pa-md q-mb-lg bg-grey-1">
              <div class="row q-col-gutter-y-sm">
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">หลักสูตร:</span>
                  <strong class="q-ml-sm">{{ course?.label || '-' }}</strong>
                </div>
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">รุ่นที่:</span>
                  <strong class="q-ml-sm">{{ generationNumber || '-' }}</strong>
                </div>
                <div class="col-12">
                  <span class="text-grey-7">กลุ่มเป้าหมาย:</span>
                  <strong class="q-ml-sm">
                    {{ targetAudience.length ? targetAudience.join(', ') : '-' }}
                  </strong>
                </div>
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">วันเริ่มอบรม:</span>
                  <strong class="q-ml-sm">{{ trainingStartISO || '-' }}</strong>
                </div>
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">วันสิ้นสุดอบรม:</span>
                  <strong class="q-ml-sm">{{ trainingEndISO || '-' }}</strong>
                </div>
                <div class="col-12 col-md-4">
                  <span class="text-grey-7">จำนวนที่รับ:</span>
                  <strong class="q-ml-sm">{{ capacity != null ? `${capacity} คน` : '-' }}</strong>
                </div>
                <div class="col-12 col-md-4">
                  <span class="text-grey-7">สำรอง:</span>
                  <strong class="q-ml-sm">{{ reserveCapacity }} คน</strong>
                </div>
                <div class="col-12 col-md-4">
                  <span class="text-grey-7">ค่าธรรมเนียม:</span>
                  <strong class="q-ml-sm">{{ registrationFee.toLocaleString() }} บาท</strong>
                </div>
                <div v-if="coverImagePreview" class="col-12">
                  <span class="text-grey-7">รูปภาพปก:</span>
                  <img
                    :src="coverImagePreview"
                    class="q-ml-sm"
                    style="
                      max-width: 120px;
                      max-height: 80px;
                      border-radius: 4px;
                      border: 1px solid #ddd;
                      vertical-align: middle;
                      object-fit: cover;
                    "
                  />
                </div>
              </div>
            </q-card>

            <!-- วิทยากร -->
            <div class="text-h6 text-weight-bold text-dark q-mb-sm">
              วิทยากร ({{ selectedLecturers.length }} คน)
            </div>
            <q-card flat bordered class="q-pa-md q-mb-lg bg-grey-1">
              <div class="row q-col-gutter-y-sm q-mb-sm">
                <div class="col-12 col-md-6">
                  <span class="text-grey-7">ค่าตอบแทนวิทยากร:</span>
                  <strong class="q-ml-sm">{{ lecturerRemuneration.toLocaleString() }} บาท</strong>
                </div>
              </div>
              <div v-if="selectedLecturers.length" class="row q-gutter-sm">
                <q-chip
                  v-for="l in selectedLecturers"
                  :key="l.value"
                  icon="person"
                  color="light-blue-1"
                  text-color="light-blue-8"
                >
                  {{ l.label }}
                </q-chip>
              </div>
              <div v-else class="text-grey-5 text-caption">ยังไม่ได้เลือกวิทยากร</div>
            </q-card>
          </div>

          <q-stepper-navigation>
            <div class="row q-gutter-sm q-mt-md">
              <q-btn flat color="grey-8" label="ย้อนกลับ" @click="step = 3" class="border-grey" />
              <q-btn
                unelevated
                color="positive"
                label="ยืนยันการบันทึกข้อมูล"
                icon="save"
                @click="onSubmit"
                :loading="projectStore.loading"
              />
            </div>
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
    </q-card>
  </q-page>
</template>

<style scoped>
:deep(.q-stepper__header) {
  border-bottom: 1px solid #ebebeb;
}

:deep(.q-stepper__dot) {
  font-size: 16px;
  width: 28px;
  height: 28px;
}

:deep(.q-stepper__title) {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

:deep(.q-stepper__tab--active .q-stepper__title) {
  color: #000;
}

.form-container {
  max-width: 900px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-row.items-start {
  align-items: flex-start;
}

.form-label {
  width: 220px;
  min-width: 220px;
  text-align: right;
  padding-right: 16px;
  font-weight: 500;
}

.form-field {
  flex: 1;
}

.toggle-card {
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px 16px;
}

.border-grey {
  border: 1px solid #ddd;
}

@media (max-width: 599px) {
  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-label {
    width: auto;
    text-align: left;
    padding-right: 0;
    margin-bottom: 4px;
  }
}
</style>
