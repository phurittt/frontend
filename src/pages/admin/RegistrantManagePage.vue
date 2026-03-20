<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useRegistrantStore } from 'src/stores/registrant-store';
import { useMasterCourseStore } from 'src/stores/masterCourse-store';
import type { RegistrantStatus, CreateRegistrantDto } from 'src/models/registrant';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const registrantStore = useRegistrantStore();
const courseStore = useMasterCourseStore();

const search = ref('');
const activeTab = ref('ทั้งหมด');

// ดึง ID หลักสูตรจาก URL Parameter
const courseId = Number(route.params.courseId);

onMounted(() => {
  registrantStore.fetchRegistrants();
  courseStore.fetchCourses();
});

// ค้นหาชื่อหลักสูตรเพื่อนำมาแสดงบนหัวข้อ
const currentCourseName = computed(() => {
  const course = courseStore.courses.find(c => c.id === courseId);
  return course ? course.name : 'กำลังโหลด...';
});

// ดึงเฉพาะผู้ลงทะเบียนที่ตรงกับ courseId นี้เท่านั้น !!
const courseRegistrants = computed(() => {
  return registrantStore.registrants.filter(r => r.courseId === courseId);
});

// ระบบคำนวณและกรองข้อมูลสำหรับ Tabs
const counts = computed(() => {
  const all = courseRegistrants.value;
  return {
    'ทั้งหมด': all.length,
    'รอชำระเงิน': all.filter(r => r.status === 'รอชำระเงิน').length,
    'รอตรวจสอบ': all.filter(r => r.status === 'รอตรวจสอบ').length,
    'ชำระเงินเรียบร้อย': all.filter(r => r.status === 'ชำระเงินเรียบร้อย').length,
    'ยกเลิก': all.filter(r => r.status === 'ยกเลิก').length,
  };
});

const filteredRows = computed(() => {
  let rows = courseRegistrants.value;
  if (activeTab.value !== 'ทั้งหมด') {
    rows = rows.filter(r => r.status === activeTab.value);
  }
  return rows;
});

// (ส่วนตารางและคอลัมน์เหมือนเดิม)
const columns = [
  { name: 'id', label: 'ลำดับ', field: 'index', align: 'center' as const },
  { name: 'fullName', label: 'ชื่อ-นามสกุล', field: 'fullName', align: 'left' as const, sortable: true },
  { name: 'department', label: 'ส่วนงาน', field: 'department', align: 'left' as const },
  { name: 'phone', label: 'เบอร์โทรศัพท์', field: 'phone', align: 'center' as const },
  { name: 'type', label: 'ประเภท', field: 'type', align: 'center' as const },
  { name: 'registerDate', label: 'วันที่สมัคร', field: 'registerDate', align: 'center' as const, sortable: true },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' as const },
];

const getStatusColor = (status: RegistrantStatus) => {
  switch (status) {
    case 'ชำระเงินเรียบร้อย': return { bg: 'light-green-2', text: 'green-9' };
    case 'รอตรวจสอบ': return { bg: 'orange-2', text: 'orange-9' };
    case 'รอชำระเงิน': return { bg: 'grey-3', text: 'grey-8' };
    case 'ยกเลิก': return { bg: 'red-2', text: 'red-9' };
    default: return { bg: 'grey-2', text: 'grey-8' };
  }
};

// ================= Dialog เพิ่มผู้ลงทะเบียน =================
const showAddDialog = ref(false);
const titleOptions = ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ศ.'];
const defaultForm = (): CreateRegistrantDto => ({
  courseId: courseId, // ผูกกับ courseId อัตโนมัติ
  type: 'บุคคลทั่วไป', title: 'นาย', firstName: '', lastName: '', email: '', phone: '', department: ''
});
const addForm = ref<CreateRegistrantDto>(defaultForm());

const openAddDialog = () => {
  addForm.value = defaultForm();
  showAddDialog.value = true;
};

const onSaveRegistrant = () => {
  registrantStore.addRegistrant(addForm.value);
  $q.notify({ type: 'positive', message: 'เพิ่มผู้ลงทะเบียนสำเร็จ' });
  showAddDialog.value = false;
};

// ================= Dialog แก้ไขสถานะ =================
const showStatusDialog = ref(false);
const editStatusId = ref<number | null>(null);
const editStatusValue = ref<RegistrantStatus>('รอชำระเงิน');
const statusOptions: RegistrantStatus[] = ['ชำระเงินเรียบร้อย', 'รอตรวจสอบ', 'รอชำระเงิน', 'ยกเลิก'];

const openStatusDialog = (id: number, currentStatus: RegistrantStatus) => {
  editStatusId.value = id;
  editStatusValue.value = currentStatus;
  showStatusDialog.value = true;
};

const onSaveStatus = () => {
  if (editStatusId.value) {
    registrantStore.updateStatus(editStatusId.value, editStatusValue.value);
    $q.notify({ type: 'positive', message: 'อัปเดตสถานะสำเร็จ' });
    showStatusDialog.value = false;
  }
};

const onDelete = (id: number) => {
  $q.dialog({ title: 'ยืนยันการลบ', message: 'คุณต้องการลบข้อมูลนี้ใช่หรือไม่?', cancel: true }).onOk(() => {
    registrantStore.deleteRegistrant(id);
    $q.notify({ type: 'info', message: 'ลบข้อมูลสำเร็จ' });
  });
};
</script>

<template>
  <q-page class="q-pa-md bg-grey-1">

    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="row items-center q-gutter-x-sm">
          <q-btn flat round icon="arrow_back" color="grey-8" @click="router.push('/admin/registrants')" />
          <div class="text-h6 text-weight-bold">ผู้ลงทะเบียนอบรม</div>
        </div>
        <div class="text-primary text-weight-bold q-mt-xs q-ml-xl">{{ currentCourseName }}</div>
      </div>
    </div>

    <q-tabs v-model="activeTab" dense class="text-grey-7 bg-white q-pt-sm shadow-1" active-color="primary"
      indicator-color="primary" align="left" narrow-indicator style="border-radius: 8px 8px 0 0;">
      <q-tab name="ทั้งหมด" :label="`ทั้งหมด (${counts['ทั้งหมด']})`" />
      <q-tab name="รอชำระเงิน" :label="`รอชำระเงิน (${counts['รอชำระเงิน']})`" />
      <q-tab name="รอตรวจสอบ" :label="`รอตรวจสอบ (${counts['รอตรวจสอบ']})`" />
      <q-tab name="ชำระเงินเรียบร้อย" :label="`ชำระเงินเรียบร้อย (${counts['ชำระเงินเรียบร้อย']})`" />
      <q-tab name="ยกเลิก" :label="`ยกเลิก (${counts['ยกเลิก']})`" />
    </q-tabs>

    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 0 0 8px 8px; border-top: none;">
      <q-card-section>

        <div class="row items-center q-mb-md q-gutter-x-sm justify-between">
          <div class="row q-gutter-sm">
            <q-input outlined dense v-model="search" placeholder="ค้นหาชื่อ, เบอร์โทร..." rounded bg-color="grey-1"
              style="width: 280px;">
              <template v-slot:append><q-icon name="search" color="grey-7" /></template>
            </q-input>
            <q-btn outline color="grey-4" text-color="grey-8" icon="tune"
              padding="6px 12px"><q-tooltip>ตัวกรอง</q-tooltip></q-btn>
          </div>

          <div class="row q-gutter-sm">
            <q-btn outline color="green" icon="description" label="Excel" no-caps size="sm" class="q-px-sm" />
            <q-btn outline color="grey-8" icon="print" label="พิมพ์" no-caps size="sm" class="q-px-sm" />
            <q-btn unelevated color="light-blue-6" icon="qr_code_scanner" label="เช็คชื่อเข้าอบรม" text-color="white"
              no-caps size="sm" class="q-px-sm" />
            <q-btn unelevated color="grey-9" icon="add" label="เพิ่มผู้ลงทะเบียน" text-color="white" no-caps size="sm"
              class="q-px-sm" @click="openAddDialog" />
          </div>
        </div>

        <q-table flat :rows="filteredRows" :columns="columns" row-key="id" separator="horizontal" :filter="search"
          table-header-class="bg-grey-1 text-weight-bold text-dark">
          <template v-slot:body-cell-id="props"><q-td :props="props">{{ props.rowIndex + 1 }}</q-td></template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip :color="getStatusColor(props.value).bg" :text-color="getStatusColor(props.value).text" size="sm"
                class="text-weight-bold q-px-sm">
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row justify-center q-gutter-x-sm no-wrap">
                <q-btn unelevated size="sm" color="light-green-3" text-color="dark" icon="search"
                  style="border-radius: 6px; padding: 6px 10px;" />
                <q-btn @click="openStatusDialog(props.row.id, props.row.status)" unelevated size="sm"
                  color="light-blue-1" text-color="dark" icon="edit"
                  style="border-radius: 6px; padding: 6px 10px;"><q-tooltip>เปลี่ยนสถานะ</q-tooltip></q-btn>
                <q-btn @click="onDelete(props.row.id)" unelevated size="sm" color="pink-1" text-color="dark"
                  icon="delete" style="border-radius: 6px; padding: 6px 10px;" />
              </div>
            </q-td>
          </template>
        </q-table>

      </q-card-section>
    </q-card>

    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="width: 700px; max-width: 90vw; border-radius: 8px;">
        <q-card-section class="row items-center q-pb-none border-bottom q-mb-md">
          <div class="text-h6 text-weight-bold">เพิ่มผู้ลงทะเบียน</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="onSaveRegistrant">
            <div class="q-mb-md">
              <div class="text-weight-bold q-mb-xs">ประเภท <span class="text-negative">*</span></div>
              <q-radio v-model="addForm.type" val="บุคคลทั่วไป" label="บุคคลทั่วไป" color="primary" />
              <q-radio v-model="addForm.type" val="บุคลากรภายใน" label="บุคลากรภายใน" color="primary" />
              <q-radio v-model="addForm.type" val="นิสิต" label="นิสิต" color="primary" />
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-md-3">
                <div class="text-weight-bold q-mb-xs">คำนำหน้า <span class="text-negative">*</span></div>
                <q-select outlined dense v-model="addForm.title" :options="titleOptions" />
              </div>
              <div class="col-12 col-md-4">
                <div class="text-weight-bold q-mb-xs">ชื่อ <span class="text-negative">*</span></div>
                <q-input outlined dense v-model="addForm.firstName" :rules="[val => !!val || '']" hide-bottom-space />
              </div>
              <div class="col-12 col-md-5">
                <div class="text-weight-bold q-mb-xs">นามสกุล <span class="text-negative">*</span></div>
                <q-input outlined dense v-model="addForm.lastName" :rules="[val => !!val || '']" hide-bottom-space />
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-md-6">
                <div class="text-weight-bold q-mb-xs">อีเมล <span class="text-negative">*</span></div>
                <q-input outlined dense v-model="addForm.email" type="email" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-weight-bold q-mb-xs">เบอร์โทรศัพท์ <span class="text-negative">*</span></div>
                <q-input outlined dense v-model="addForm.phone" mask="###-###-####" />
              </div>
            </div>

            <div class="q-mb-lg">
              <div class="text-weight-bold q-mb-xs">ส่วนงาน / สังกัด <span class="text-negative">*</span></div>
              <q-input outlined dense v-model="addForm.department" />
            </div>

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="ยกเลิก" color="grey-8" v-close-popup style="border: 1px solid #ddd" />
              <q-btn unelevated label="บันทึกข้อมูล" type="submit" color="blue-6" class="q-px-md" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showStatusDialog">
      <q-card style="width: 400px; border-radius: 8px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">แก้ไขสถานะ</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-weight-bold q-mb-xs">สถานะ <span class="text-negative">*</span></div>
          <q-select outlined dense v-model="editStatusValue" :options="statusOptions" class="q-mb-lg" />

          <div class="row justify-end q-gutter-sm">
            <q-btn flat label="ยกเลิก" color="grey-8" v-close-popup style="border: 1px solid #ddd" />
            <q-btn unelevated label="บันทึก" color="blue-6" class="q-px-md" @click="onSaveStatus" />
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

.border-bottom {
  border-bottom: 1px solid #ebebeb;
  padding-bottom: 12px;
}
</style>
