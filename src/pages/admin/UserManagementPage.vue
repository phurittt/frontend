<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useUserStore } from 'src/stores/user-store';
import type { User, UserRole } from 'src/models/user';

import CustomTableComponent from 'components/CustomTableComponent.vue';
import type { TableColumn } from 'components/CustomTableComponent.vue';

const userStore = useUserStore();
const search = ref('');

// --- Filter ---
const filterRoles = ref({ admin: true, staff: true, participant: true });

const filteredUsersList = computed(() => {
  const keyword = search.value.toLowerCase().trim();

  return userStore.usersList.filter((user) => {
    const rolePass = filterRoles.value[user.role as keyof typeof filterRoles.value];
    if (!rolePass) return false;

    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

    const searchPass =
      keyword === '' || fullName.includes(keyword) || user.username.toLowerCase().includes(keyword);

    return searchPass;
  });
});

// --- Stats ---
const totalUsers = computed(() => userStore.usersList.length);
const adminCount = computed(() => userStore.usersList.filter((u) => u.role === 'admin').length);
const staffCount = computed(() => userStore.usersList.filter((u) => u.role === 'staff').length);
const participantCount = computed(
  () => userStore.usersList.filter((u) => u.role === 'participant').length,
);

const roleTheme: Record<string, { bg: string; text: string; label: string }> = {
  admin: { bg: 'red-1', text: 'red-9', label: 'ผู้ดูแลระบบ' },
  staff: { bg: 'blue-1', text: 'blue-9', label: 'เจ้าหน้าที่' },
  participant: { bg: 'teal-1', text: 'teal-9', label: 'ผู้เข้าอบรม' },
};
const getRoleTheme = (role: string) =>
  roleTheme[role as UserRole] || { bg: 'grey-2', text: 'grey-9', label: 'ไม่ระบุ' };

// --- Role Assignment Dialog ---
const isRoleDialogOpen = ref(false);
const selectedUser = ref<User | null>(null);
const selectedRole = ref<UserRole>('staff');

const roleOptions = [
  { label: 'ผู้ดูแลระบบ (Admin)', value: 'admin' },
  { label: 'เจ้าหน้าที่ (Staff)', value: 'staff' },
  { label: 'ผู้เข้าอบรม (Participant)', value: 'participant' },
];

const openRoleDialog = (user: User) => {
  selectedUser.value = user;
  selectedRole.value = user.role;
  isRoleDialogOpen.value = true;
};

const saveRole = async () => {
  if (!selectedUser.value) return;
  try {
    await userStore.updateUserRole(selectedUser.value.id, selectedRole.value);
    isRoleDialogOpen.value = false;
  } catch (err) {
    console.error('Failed to update role:', err);
  }
};

// --- Table Config ---
const columns: TableColumn[] = [
  {
    name: 'fullname',
    label: 'ชื่อ-นามสกุล',
    field: (row: User) => `${row.firstName} ${row.lastName}`,
    align: 'left',
    style: 'width: 25%',
  },
  {
    name: 'username',
    label: 'ชื่อผู้ใช้งาน',
    field: 'username',
    align: 'left',
    style: 'width: 20%',
  },
  {
    name: 'department',
    label: 'ส่วนงาน',
    field: (row: User) => row.department || '-',
    align: 'left',
    style: 'width: 20%',
  },
  {
    name: 'role',
    label: 'สิทธิ์',
    field: 'role',
    align: 'center',
    style: 'width: 15%',
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'center',
    style: 'width: 10%',
  },
];

const pagination = ref({ page: 1, rowsPerPage: 10 });
watch(
  [search, filterRoles],
  () => {
    pagination.value.page = 1;
  },
  { deep: true },
);

onMounted(() => {
  userStore.fetchUsers();
});
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
                บุคลากรและสิทธิ์
              </h1>
              <p class="text-grey-6 q-mt-sm q-mb-none text-body1">
                จัดการข้อมูลบุคลากรและสิทธิ์การเข้าถึงระบบ
              </p>
            </div>
          </div>

          <div class="row items-center q-gutter-x-xl q-mt-xl">
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-dark line-height-none">
                {{ totalUsers }}
              </div>
              <div
                class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm"
              >
                จำนวนผู้ใช้ทั้งหมด
              </div>
            </div>
            <q-separator vertical color="grey-3" style="height: 78px" />
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-blue-5 line-height-none">
                {{ staffCount }}
              </div>
              <div
                class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm"
              >
                เจ้าหน้าที่
              </div>
            </div>
            <q-separator vertical color="grey-3" style="height: 78px" />
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-red-5 line-height-none">
                {{ adminCount }}
              </div>
              <div
                class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm"
              >
                ผู้ดูแลระบบ
              </div>
            </div>
            <q-separator vertical color="grey-3" style="height: 78px" />
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-teal-5 line-height-none">
                {{ participantCount }}
              </div>
              <div
                class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm"
              >
                ผู้เข้าอบรม
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-4 fade-up" style="animation-delay: 0.15s">
        <q-card flat class="bento-box bg-white full-height q-pa-xl flex column justify-center">
          <div class="text-h6 text-weight-bold text-dark q-mb-md">ค้นหาและกรองข้อมูล</div>
          <div class="text-caption text-grey-6 text-weight-medium q-mb-sm">ค้นหาผู้ใช้งาน</div>
          <q-input
            outlined
            dense
            v-model="search"
            placeholder="ชื่อ-สกุล, ชื่อผู้ใช้..."
            class="bento-input q-mb-lg"
            ><template v-slot:prepend><q-icon name="search" color="grey-5" /></template
          ></q-input>
          <div class="text-caption text-grey-6 text-weight-medium q-mb-sm">แสดงสิทธิ์การใช้งาน</div>
          <div class="row q-gutter-x-md q-gutter-y-sm">
            <q-checkbox
              v-model="filterRoles.admin"
              color="red-5"
              label="ผู้ดูแลระบบ"
              class="bento-checkbox disable-select"
              dense
            />
            <q-checkbox
              v-model="filterRoles.staff"
              color="blue-5"
              label="เจ้าหน้าที่"
              class="bento-checkbox disable-select"
              dense
            />
            <q-checkbox
              v-model="filterRoles.participant"
              color="teal-5"
              label="ผู้เข้าอบรม"
              class="bento-checkbox disable-select"
              dense
            />
          </div>
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
                <span class="text-weight-bolder">{{ row.firstName.charAt(0) }}</span>
              </q-avatar>
              <span class="text-weight-bold text-dark text-subtitle2">
                {{ row.firstName }} {{ row.lastName }}
              </span>
            </div>
          </template>

          <template #body-cell-username="{ row }">
            <span class="text-weight-bold text-subtitle2 text-dark">
              {{ row.username }}
            </span>
          </template>

          <template #body-cell-department="{ row }">
            <span class="text-weight-medium text-grey-8">{{ row.department || '-' }}</span>
          </template>

          <template #body-cell-role="{ row }">
            <q-chip
              :ripple="false"
              :class="`bg-${getRoleTheme(row.role).bg} text-${getRoleTheme(row.role).text}`"
              size="13px"
              class="text-weight-medium bento-chip"
              square
              flat
            >
              {{ getRoleTheme(row.role).label }}
            </q-chip>
          </template>

          <template #body-cell-actions="{ row }">
            <q-btn
              flat
              round
              color="grey-6"
              icon="admin_panel_settings"
              size="md"
              class="bento-action-btn bg-grey-1"
              @click="openRoleDialog(row)"
            >
              <q-tooltip class="bg-dark text-body2">กำหนดสิทธิ์</q-tooltip>
            </q-btn>
          </template>
        </CustomTableComponent>
      </div>
    </div>

    <!-- Role Assignment Dialog -->
    <q-dialog v-model="isRoleDialogOpen" persistent>
      <q-card style="min-width: 400px; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">กำหนดสิทธิ์ผู้ใช้งาน</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedUser" class="q-pt-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            {{ selectedUser.firstName }} {{ selectedUser.lastName }}
            <span class="text-grey-6">({{ selectedUser.username }})</span>
          </div>

          <q-select
            v-model="selectedRole"
            :options="roleOptions"
            emit-value
            map-options
            outlined
            dense
            label="สิทธิ์การใช้งาน"
            class="q-mb-md"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="ยกเลิก" color="grey-7" no-caps v-close-popup />
          <q-btn
            unelevated
            label="บันทึก"
            text-color="white"
            no-caps
            class="bento-btn-primary"
            @click="saveRole"
          />
        </q-card-actions>
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

.bento-btn-primary {
  border-radius: 12px;
  font-weight: 700;
  padding: 8px 20px;
  background-color: #ff9966 !important;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    background-color: #ff8060 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(97, 154, 107, 0.3);
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
.bento-checkbox {
  :deep(.q-checkbox__bg) {
    border-radius: 6px;
  }
  font-weight: 500;
  color: $dark;
}

.bento-avatar {
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  font-weight: 800;
}
.bento-chip {
  border-radius: 8px;
  padding: 4px 10px;
}
.bento-action-btn {
  transition: all 0.2s;
  &:hover {
    background: #f1f5f9 !important;
    color: $dark !important;
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
