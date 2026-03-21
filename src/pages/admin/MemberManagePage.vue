<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar'; // นำเข้า QTableColumn มาตรฐานของ Quasar
import { useUserStore } from 'src/stores/user-store';
import { useRegistrantStore } from 'src/stores/registrant-store';
import { useProjectStore } from 'src/stores/project-store';
import { useMasterCourseStore } from 'src/stores/masterCourse-store';
import type { UserProfile, UserRole } from 'src/models/user';

const $q = useQuasar();

// --- Stores ---
const userStore = useUserStore();
const registrantStore = useRegistrantStore();
const projectStore = useProjectStore();
const masterCourseStore = useMasterCourseStore();

// --- State ---
const search = ref('');
const filterRoles = ref({ admin: true, staff: true, student: true });

onMounted(() => {
  userStore.fetchUsers();
  registrantStore.fetchRegistrants();
  projectStore.fetchProjects();
  masterCourseStore.fetchCourses();
});

// ==========================================
// ส่วนของการแสดงผลตารางหลัก
// ==========================================
const filteredUsersList = computed(() => {
  const keyword = search.value.toLowerCase().trim();
  return userStore.usersList
    .map((user, index) => ({ ...user, index: index + 1 }))
    .filter((user) => {
      const rolePass = filterRoles.value[user.role];
      const searchPass =
        keyword === '' ||
        user.firstNameTh.toLowerCase().includes(keyword) ||
        user.lastNameTh.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword);
      return rolePass && searchPass;
    });
});

const totalUsers = computed(() => userStore.usersList.length);
const studentCount = computed(() => userStore.usersList.filter((u) => u.role === 'student').length);
const staffCount = computed(() => userStore.usersList.filter((u) => u.role === 'staff').length);

const roleTheme: Record<string, { bg: string; text: string; label: string }> = {
  admin: { bg: 'red-1', text: 'red-9', label: 'ผู้ดูแลระบบ' },
  staff: { bg: 'brown-4', text: 'white', label: 'เจ้าหน้าที่' },
  student: { bg: 'grey-4', text: 'grey-8', label: 'ผู้เข้าอบรม' },
};
const getRoleTheme = (role: string) => roleTheme[role as UserRole] || { bg: 'grey-2', text: 'grey-9', label: 'ไม่ระบุ' };

// ใช้ QTableColumn มาตรฐาน
const columns: QTableColumn[] = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center', style: 'width: 5%' },
  { name: 'fullname', label: 'ชื่อ-นามสกุล', field: 'firstNameTh', align: 'left', style: 'width: 25%' },
  { name: 'username', label: 'Username', field: 'username', align: 'center', style: 'width: 15%' },
  { name: 'memberType', label: 'ประเภทสมาชิก', field: 'role', align: 'center', style: 'width: 15%' },
  { name: 'history', label: 'ประวัติการลงทะเบียน', field: 'history', align: 'center', style: 'width: 15%' },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center', style: 'width: 15%' },
];

const pagination = ref({ page: 1, rowsPerPage: 10 });
watch([search, filterRoles], () => { pagination.value.page = 1; }, { deep: true });

// ==========================================
// Dialog: จัดการฟอร์ม เพิ่ม/แก้ไข สมาชิก
// ==========================================
const showMemberDialog = ref(false);
const isEdit = ref(false);
const titleOptions = ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ศ.'];
const roleOptions = [
  { label: 'ผู้เข้าอบรม (Student)', value: 'student' },
  { label: 'เจ้าหน้าที่ (Staff)', value: 'staff' },
  { label: 'ผู้ดูแลระบบ (Admin)', value: 'admin' }
];

const defaultForm = (): Omit<UserProfile, 'id'> => ({
  username: '', email: '', title: 'นาย', firstNameTh: '', lastNameTh: '',
  phone: '', province: '', organization: '', avatar: '', role: 'student'
});
const memberForm = ref<any>(defaultForm());

const openAddDialog = () => {
  isEdit.value = false;
  memberForm.value = defaultForm();
  showMemberDialog.value = true;
};

const editMember = (user: UserProfile) => {
  isEdit.value = true;
  memberForm.value = JSON.parse(JSON.stringify(user));
  showMemberDialog.value = true;
};

const saveMember = () => {
  if (isEdit.value) {
    userStore.updateUser(memberForm.value);
    $q.notify({ type: 'positive', message: 'อัปเดตข้อมูลสมาชิกสำเร็จ' });
  } else {
    userStore.addUser(memberForm.value);
    $q.notify({ type: 'positive', message: 'เพิ่มสมาชิกใหม่สำเร็จ' });
  }
  showMemberDialog.value = false;
};

// ฟังก์ชันลบสมาชิก
// ฟังก์ชันลบสมาชิก
const deleteMember = (user: any) => {
  // ลอง Console.log เช็กว่าค่าเข้ามาจริงไหม (กด F12 ดูได้ครับ)
  console.log('กำลังขอลบข้อมูลของ:', user);

  if (!user || !user.id) {
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาด: ไม่พบ ID ของสมาชิก' });
    return;
  }

  $q.dialog({
    title: 'ยืนยันการลบข้อมูล',
    message: `คุณต้องการลบข้อมูลสมาชิกของคุณ <b>${user.firstNameTh} ${user.lastNameTh}</b> ใช่หรือไม่?`,
    html: true, // เปิดให้ใช้แท็ก <b> ได้
    cancel: true,
    persistent: true
  }).onOk(() => {
    userStore.deleteUser(user.id);
    $q.notify({ type: 'info', message: 'ลบสมาชิกสำเร็จ' });
  });
};

// ==========================================
// Dialog: ดูประวัติการลงทะเบียน
// ==========================================
const showHistoryDialog = ref(false);
const historyUser = ref<UserProfile | null>(null);
const historyRows = ref<any[]>([]);

const historyColumns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center' as const },
  { name: 'projectName', label: 'โครงการ', field: 'projectName', align: 'left' as const },
  { name: 'courseName', label: 'หลักสูตร', field: 'courseName', align: 'left' as const },
  { name: 'registerDate', label: 'วันที่ลงทะเบียน', field: 'registerDate', align: 'center' as const },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
];

const viewHistory = (user: UserProfile) => {
  historyUser.value = user;
  const userRegs = registrantStore.rawRegistrants.filter(r => r.userId === user.id);
  historyRows.value = userRegs.map((reg, index) => {
    const project = projectStore.projects.find(p => p.id === reg.projectId);
    const mCourse = masterCourseStore.courses.find(c => c.id === reg.courseId);
    return {
      index: index + 1,
      projectName: project?.projectData.projectName || 'ไม่ระบุ',
      courseName: mCourse?.name || 'ไม่ระบุ',
      registerDate: reg.registerDate,
      status: reg.status
    };
  });
  showHistoryDialog.value = true;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ชำระเงินเรียบร้อย': return { bg: 'light-green-2', text: 'green-9' };
    case 'รอตรวจสอบ': return { bg: 'orange-2', text: 'orange-9' };
    case 'รอชำระเงิน': return { bg: 'grey-3', text: 'grey-8' };
    case 'ยกเลิก': return { bg: 'red-2', text: 'red-9' };
    default: return { bg: 'grey-2', text: 'grey-8' };
  }
};
</script>

<template>
  <q-page class="q-pa-md q-pa-lg-xl q-mb-xl">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-8 fade-up" style="animation-delay: 0.1s">
        <q-card flat class="bento-box bg-white full-height q-pa-xl flex column justify-between"
          style="min-height: 200px">
          <div class="row items-start justify-between">
            <div>
              <h1 class="text-h4 text-weight-bolder text-dark q-my-none tracking-tight flex items-center">
                <q-icon name="group" class="q-mr-sm" size="md" color="grey-8" /> ข้อมูลสมาชิก
              </h1>
              <p class="text-grey-6 q-mt-sm q-mb-none text-body1">จัดการข้อมูลสมาชิกที่ใช้ในระบบลงทะเบียนทั้งหมด</p>
            </div>

            <q-btn unelevated text-color="white" icon="person_add" label="เพิ่มสมาชิกใหม่" no-caps
              class="bento-btn-success q-px-md" @click="openAddDialog" />
          </div>

          <div class="row items-center q-gutter-x-xl q-mt-xl">
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-dark line-height-none">{{ totalUsers }}</div>
              <div class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm">
                จำนวนสมาชิกทั้งหมด</div>
            </div>
            <q-separator vertical color="grey-3" style="height: 78px" />
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-teal-6 line-height-none">{{ studentCount }}</div>
              <div class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm">ผู้เข้าอบรม
              </div>
            </div>
            <q-separator vertical color="grey-3" style="height: 78px" />
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-brown-5 line-height-none">{{ staffCount }}</div>
              <div class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm">เจ้าหน้าที่
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-4 fade-up" style="animation-delay: 0.15s">
        <q-card flat class="bento-box bg-white full-height q-pa-xl flex column justify-center">
          <div class="text-h6 text-weight-bold text-dark q-mb-md">ค้นหาและกรองข้อมูล</div>
          <div class="text-caption text-grey-6 text-weight-medium q-mb-sm">ค้นหาชื่อ นามสกุล หรือชื่อผู้ใช้</div>
          <q-input outlined dense v-model="search" placeholder="พิมพ์คำค้นหาที่นี่..." class="bento-input q-mb-lg">
            <template v-slot:prepend><q-icon name="search" color="grey-5" /></template>
          </q-input>

          <div class="text-caption text-grey-6 text-weight-medium q-mb-sm">แสดงประเภทสมาชิก</div>
          <div class="row q-gutter-x-md q-gutter-y-sm">
            <q-checkbox v-model="filterRoles.student" color="teal-5" label="ผู้เข้าอบรม"
              class="bento-checkbox disable-select" dense />
            <q-checkbox v-model="filterRoles.staff" color="brown-5" label="เจ้าหน้าที่"
              class="bento-checkbox disable-select" dense />
            <q-checkbox v-model="filterRoles.admin" color="red-5" label="ผู้ดูแลระบบ"
              class="bento-checkbox disable-select" dense />
          </div>
        </q-card>
      </div>

      <div class="col-12 fade-up" style="animation-delay: 0.2s">
        <q-table flat :rows="filteredUsersList" :columns="columns" row-key="id" v-model:pagination="pagination"
          class="bento-box q-pa-md" table-header-class="bg-grey-1 text-weight-bold text-dark">
          <template v-slot:body-cell-index="props">
            <q-td :props="props"><span class="text-weight-bold text-grey-8">{{ props.row.index }}</span></q-td>
          </template>

          <template v-slot:body-cell-fullname="props">
            <q-td :props="props">
              <div class="column justify-center q-py-xs">
                <span class="text-weight-medium text-dark text-subtitle2 line-height-tight">{{ props.row.title }}{{
                  props.row.firstNameTh }} {{ props.row.lastNameTh }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-username="props">
            <q-td :props="props"><span class="text-weight-medium text-grey-8">{{ props.row.username }}</span></q-td>
          </template>

          <template v-slot:body-cell-memberType="props">
            <q-td :props="props">
              <q-chip :ripple="false"
                :class="`bg-${getRoleTheme(props.row.role).bg} text-${getRoleTheme(props.row.role).text}`" size="13px"
                class="text-weight-bold bento-chip" square flat>
                {{ getRoleTheme(props.row.role).label }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-history="props">
            <q-td :props="props">
              <q-btn unelevated round color="green-7" icon="history" size="sm" class="action-btn-circle"
                @click.stop="viewHistory(props.row)">
                <q-tooltip class="bg-dark text-body2">ดูประวัติการลงทะเบียน</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row justify-center q-gutter-x-md no-wrap">

                <q-btn unelevated round color="blue-8" icon="edit" size="sm" class="action-btn-circle"
                  @click="editMember(props.row)">
                  <q-tooltip class="bg-dark text-body2">แก้ไขข้อมูล</q-tooltip>
                </q-btn>

                <q-btn outline round color="grey-4" text-color="grey-5" icon="delete" size="sm"
                  class="action-btn-circle hover-red" @click="deleteMember(props.row)">
                  <q-tooltip class="bg-dark text-body2">ลบสมาชิก</q-tooltip>
                </q-btn>

              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <q-dialog v-model="showMemberDialog" persistent>
      <q-card style="width: 700px; max-width: 90vw; border-radius: 12px;">
        <q-card-section class="row items-center q-pb-none border-bottom q-mb-md">
          <div class="text-h6 text-weight-bold text-dark flex items-center">
            <q-icon :name="isEdit ? 'edit' : 'person_add'" color="primary" class="q-mr-sm" />
            {{ isEdit ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="scroll" style="max-height: 70vh;">
          <q-form @submit.prevent="saveMember">
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-md-6">
                <div class="text-weight-bold q-mb-xs">Username <span class="text-negative">*</span></div>
                <q-input outlined dense v-model="memberForm.username" :rules="[val => !!val || 'กรุณากรอก Username']" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-weight-bold q-mb-xs">ประเภทสมาชิก <span class="text-negative">*</span></div>
                <q-select outlined dense v-model="memberForm.role" :options="roleOptions" emit-value map-options />
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-md-3">
                <div class="text-weight-bold q-mb-xs">คำนำหน้า <span class="text-negative">*</span></div>
                <q-select outlined dense v-model="memberForm.title" :options="titleOptions" />
              </div>
              <div class="col-12 col-md-4">
                <div class="text-weight-bold q-mb-xs">ชื่อ <span class="text-negative">*</span></div>
                <q-input outlined dense v-model="memberForm.firstNameTh" :rules="[val => !!val || '']"
                  hide-bottom-space />
              </div>
              <div class="col-12 col-md-5">
                <div class="text-weight-bold q-mb-xs">นามสกุล <span class="text-negative">*</span></div>
                <q-input outlined dense v-model="memberForm.lastNameTh" :rules="[val => !!val || '']"
                  hide-bottom-space />
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-md-6">
                <div class="text-weight-bold q-mb-xs">อีเมล</div>
                <q-input outlined dense v-model="memberForm.email" type="email" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-weight-bold q-mb-xs">เบอร์โทรศัพท์ <span class="text-negative">*</span></div>
                <q-input outlined dense v-model="memberForm.phone" mask="###-###-####" unmasked-value
                  :rules="[val => !!val || '']" hide-bottom-space />
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mb-lg">
              <div class="col-12 col-md-6">
                <div class="text-weight-bold q-mb-xs">หน่วยงาน / สังกัด</div>
                <q-input outlined dense v-model="memberForm.organization" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-weight-bold q-mb-xs">จังหวัด</div>
                <q-input outlined dense v-model="memberForm.province" />
              </div>
            </div>

            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="ยกเลิก" color="grey-8" v-close-popup class="bento-btn-cancel" />
              <q-btn unelevated label="บันทึกข้อมูล" type="submit" color="primary" class="bento-btn-submit q-px-md" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showHistoryDialog">
      <q-card style="width: 850px; max-width: 95vw; border-radius: 12px;">
        <q-card-section class="row items-center q-pb-none border-bottom q-mb-sm">
          <div class="text-h6 text-weight-bold text-dark flex items-center">
            <q-icon name="history" color="green-7" class="q-mr-sm" />
            ประวัติการลงทะเบียนของ: <span class="text-primary q-ml-sm">{{ historyUser?.firstNameTh }} {{
              historyUser?.lastNameTh }}</span>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div v-if="historyRows.length === 0" class="text-center q-pa-xl text-grey-6 text-subtitle1">
            <q-icon name="sentiment_dissatisfied" size="xl" class="q-mb-sm block center" style="margin: 0 auto;" />
            สมาชิกท่านนี้ยังไม่เคยมีประวัติการลงทะเบียนอบรม
          </div>

          <q-table v-else flat bordered :rows="historyRows" :columns="historyColumns" row-key="index"
            separator="horizontal" table-header-class="bg-grey-1 text-weight-bold text-dark" hide-bottom>
            <template v-slot:body-cell-projectName="props">
              <q-td :props="props" style="max-width: 250px; white-space: normal; line-height: 1.3;">{{ props.value
              }}</q-td>
            </template>
            <template v-slot:body-cell-courseName="props">
              <q-td :props="props" style="max-width: 250px; white-space: normal; line-height: 1.3;">{{ props.value
              }}</q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip :color="getStatusColor(props.value).bg" :text-color="getStatusColor(props.value).text" size="sm"
                  class="text-weight-bold q-px-sm">
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<style scoped lang="scss">
.tracking-tight {
  letter-spacing: -0.5px;
}

.letter-spacing-1 {
  letter-spacing: 0.8px;
}

.line-height-none {
  line-height: 1;
}

.line-height-tight {
  line-height: 1.2;
}

.border-bottom {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.bento-box {
  background-color: #ffffff;
  border-radius: 24px;
  border: 2px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.05) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.08) !important;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bento-btn-success {
  border-radius: 12px;
  font-weight: 700;
  padding: 8px 20px;
  background-color: #619a6b !important;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    background-color: #4e8257 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(97, 154, 107, 0.3);
  }
}

.bento-btn-submit {
  border-radius: 8px;
  font-weight: 600;
}

.bento-btn-cancel {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.bento-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid transparent;
    transition: all 0.3s ease;

    &::before {
      border-color: #cbd5e1;
    }

    &:hover {
      background: #f1f5f9;
    }

    &:focus-within {
      background: #ffffff;
      border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    }
  }
}

.bento-checkbox {
  :deep(.q-checkbox__bg) {
    border-radius: 6px;
  }

  font-weight: 500;
  color: $dark;
}

.bento-chip {
  border-radius: 20px;
  padding: 4px 16px;
}

.action-btn-circle {
  border-radius: 50% !important;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.hover-red:hover {
  background-color: #fee2e2 !important;
  color: #ef4444 !important;
  border-color: #ef4444 !important;
}

.fade-up {
  opacity: 0;
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* เพิ่มการจัดการขอบตารางให้โค้งมนแบบ Bento */
:deep(.q-table th) {
  font-size: 13px;
  color: #555;
  border-bottom: 2px solid #f0f0f0;
}

:deep(.q-table td) {
  font-size: 13px;
  color: #333;
}

:deep(.q-table__container) {
  border-radius: 24px !important;
}
</style>
