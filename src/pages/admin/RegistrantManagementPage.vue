<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, type QTableColumn } from 'quasar';
import { useRegistrantStore } from 'src/stores/registrant-store';
import { useUserStore } from 'src/stores/user-store';
import {
  AttendanceStatus,
  ParticipantType,
  ATTENDANCE_STATUS_LABEL,
  ATTENDANCE_STATUS_COLOR,
  type CreateRegistrationDto,
  type UpdateRegistrationDto,
} from 'src/models/registrant';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const registrantStore = useRegistrantStore();
const userStore = useUserStore();

const search = ref('');
const projectId = Number(route.params.projectId);

onMounted(() => {
  userStore.fetchUsers();
  registrantStore.fetchByProject(projectId);
});

// Project name comes from the first registration's project relation
const projectName = computed(
  () => registrantStore.projectRegistrations[0]?.project?.name ?? `โครงการ #${projectId}`,
);
const courseName = computed(
  () => registrantStore.projectRegistrations[0]?.project?.course?.title ?? '',
);

// Filtered rows by search
const filteredRows = computed(() => {
  let rows = registrantStore.projectRegistrations;

  if (search.value.trim()) {
    const kw = search.value.toLowerCase();
    rows = rows.filter((r) => {
      const fullName = `${r.user?.firstName ?? ''} ${r.user?.lastName ?? ''}`.toLowerCase();
      return (
        fullName.includes(kw) ||
        (r.user?.phone ?? '').includes(kw) ||
        (r.user?.email ?? '').toLowerCase().includes(kw)
      );
    });
  }

  return rows.map((r, i) => ({
    ...r,
    index: i + 1,
    fullName: r.user ? `${r.user.firstName} ${r.user.lastName}` : `User #${r.userId}`,
    courseTitle: r.project?.course?.title || r.project?.name || '-',
    department: r.user?.department ?? '-',
    phone: r.user?.phone ?? '-',
    registrationDateDisplay: r.registrationDate
      ? new Date(r.registrationDate).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })
      : '-',
  }));
});

// Table columns
const columns: QTableColumn[] = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center' },
  { name: 'fullName', label: 'ชื่อ-นามสกุล', field: 'fullName', align: 'left', sortable: true },
  { name: 'courseTitle', label: 'หลักสูตร', field: 'courseTitle', align: 'left', sortable: true },
  { name: 'department', label: 'ส่วนงาน', field: 'department', align: 'left' },
  { name: 'phone', label: 'เบอร์โทร', field: 'phone', align: 'center' },
  { name: 'participantType', label: 'ประเภท', field: 'participantType', align: 'center' },
  {
    name: 'registrationDateDisplay',
    label: 'วันที่ลงทะเบียน',
    field: 'registrationDateDisplay',
    align: 'center',
    sortable: true,
  },
  {
    name: 'attendanceStatus',
    label: 'สถานะการเข้าร่วม',
    field: 'attendanceStatus',
    align: 'center',
  },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' },
];

// ========================
// Add Registration Dialog
// ========================
const showAddDialog = ref(false);

// Only participants and existing users can be registered
const allUserOptions = computed(() =>
  userStore.usersList.map((u) => ({
    label: `${u.firstName} ${u.lastName} (${u.username})`,
    value: u.id,
  })),
);

const userOptions = ref<{ label: string; value: number }[]>([]);

const filterUsers = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (!val.trim()) {
      userOptions.value = allUserOptions.value;
    } else {
      const kw = val.toLowerCase();
      userOptions.value = allUserOptions.value.filter((o) => o.label.toLowerCase().includes(kw));
    }
  });
};

const participantTypeOptions = Object.values(ParticipantType);

interface AddForm {
  selectedUser: { label: string; value: number } | null;
  participantType: ParticipantType;
  foodRequirement: string;
}

const defaultAddForm = (): AddForm => ({
  selectedUser: null,
  participantType: ParticipantType.GENERAL,
  foodRequirement: '',
});

const addForm = ref<AddForm>(defaultAddForm());

const openAddDialog = () => {
  addForm.value = defaultAddForm();
  userOptions.value = allUserOptions.value;
  showAddDialog.value = true;
};

const onSaveRegistrant = async () => {
  if (!addForm.value.selectedUser) {
    $q.notify({ type: 'warning', message: 'กรุณาเลือกผู้ใช้งาน' });
    return;
  }
  const dto: CreateRegistrationDto = {
    userId: addForm.value.selectedUser.value,
    projectId,
    participantType: addForm.value.participantType,
    ...(addForm.value.foodRequirement && { foodRequirement: addForm.value.foodRequirement }),
  };

  try {
    await registrantStore.create(dto);
    $q.notify({ type: 'positive', message: 'เพิ่มผู้ลงทะเบียนสำเร็จ' });
    showAddDialog.value = false;
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error';
    $q.notify({ type: 'negative', message: `เพิ่มไม่สำเร็จ: ${msg}` });
  }
};

// ========================
// Edit Status Dialog
// ========================
const showEditDialog = ref(false);
const editingId = ref<number | null>(null);

interface EditForm {
  attendanceStatus: AttendanceStatus;
  foodRequirement: string;
}

const editForm = ref<EditForm>({
  attendanceStatus: AttendanceStatus.PENDING,
  foodRequirement: '',
});

const attendanceStatusOptions = Object.values(AttendanceStatus).map((v) => ({
  label: ATTENDANCE_STATUS_LABEL[v],
  value: v,
}));

const openEditDialog = (row: any) => {
  editingId.value = row.id;
  editForm.value = {
    attendanceStatus: row.attendanceStatus,
    foodRequirement: row.foodRequirement ?? '',
  };
  showEditDialog.value = true;
};

const onSaveEdit = async () => {
  if (!editingId.value) return;
  const dto: UpdateRegistrationDto = {
    attendanceStatus: editForm.value.attendanceStatus,
    ...(editForm.value.foodRequirement && { foodRequirement: editForm.value.foodRequirement }),
  };

  try {
    await registrantStore.update(editingId.value, dto);
    $q.notify({ type: 'positive', message: 'อัปเดตสถานะสำเร็จ' });
    showEditDialog.value = false;
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error';
    $q.notify({ type: 'negative', message: `อัปเดตไม่สำเร็จ: ${msg}` });
  }
};

// ========================
// Delete
// ========================
const onDelete = (id: number) => {
  $q.dialog({
    title: 'ยืนยันการลบ',
    message: 'คุณต้องการลบข้อมูลนี้ใช่หรือไม่?',
    cancel: true,
  }).onOk(async () => {
    try {
      await registrantStore.remove(id);
      $q.notify({ type: 'info', message: 'ลบข้อมูลสำเร็จ' });
    } catch {
      $q.notify({ type: 'negative', message: 'ลบไม่สำเร็จ' });
    }
  });
};
</script>

<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="row items-center q-gutter-x-sm">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="grey-8"
            @click="router.push('/admin/registrants')"
          />
          <div class="text-h6 text-weight-bold">ผู้ลงทะเบียนอบรม</div>
        </div>
        <div class="q-ml-xl q-mt-xs">
          <span class="text-primary text-weight-bold">{{ projectName }}</span>
          <span v-if="courseName" class="text-grey-6 q-ml-sm text-caption">— {{ courseName }}</span>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 8px">
      <q-card-section>
        <!-- Toolbar -->
        <div class="row items-center q-mb-md q-gutter-x-sm justify-between">
          <q-input
            outlined
            dense
            v-model="search"
            placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..."
            rounded
            bg-color="grey-1"
            style="width: 300px"
          >
            <template v-slot:append><q-icon name="search" color="grey-7" /></template>
          </q-input>

          <q-btn
            unelevated
            color="grey-9"
            icon="add"
            label="เพิ่มผู้ลงทะเบียน"
            text-color="white"
            no-caps
            size="sm"
            class="q-px-sm"
            @click="openAddDialog"
          />
        </div>

        <!-- Main Table -->
        <q-table
          flat
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          separator="horizontal"
          :loading="registrantStore.loading"
          table-header-class="bg-grey-1 text-weight-bold text-dark"
          no-data-label="ยังไม่มีผู้ลงทะเบียน"
        >
          <!-- attendanceStatus chip -->
          <template v-slot:body-cell-attendanceStatus="props">
            <q-td :props="props">
              <q-chip
                :color="ATTENDANCE_STATUS_COLOR[props.value as AttendanceStatus]?.bg"
                :text-color="ATTENDANCE_STATUS_COLOR[props.value as AttendanceStatus]?.text"
                size="sm"
                class="text-weight-bold q-px-sm"
              >
                {{ ATTENDANCE_STATUS_LABEL[props.value as AttendanceStatus] ?? props.value }}
              </q-chip>
            </q-td>
          </template>

          <!-- actions -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row justify-center q-gutter-x-sm no-wrap">
                <q-btn
                  @click="openEditDialog(props.row)"
                  unelevated
                  size="sm"
                  color="light-blue-1"
                  text-color="dark"
                  icon="edit"
                  style="border-radius: 6px; padding: 6px 10px"
                >
                  <q-tooltip>แก้ไขสถานะ</q-tooltip>
                </q-btn>
                <q-btn
                  @click="onDelete(props.row.id)"
                  unelevated
                  size="sm"
                  color="pink-1"
                  text-color="dark"
                  icon="delete"
                  style="border-radius: 6px; padding: 6px 10px"
                >
                  <q-tooltip>ลบ</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- ======================== -->
    <!-- Dialog: Add Registration -->
    <!-- ======================== -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="width: 560px; max-width: 95vw; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none border-bottom q-mb-md">
          <div class="text-h6 text-weight-bold">เพิ่มผู้ลงทะเบียน</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <div class="text-weight-bold q-mb-xs">
              ผู้ใช้งาน <span class="text-negative">*</span>
            </div>
            <q-select
              outlined
              dense
              v-model="addForm.selectedUser"
              :options="userOptions"
              option-label="label"
              placeholder="ค้นหาชื่อผู้ใช้งาน..."
              use-input
              input-debounce="200"
              clearable
              @filter="filterUsers"
            />
          </div>

          <div class="q-mb-md">
            <div class="text-weight-bold q-mb-xs">
              ประเภทผู้เข้าร่วม <span class="text-negative">*</span>
            </div>
            <div class="row q-gutter-x-md">
              <q-radio
                v-for="opt in participantTypeOptions"
                :key="opt"
                v-model="addForm.participantType"
                :val="opt"
                :label="opt"
                color="primary"
              />
            </div>
          </div>

          <div class="q-mb-lg">
            <div class="text-weight-bold q-mb-xs">ความต้องการอาหาร (ถ้ามี)</div>
            <q-input
              outlined
              dense
              v-model="addForm.foodRequirement"
              placeholder="เช่น มังสวิรัติ, ไม่ทานหมู"
            />
          </div>

          <div class="row justify-end q-gutter-sm">
            <q-btn
              flat
              label="ยกเลิก"
              color="grey-8"
              v-close-popup
              style="border: 1px solid #ddd"
            />
            <q-btn
              unelevated
              label="บันทึกข้อมูล"
              color="blue-6"
              class="q-px-md"
              @click="onSaveRegistrant"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ======================== -->
    <!-- Dialog: Edit Status      -->
    <!-- ======================== -->
    <q-dialog v-model="showEditDialog">
      <q-card style="width: 420px; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">แก้ไขสถานะ</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="q-mb-md">
            <div class="text-weight-bold q-mb-xs">สถานะการเข้าร่วม</div>
            <q-select
              outlined
              dense
              v-model="editForm.attendanceStatus"
              :options="attendanceStatusOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
            />
          </div>

          <div class="q-mb-lg">
            <div class="text-weight-bold q-mb-xs">ความต้องการอาหาร</div>
            <q-input outlined dense v-model="editForm.foodRequirement" clearable />
          </div>

          <div class="row justify-end q-gutter-sm">
            <q-btn
              flat
              label="ยกเลิก"
              color="grey-8"
              v-close-popup
              style="border: 1px solid #ddd"
            />
            <q-btn unelevated label="บันทึก" color="blue-6" class="q-px-md" @click="onSaveEdit" />
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
