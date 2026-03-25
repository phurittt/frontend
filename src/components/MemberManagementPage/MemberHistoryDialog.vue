<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  user: any; // UserProfile
  rows: any[]; // ประวัติการลงทะเบียน
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const closeDialog = () => emit('update:modelValue', false);

const historyColumns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center' as const, style: 'width: 10%' },
  { name: 'projectName', label: 'โครงการ', field: 'projectName', align: 'left' as const },
  { name: 'courseName', label: 'หลักสูตร', field: 'courseName', align: 'left' as const },
  {
    name: 'registerDate',
    label: 'วันที่ลงทะเบียน',
    field: 'registerDate',
    align: 'center' as const,
  },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'เข้าร่วมแล้ว':
      return { bg: 'light-green-2', text: 'green-9' };
    case 'รอยืนยัน':
      return { bg: 'orange-2', text: 'orange-9' };
    case 'ขาด':
      return { bg: 'red-2', text: 'red-9' };
    case 'ยกเลิก':
      return { bg: 'grey-3', text: 'grey-8' };
    default:
      return { bg: 'grey-2', text: 'grey-8' };
  }
};
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card
      class="custom-dialog"
      style="width: 850px; max-width: 95vw; display: flex; flex-direction: column; max-height: 90vh"
    >
      <q-card-section
        class="row items-center justify-between q-pa-lg border-bottom sticky-header bg-white"
        style="flex-shrink: 0"
      >
        <div class="row items-center">
          <div
            class="bg-blue-1 text-blue-8 flex flex-center q-mr-md shadow-soft"
            style="width: 46px; height: 46px; border-radius: 50%"
          >
            <q-icon name="history" size="22px" />
          </div>
          <div>
            <div class="text-h6 text-weight-bold text-dark tracking-tight line-height-none q-mb-xs">
              ประวัติการลงทะเบียน
            </div>
            <div class="text-caption text-grey-6 text-weight-medium">
              ของ
              <span class="text-blue-8 text-weight-bold"
                >{{ user?.firstName }} {{ user?.lastName }}</span
              >
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

      <q-card-section class="q-px-xl q-py-lg scroll" style="flex-grow: 1; overflow-y: auto">
        <div v-if="rows.length === 0" class="text-center q-pa-xl text-grey-6 text-subtitle1">
          <q-icon
            name="sentiment_dissatisfied"
            size="48px"
            class="q-mb-md block center text-grey-4"
            style="margin: 0 auto"
          />
          สมาชิกท่านนี้ยังไม่เคยมีประวัติการลงทะเบียนอบรม
        </div>

        <q-table
          v-else
          flat
          bordered
          :rows="rows"
          :columns="historyColumns"
          row-key="index"
          separator="horizontal"
          table-header-class="bg-grey-1 text-weight-bold text-dark"
          hide-bottom
          class="history-table border-radius-16"
        >
          <template v-slot:body-cell-projectName="props">
            <q-td :props="props" style="max-width: 250px; white-space: normal; line-height: 1.4">
              {{ props.value }}
            </q-td>
          </template>
          <template v-slot:body-cell-courseName="props">
            <q-td :props="props" style="max-width: 250px; white-space: normal; line-height: 1.4">
              {{ props.value }}
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.value).bg"
                :text-color="getStatusColor(props.value).text"
                size="sm"
                class="text-weight-bold q-px-sm"
              >
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.tracking-tight {
  letter-spacing: -0.5px;
}
.line-height-none {
  line-height: 1;
}
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-radius-16 {
  border-radius: 16px;
  overflow: hidden;
}
.shadow-soft {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
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
.custom-close-btn {
  transition: transform 0.3s;
  &:hover {
    transform: rotate(90deg);
    background: #f1f5f9;
  }
}
.history-table {
  border: 1px solid rgba(0, 0, 0, 0.04);
}
</style>
