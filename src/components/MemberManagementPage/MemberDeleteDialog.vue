<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  user: any; // UserProfile
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}>();

const closeDialog = () => emit('update:modelValue', false);

const confirmDelete = () => {
  emit('confirm');
  closeDialog();
};
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="custom-dialog" style="width: 450px; max-width: 90vw; padding: 12px">
      <q-card-section class="column items-center text-center q-pt-xl q-pb-md">
        <div
          class="bg-red-1 text-red-6 flex flex-center q-mb-lg"
          style="width: 80px; height: 80px; border-radius: 50%; border: 6px solid #fef2f2"
        >
          <q-icon name="eva-alert-triangle-outline" size="40px" />
        </div>

        <div class="text-h5 text-weight-bolder text-dark tracking-tight q-mb-sm">
          ยืนยันการลบข้อมูล
        </div>
        <div class="text-body1 text-grey-6 q-px-sm" style="line-height: 1.5">
          คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ<br />
          <span class="text-dark text-weight-bold"
            >"{{ user?.firstNameTh }} {{ user?.lastNameTh }}"</span
          ><br />
          การกระทำนี้ไม่สามารถย้อนกลับได้
        </div>
      </q-card-section>

      <q-card-actions class="row q-col-gutter-sm q-px-lg q-pb-lg" align="center">
        <div class="col-6">
          <q-btn
            flat
            label="ยกเลิก"
            color="dark"
            @click="closeDialog"
            class="full-width custom-btn-cancel text-weight-bold"
            no-caps
          />
        </div>
        <div class="col-6">
          <q-btn
            unelevated
            label="ลบข้อมูล"
            color="red-6"
            @click="confirmDelete"
            class="full-width custom-btn-danger text-weight-bold"
            no-caps
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.tracking-tight {
  letter-spacing: -0.5px;
}
.custom-dialog {
  border-radius: 32px !important;
  box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.15) !important;
  background-color: #ffffff;
}
.custom-btn-cancel {
  border-radius: 12px;
  padding: 10px 0;
  background: #f8fafc;
  &:hover {
    background: #e2e8f0;
  }
}
.custom-btn-danger {
  border-radius: 12px;
  padding: 10px 0;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(220, 38, 38, 0.25);
  }
}
</style>
