<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import type { UserProfile } from 'src/models/user';
import { USER_ROLE_OPTIONS, ROLE_LABELS, TITLE_OPTIONS } from 'src/models/user';

const $q = useQuasar();
const userStore = useUserStore();
const search = ref('');

// --- ระบบ Filter (ปุ่ม Tune) ---
const filterRoles = ref({
  admin: true,
  staff: true,
  student: true
});

// กรองข้อมูลตามที่ติ๊กเลือกใน Filter
const filteredUsersList = computed(() => {
  return userStore.usersList.filter(user => filterRoles.value[user.role]);
});

// --- ระบบ ฟอร์ม (Dialog) ---
const isDialogOpen = ref(false);
const isEditMode = ref(false);

// โครงสร้างฟอร์มว่างเปล่า
const defaultForm = (): Omit<UserProfile, 'id'> => ({
  username: '', email: '', title: 'นาย', firstNameTh: '', lastNameTh: '',
  phone: '', province: 'กรุงเทพมหานคร', organization: '', avatar: '', role: 'student'
});

const formData = ref<Partial<UserProfile>>(defaultForm());



// --- ฟังก์ชันทำงานของปุ่มต่างๆ ---
const openAddDialog = () => {
  isEditMode.value = false;
  formData.value = defaultForm();
  isDialogOpen.value = true;
};

const openEditDialog = (user: UserProfile) => {
  isEditMode.value = true;
  formData.value = { ...user }; // Clone ข้อมูลมาใส่ฟอร์ม
  isDialogOpen.value = true;
};

const onSubmit = () => {
  if (isEditMode.value && formData.value.id) {
    userStore.updateUser(formData.value as UserProfile);
    $q.notify({ type: 'positive', message: 'อัปเดตข้อมูลสำเร็จ' });
  } else {
    userStore.addUser(formData.value as Omit<UserProfile, 'id'>);
    $q.notify({ type: 'positive', message: 'เพิ่มผู้ใช้งานสำเร็จ' });
  }
  isDialogOpen.value = false;
};

const onDelete = () => {
  if (formData.value.id) {
    $q.dialog({
      title: 'ยืนยันการลบ',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?',
      cancel: true,
      persistent: true
    }).onOk(() => {
      userStore.deleteUser(formData.value.id as string);
      $q.notify({ type: 'info', message: 'ลบผู้ใช้งานสำเร็จ' });
      isDialogOpen.value = false;
    });
  }
};

// --- ตั้งค่าตาราง ---
const columns: QTableColumn[] = [
  { name: 'id', label: 'รหัส', field: 'id', align: 'center', sortable: true },
  { name: 'fullname', label: 'ชื่อ-นามสกุล', field: (row: UserProfile) => `${row.title}${row.firstNameTh} ${row.lastNameTh}`, align: 'left', sortable: true },
  { name: 'username', label: 'ชื่อผู้ใช้งาน', field: 'username', align: 'left' },
  { name: 'department', label: 'ส่วนงาน', field: (row: UserProfile) => row.organization || '-', align: 'left' },
  { name: 'role', label: 'สิทธิ์การใช้งานในระบบ', field: (row: UserProfile) => ROLE_LABELS[row.role] || 'ไม่ระบุ', align: 'left' },
  { name: 'actions', label: 'กำหนดสิทธิ์', field: 'actions', align: 'center' },
];

onMounted(() => {
  userStore.fetchUsers();
});
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการสิทธิ์ผู้ใช้งาน</div>

    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 8px;">
      <q-card-section>
        <div class="row items-center q-mb-md q-gutter-x-sm">
          <q-input outlined dense v-model="search" placeholder="ค้นหาผู้ใช้งาน" rounded bg-color="grey-1"
            style="width: 320px;">
            <template v-slot:append>
              <q-icon name="search" color="grey-7" />
            </template>
          </q-input>

          <q-btn outline color="grey-4" text-color="grey-8" icon="tune" padding="6px 12px">
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item-label header>กรองตามสิทธิ์</q-item-label>
                <q-item tag="label" v-ripple>
                  <q-item-section side><q-checkbox v-model="filterRoles.admin" /></q-item-section>
                  <q-item-section>ผู้ดูแลระบบ</q-item-section>
                </q-item>
                <q-item tag="label" v-ripple>
                  <q-item-section side><q-checkbox v-model="filterRoles.staff" /></q-item-section>
                  <q-item-section>เจ้าหน้าที่จัดฝึกอบรม</q-item-section>
                </q-item>
                <q-item tag="label" v-ripple>
                  <q-item-section side><q-checkbox v-model="filterRoles.student" /></q-item-section>
                  <q-item-section>ผู้เข้าอบรม</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn unelevated color="grey-8" text-color="white" label="เพิ่มผู้ใช้งาน" no-caps
            class="q-px-md text-weight-medium" @click="openAddDialog" />
        </div>

        <q-table flat bordered :rows="filteredUsersList" :columns="columns" row-key="id" separator="horizontal"
          :filter="search" :rows-per-page-options="[10, 20, 50]"
          table-header-class="bg-grey-1 text-weight-bold text-dark">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn unelevated size="12px" color="grey-7" text-color="white" label="กำหนด" class="q-px-sm"
                style="border-radius: 4px;" @click="openEditDialog(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="isDialogOpen" persistent>
      <q-card style="width: 500px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEditMode ? 'แก้ไขข้อมูลและสิทธิ์' : 'เพิ่มผู้ใช้งานใหม่' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">

            <div class="row q-col-gutter-sm">
              <q-select class="col-4" outlined dense v-model="formData.title" :options="TITLE_OPTIONS"
                label="คำนำหน้า" />
              <q-input class="col-4" outlined dense v-model="formData.firstNameTh" label="ชื่อ (TH)"
                :rules="[val => !!val || 'กรุณากรอกชื่อ']" />
              <q-input class="col-4" outlined dense v-model="formData.lastNameTh" label="นามสกุล (TH)"
                :rules="[val => !!val || 'กรุณากรอกนามสกุล']" />
            </div>

            <div class="row q-col-gutter-sm">
              <q-input class="col-6" outlined dense v-model="formData.username" label="Username"
                :rules="[val => !!val || 'กรุณากรอก Username']" />
              <q-input class="col-6" outlined dense v-model="formData.email" type="email" label="อีเมล" />
            </div>

            <q-input outlined dense v-model="formData.organization" label="ส่วนงาน / สังกัด" />

            <q-select outlined dense v-model="formData.role" :options="USER_ROLE_OPTIONS" label="สิทธิ์การใช้งาน"
              emit-value map-options />

            <div class="row justify-between q-mt-md">
              <q-btn v-if="isEditMode" flat color="negative" label="ลบผู้ใช้นี้" @click="onDelete" />
              <div v-else></div>
              <div class="q-gutter-sm">
                <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
                <q-btn unelevated label="บันทึกข้อมูล" type="submit" color="primary" />
              </div>
            </div>

          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<style scoped>
:deep(.q-table th) {
  font-size: 13px;
  color: #555;
}

:deep(.q-table td) {
  font-size: 14px;
  color: #333;
}
</style>
