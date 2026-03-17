<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import type { UserProfile } from 'src/models/user';
import { USER_ROLE_OPTIONS, TITLE_OPTIONS } from 'src/models/user';

const props = defineProps<{
  modelValue: boolean;
  userToEdit: UserProfile | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const $q = useQuasar();
const userStore = useUserStore();

const defaultForm = (): Omit<UserProfile, 'id'> => ({
  username: '',
  email: '',
  title: 'นาย',
  firstNameTh: '',
  lastNameTh: '',
  phone: '',
  province: 'กรุงเทพมหานคร',
  organization: '',
  avatar: '',
  role: 'student',
});

const formData = ref<Partial<UserProfile>>(defaultForm());
const isEditMode = ref(false);

watch(
  () => props.userToEdit,
  (newUser) => {
    if (newUser) {
      isEditMode.value = true;
      formData.value = { ...newUser };
    } else {
      isEditMode.value = false;
      formData.value = defaultForm();
    }
  },
  { immediate: true },
);

const closeDialog = () => {
  emit('update:modelValue', false);
};

const onSubmit = () => {
  const isUpdate = isEditMode.value && formData.value.id;
  if (isUpdate) {
    userStore.updateUser(formData.value as UserProfile);
  } else {
    userStore.addUser(formData.value as Omit<UserProfile, 'id'>);
  }

  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: isUpdate ? 'อัปเดตข้อมูลสำเร็จ' : 'เพิ่มผู้ใช้งานสำเร็จ',
    position: 'top',
    color: 'dark',
  });
  closeDialog();
};

const onDelete = () => {
  if (formData.value.id) {
    $q.dialog({
      title: 'ลบผู้ใช้งาน',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?',
      cancel: { flat: true, color: 'grey-6', label: 'ยกเลิก', noCaps: true },
      ok: { unelevated: true, color: 'negative', label: 'ลบข้อมูล', noCaps: true, rounded: true },
      class: 'custom-dialog',
    }).onOk(() => {
      userStore.deleteUser(formData.value.id as string);
      $q.notify({ type: 'info', icon: 'delete', message: 'ลบผู้ใช้งานแล้ว', position: 'top' });
      closeDialog();
    });
  }
};
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card
      class="custom-dialog"
      style="width: 640px; max-width: 95vw; display: flex; flex-direction: column"
    >
      <q-form
        @submit="onSubmit"
        style="display: flex; flex-direction: column; flex-grow: 1; max-height: 90vh"
      >
        <q-card-section
          class="row items-center justify-between q-pa-lg border-bottom sticky-header bg-white"
          style="flex-shrink: 0"
        >
          <div class="row items-center">
            <q-avatar
              :color="isEditMode ? 'grey-2' : 'dark'"
              :text-color="isEditMode ? 'dark' : 'white'"
              size="46px"
              class="q-mr-md shadow-soft"
            >
              <q-icon :name="isEditMode ? 'edit_document' : 'person_add_alt_1'" size="22px" />
            </q-avatar>
            <div>
              <div
                class="text-h6 text-weight-bold text-dark tracking-tight line-height-none q-mb-xs"
              >
                {{ isEditMode ? 'แก้ไขข้อมูลบัญชีผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่' }}
              </div>
              <div class="text-caption text-grey-5 text-weight-medium">
                {{
                  isEditMode
                    ? 'อัปเดตรายละเอียดและสิทธิ์การเข้าถึงระบบ'
                    : 'ระบุข้อมูลพื้นฐานเพื่อสร้างบัญชีผู้ใช้งานใหม่'
                }}
              </div>
            </div>
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            color="grey-5"
            @click="closeDialog"
            class="custom-close-btn"
          />
        </q-card-section>

        <q-card-section class="q-pa-xl scroll" style="flex-grow: 1; overflow-y: auto">
          <div class="q-gutter-y-xl">
            <div>
              <div class="row items-center q-mb-md">
                <div class="bg-grey-2 q-pa-xs border-radius-8 q-mr-sm flex flex-center">
                  <q-icon name="badge" color="dark" size="18px" />
                </div>
                <span
                  class="text-subtitle2 text-weight-bold text-dark letter-spacing-1 text-uppercase"
                  >ข้อมูลส่วนบุคคล</span
                >
              </div>
              <div class="row q-col-gutter-md">
                <q-select
                  class="col-12 col-sm-3"
                  outlined
                  dense
                  v-model="formData.title"
                  :options="TITLE_OPTIONS"
                  label="คำนำหน้า"
                />
                <q-input
                  class="col-12 col-sm-4"
                  outlined
                  dense
                  v-model="formData.firstNameTh"
                  label="ชื่อจริง"
                  :rules="[(val) => !!val || '']"
                  hide-bottom-space
                />
                <q-input
                  class="col-12 col-sm-5"
                  outlined
                  dense
                  v-model="formData.lastNameTh"
                  label="นามสกุล"
                  :rules="[(val) => !!val || '']"
                  hide-bottom-space
                />
                <q-input
                  class="col-12"
                  outlined
                  dense
                  v-model="formData.organization"
                  label="สังกัด / หน่วยงาน"
                  hide-bottom-space
                />
              </div>
            </div>

            <div>
              <div class="row items-center q-mb-md">
                <div class="bg-grey-2 q-pa-xs border-radius-8 q-mr-sm flex flex-center">
                  <q-icon name="login" color="dark" size="18px" />
                </div>
                <span
                  class="text-subtitle2 text-weight-bold text-dark letter-spacing-1 text-uppercase"
                  >ข้อมูลเข้าสู่ระบบ</span
                >
              </div>
              <div class="row q-col-gutter-md">
                <q-input
                  class="col-12 col-sm-6"
                  outlined
                  dense
                  v-model="formData.username"
                  label="Username"
                  :rules="[(val) => !!val || '']"
                  hide-bottom-space
                >
                  <template v-slot:prepend
                    ><q-icon name="eva-hash" size="18px" color="grey-5"
                  /></template>
                </q-input>
                <q-input
                  class="col-12 col-sm-6"
                  outlined
                  dense
                  v-model="formData.email"
                  type="email"
                  label="อีเมลติดต่อ"
                  hide-bottom-space
                >
                  <template v-slot:prepend
                    ><q-icon name="mail" size="18px" color="grey-5"
                  /></template>
                </q-input>
              </div>
            </div>

            <div class="bg-grey-1 q-pa-lg border-radius-16 border-soft">
              <div class="row items-center justify-between">
                <div class="row items-center">
                  <q-avatar color="white" text-color="dark" size="40px" class="shadow-soft q-mr-md">
                    <q-icon name="admin_panel_settings" size="20px" />
                  </q-avatar>
                  <div>
                    <div class="text-weight-bold text-dark text-subtitle2">
                      ระดับสิทธิ์การใช้งาน
                    </div>
                    <div class="text-caption text-grey-6 line-height-tight">
                      กำหนดขอบเขตการเข้าถึงหน้าต่างต่างๆ
                    </div>
                  </div>
                </div>
                <q-select
                  outlined
                  dense
                  v-model="formData.role"
                  :options="USER_ROLE_OPTIONS"
                  emit-value
                  map-options
                  style="min-width: 180px"
                  bg-color="white"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions
          class="row items-center justify-between q-px-xl q-py-lg border-top bg-white z-top"
          style="flex-shrink: 0"
        >
          <q-btn
            v-if="isEditMode"
            flat
            color="red-6"
            icon="eva-trash-2-outline"
            label="ลบผู้ใช้งาน"
            @click="onDelete"
            no-caps
            class="custom-btn-danger text-weight-bold"
          />
          <div v-else></div>
          <div class="row q-gutter-x-sm">
            <q-btn
              flat
              label="ยกเลิก"
              color="dark"
              @click="closeDialog"
              no-caps
              class="custom-btn-cancel text-weight-bold q-px-md"
            />
            <q-btn
              unelevated
              label="บันทึกข้อมูล"
              type="submit"
              color="dark"
              no-caps
              class="custom-btn-submit text-weight-bold q-px-xl"
            />
          </div>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
/* --- Core Utility Styles --- */
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.border-soft {
  border: 1px solid rgba(0, 0, 0, 0.03);
}
.border-radius-8 {
  border-radius: 8px;
}
.border-radius-16 {
  border-radius: 16px;
}
.shadow-soft {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.z-top {
  z-index: 10;
}

.custom-dialog {
  border-radius: 32px !important;
  box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.15) !important;
  background-color: #ffffff;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.custom-btn-danger {
  border-radius: 12px;
  &:hover {
    background: #fef2f2;
  }
}
.custom-btn-cancel {
  border-radius: 12px;
  &:hover {
    background: #f1f5f9;
  }
}
.custom-btn-submit {
  border-radius: 12px;
  background-color: $dark !important;
  transition: transform 0.2s;
  &:hover {
    background-color: #424242 !important;
    transform: translateY(-2px);
  }
}
.custom-close-btn {
  transition: transform 0.3s;
  &:hover {
    transform: rotate(90deg);
    background: #f1f5f9;
  }
}

/* --- Inputs & Forms --- */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
  &::before {
    border: 1px solid rgba(0, 0, 0, 0.04);
  }
  &:hover {
    background: #f1f5f9;
  }
  &:hover::before {
    border-color: #cbd5e1;
  }
}

:deep(.q-field--outlined.q-field--focused .q-field__control) {
  background: #ffffff;
  &::after {
    border-color: $dark !important;
    border-width: 2px;
  }
}

:deep(.q-field--focused .q-field__label) {
  color: $dark !important;
}

:deep(.q-field--error .q-field__control) {
  background: #fffafa;
  &::before {
    border-color: #fca5a5 !important;
  }
}
</style>
