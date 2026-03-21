<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import { useRegistrantStore } from 'src/stores/registrant-store';
import { useProjectStore } from 'src/stores/project-store';
import { useMasterCourseStore } from 'src/stores/masterCourse-store';
import type { UserProfile, UserRole } from 'src/models/user';

import CustomTableComponent from 'components/CustomTableComponent.vue';
import type { TableColumn } from 'components/CustomTableComponent.vue';

import MemberManagementFormDialog from 'components/MemberManagementPage/MemberManagementFormDialog.vue';
import MemberHistoryDialog from 'components/MemberManagementPage/MemberHistoryDialog.vue';
import MemberDeleteDialog from 'components/MemberManagementPage/MemberDeleteDialog.vue';

const $q = useQuasar();

// --- Stores ---
const userStore = useUserStore();
const registrantStore = useRegistrantStore();
const projectStore = useProjectStore();
const masterCourseStore = useMasterCourseStore();

// --- State ---
const search = ref('');
const filterRoles = ref({ student: true });

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

  return userStore.usersList.filter((user) => {
    const isStudent = user.role === 'student';
    if (!isStudent) return false;

    const rolePass = filterRoles.value[user.role as keyof typeof filterRoles.value];
    const fullName = `${user.firstNameTh} ${user.lastNameTh}`.toLowerCase();
    const paddedId = String(user.id).padStart(9, '0');
    const rawId = String(user.id);

    const searchPass =
      keyword === '' ||
      fullName.includes(keyword) ||
      user.username.toLowerCase().includes(keyword) ||
      paddedId.includes(keyword) ||
      rawId.includes(keyword);

    return rolePass && searchPass;
  });
});

const studentCount = computed(() => userStore.usersList.filter((u) => u.role === 'student').length);

const roleTheme: Record<string, { bg: string; text: string; label: string }> = {
  student: { bg: 'teal-1', text: 'teal-9', label: 'ผู้เข้าอบรม' },
};
const getRoleTheme = (role: string) =>
  roleTheme[role as UserRole] || { bg: 'grey-2', text: 'grey-9', label: 'ไม่ระบุ' };

const columns: TableColumn[] = [
  {
    name: 'fullname',
    label: 'ข้อมูลสมาชิก',
    field: 'firstNameTh',
    align: 'left',
    style: 'width: 30%',
  },
  {
    name: 'username',
    label: 'รหัสและชื่อผู้ใช้',
    field: 'username',
    align: 'left',
    style: 'width: 25%',
  },
  {
    name: 'joinDate',
    label: 'วันที่สมัครสมาชิก',
    field: 'createdAt',
    align: 'left',
    style: 'width: 20%',
  },
  {
    name: 'history',
    label: 'ประวัติลงทะเบียน',
    field: 'history',
    align: 'center',
    style: 'width: 15%',
  },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center', style: 'width: 10%' },
];

const pagination = ref({ page: 1, rowsPerPage: 10 });
watch(
  [search, filterRoles],
  () => {
    pagination.value.page = 1;
  },
  { deep: true },
);

const formatDate = (dateString?: string) => {
  if (!dateString) return { date: '-', time: '-' };
  const d = new Date(dateString);
  const optionsDate: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

  return {
    date: d.toLocaleDateString('th-TH', optionsDate),
    time: d.toLocaleTimeString('th-TH', optionsTime) + ' น.',
  };
};

// ==========================================
// Dialog States
// ==========================================

// 1. Form Add/Edit
const isDialogOpen = ref(false);
const selectedUser = ref<UserProfile | null>(null);

const openAddDialog = () => {
  selectedUser.value = null;
  isDialogOpen.value = true;
};

const editMember = (row: UserProfile) => {
  selectedUser.value = row;
  isDialogOpen.value = true;
};

// 2. History Dialog
const isHistoryOpen = ref(false);
const historyUser = ref<UserProfile | null>(null);
const historyRows = ref<any[]>([]);

const viewHistory = (user: UserProfile) => {
  historyUser.value = user;
  const userRegs = registrantStore.rawRegistrants.filter((r) => r.userId === user.id);
  historyRows.value = userRegs.map((reg, index) => {
    const project = projectStore.projects.find((p) => p.id === reg.projectId);
    const mCourse = masterCourseStore.courses.find((c) => c.id === reg.courseId);
    return {
      index: index + 1,
      projectName: project?.projectData.projectName || 'ไม่ระบุ',
      courseName: mCourse?.name || 'ไม่ระบุ',
      registerDate: reg.registerDate,
      status: reg.status,
    };
  });
  isHistoryOpen.value = true;
};

// 3. Delete Dialog
const isDeleteOpen = ref(false);
const userToDelete = ref<UserProfile | null>(null);

const promptDelete = (user: UserProfile) => {
  userToDelete.value = user;
  isDeleteOpen.value = true;
};

const executeDelete = () => {
  if (userToDelete.value?.id) {
    userStore.deleteUser(userToDelete.value.id);
    $q.notify({
      type: 'info',
      icon: 'delete',
      message: 'ลบผู้เข้าอบรมเรียบร้อยแล้ว',
      position: 'top',
    });
  }
};
</script>

<template>
  <q-page class="q-pa-md q-pa-lg-xl q-mb-xl">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-8 fade-up" style="animation-delay: 0.1s">
        <q-card
          flat
          class="bento-box bg-white full-height q-pa-xl flex column justify-between"
          style="min-height: 200px"
        >
          <div class="row items-start justify-between">
            <div class="col-12 col-sm-auto q-mb-md q-mb-sm-none">
              <h1 class="text-h4 text-weight-bolder text-dark q-my-none tracking-tight">
                จัดการข้อมูลสมาชิก
              </h1>
              <p class="text-grey-6 q-mt-sm q-mb-none text-body1">
                จัดการข้อมูลสมาชิกทั้งหมดในระบบ
              </p>
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn
                unelevated
                text-color="white"
                icon="person_add"
                label="เพิ่มสมาชิกใหม่"
                no-caps
                class="bento-btn-success q-px-md"
                @click="openAddDialog"
              />
            </div>
          </div>

          <div class="row items-center q-gutter-x-xl q-mt-xl">
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-teal-5 line-height-none">
                {{ studentCount }}
              </div>
              <div
                class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm"
              >
                จำนวนสมาชิกทั้งหมด
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-4 fade-up" style="animation-delay: 0.15s">
        <q-card flat class="bento-box bg-white full-height q-pa-xl flex column justify-center">
          <div class="text-h6 text-weight-bold text-dark q-mb-md">ค้นหาข้อมูล</div>
          <div class="text-caption text-grey-6 text-weight-medium q-mb-sm">พิมพ์คำค้นหา</div>
          <q-input
            outlined
            dense
            v-model="search"
            placeholder="ชื่อ-สกุล, ชื่อผู้ใช้, รหัสผู้ใช้..."
            class="bento-input"
          >
            <template v-slot:prepend><q-icon name="search" color="grey-5" /></template>
          </q-input>
        </q-card>
      </div>

      <div class="col-12 fade-up" style="animation-delay: 0.2s">
        <CustomTableComponent
          :rows="filteredUsersList"
          :columns="columns"
          v-model:pagination="pagination"
        >
          <template #body-cell-fullname="{ row }">
            <div class="row items-center no-wrap">
              <q-avatar
                size="40px"
                :class="`bg-${getRoleTheme(row.role).bg} text-${getRoleTheme(row.role).text}`"
                class="bento-avatar q-mr-md"
              >
                <img v-if="row.avatar" :src="row.avatar" />
                <span v-else class="text-weight-bolder">{{ row.firstNameTh.charAt(0) }}</span>
              </q-avatar>
              <div class="column justify-center">
                <span class="text-weight-bold text-dark text-subtitle2 line-height-tight"
                  >{{ row.title }}{{ row.firstNameTh }} {{ row.lastNameTh }}</span
                >
                <span class="text-caption text-grey-5 q-mt-xs">{{
                  row.email || 'ไม่มีข้อมูลอีเมล'
                }}</span>
              </div>
            </div>
          </template>

          <template #body-cell-username="{ row }">
            <div class="column justify-center q-py-xs">
              <div class="flex items-center q-mb-xs">
                <div class="icon-box q-mr-sm">
                  <q-icon name="eva-hash" size="14px" color="grey-5" />
                </div>
                <span
                  class="text-grey-6 text-caption text-weight-medium"
                  style="letter-spacing: 0.5px"
                >
                  {{ String(row.id).padStart(9, '0') }}
                </span>
              </div>
              <div class="flex items-center">
                <div class="icon-box q-mr-sm">
                  <q-icon name="eva-at" size="14px" color="teal-6" />
                </div>
                <span class="text-weight-bold text-subtitle2 text-dark">
                  {{ row.username }}
                </span>
              </div>
            </div>
          </template>

          <template #body-cell-joinDate="{ row }">
            <div class="flex items-center">
              <div class="icon-box q-mr-sm bg-grey-1">
                <q-icon name="eva-calendar-outline" size="14px" color="grey-6" />
              </div>
              <div class="column justify-center">
                <span class="text-weight-bold text-grey-8" style="font-size: 13px">
                  {{ formatDate(row.createdAt).date }}
                </span>
                <span class="text-caption text-grey-5" style="margin-top: -2px">
                  เวลา {{ formatDate(row.createdAt).time }}
                </span>
              </div>
            </div>
          </template>

          <template #body-cell-history="{ row }">
            <q-btn
              flat
              round
              color="blue-8"
              icon="eva-clock-outline"
              size="md"
              class="bento-action-btn bg-blue-1"
              @click.stop="viewHistory(row)"
            >
              <q-tooltip class="bg-dark text-body2">ดูประวัติการลงทะเบียน</q-tooltip>
            </q-btn>
          </template>

          <template #body-cell-actions="{ row }">
            <div class="row justify-center q-gutter-x-sm no-wrap">
              <q-btn
                flat
                round
                color="green-7"
                icon="eva-edit"
                size="md"
                class="bento-action-btn bg-green-1"
                @click="editMember(row)"
              >
                <q-tooltip class="bg-dark text-body2">แก้ไขข้อมูล</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="red-6"
                icon="eva-trash-2"
                size="md"
                class="bento-action-btn bg-red-1"
                @click="promptDelete(row)"
              >
                <q-tooltip class="bg-dark text-body2">ลบสมาชิก</q-tooltip>
              </q-btn>
            </div>
          </template>
        </CustomTableComponent>
      </div>
    </div>

    <MemberManagementFormDialog v-model="isDialogOpen" :user-to-edit="selectedUser" />
    <MemberHistoryDialog v-model="isHistoryOpen" :user="historyUser" :rows="historyRows" />
    <MemberDeleteDialog v-model="isDeleteOpen" :user="userToDelete" @confirm="executeDelete" />
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

.bento-box {
  background-color: #ffffff;
  border-radius: 24px;
  border: 2px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.05) !important;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
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
  background-color: #0d9488 !important;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  &:hover {
    background-color: #0f766e !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(13, 148, 136, 0.3);
  }
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

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background-color: transparent;
}

.bento-avatar {
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  font-weight: 800;
}

.bento-action-btn {
  transition: all 0.2s;
  &:hover {
    filter: brightness(0.95);
    transform: scale(1.05);
  }
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
</style>
