<script setup lang="ts">
import { computed } from 'vue';

// โครงสร้างที่หน้าแม่ต้องส่งมาให้
export interface TableColumn {
  name: string;
  label: string;
  field: string | ((row: any) => any);
  align?: 'left' | 'center' | 'right';
  style?: string;
}

const props = defineProps<{
  rows: any[];
  columns: TableColumn[];
  pagination: { page: number; rowsPerPage: number };
}>();

const emit = defineEmits<{
  (e: 'update:pagination', val: { page: number; rowsPerPage: number }): void;
}>();

// --- Pagination Logic ---
const totalPages = computed(() => Math.ceil(props.rows.length / props.pagination.rowsPerPage) || 1);

const paginatedRows = computed(() => {
  const start = (props.pagination.page - 1) * props.pagination.rowsPerPage;
  return props.rows.slice(start, start + props.pagination.rowsPerPage);
});

const prevPage = () => {
  if (props.pagination.page > 1)
    emit('update:pagination', { ...props.pagination, page: props.pagination.page - 1 });
};

const nextPage = () => {
  if (props.pagination.page < totalPages.value)
    emit('update:pagination', { ...props.pagination, page: props.pagination.page + 1 });
};

const updateRowsPerPage = (val: number) => {
  emit('update:pagination', { page: 1, rowsPerPage: val });
};

// ดึงข้อมูลพื้นฐานมาโชว์ (กรณีหน้าแม่ไม่ได้ตกแต่ง Slot)
const getCellValue = (row: any, col: TableColumn) => {
  return typeof col.field === 'function' ? col.field(row) : row[col.field];
};
</script>

<template>
  <div class="bento-box bg-white overflow-hidden flex column full-height">
    <div class="table-responsive col">
      <table class="bento-custom-table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.name"
              :class="`text-${col.align || 'left'}`"
              :style="col.style"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="paginatedRows.length === 0">
            <td :colspan="columns.length" class="text-center q-pa-xl">
              <q-icon name="sentiment_dissatisfied" size="48px" color="grey-4" />
              <div class="text-grey-5 q-mt-sm text-weight-medium">ไม่พบข้อมูล</div>
            </td>
          </tr>

          <tr v-for="(row, rowIndex) in paginatedRows" :key="rowIndex">
            <td v-for="col in columns" :key="col.name" :class="`text-${col.align || 'left'}`">
              <slot :name="`body-cell-${col.name}`" :row="row" :value="getCellValue(row, col)">
                {{ getCellValue(row, col) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bento-table-footer col-auto">
      <div class="row full-width items-center justify-between">
        <div
          class="row items-center q-gutter-x-sm text-grey-6 text-weight-medium"
          style="font-size: 13.5px"
        >
          <span>แสดง</span>
          <q-select
            :model-value="pagination.rowsPerPage"
            :options="[10, 20, 50, 100]"
            dense
            outlined
            class="bento-rows-select"
            popup-content-class="bento-menu"
            @update:model-value="updateRowsPerPage"
          />
          <span>รายการ (จากทั้งหมด {{ rows.length }})</span>
        </div>

        <div class="row items-center q-gutter-x-sm">
          <span class="text-weight-medium text-grey-6 q-mr-md" style="font-size: 13.5px">
            หน้า {{ pagination.page }} จาก {{ totalPages }}
          </span>
          <q-btn
            flat
            dense
            round
            icon="eva-chevron-left"
            class="pagination-btn"
            :disable="pagination.page === 1"
            @click="prevPage"
          />
          <q-btn
            flat
            dense
            round
            icon="eva-chevron-right"
            class="pagination-btn"
            :disable="pagination.page === totalPages"
            @click="nextPage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bento-box {
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
}
.table-responsive {
  width: 100%;
  overflow-x: auto;
}
.bento-custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
  th {
    position: sticky;
    top: 0;
    background-color: #ffffff;
    z-index: 1;
    font-size: 13px;
    font-weight: 600;
    color: $dark;
    padding: 16px 24px;
    border-bottom: 2px solid #f1f5f9;
  }
  td {
    padding: 16px 24px;
    font-size: 14.5px;
    color: $dark;
    border-bottom: 1px solid #f8fafc;
    transition: background-color 0.2s ease;
  }
  tbody tr {
    transition: all 0.2s ease;
    &:hover td {
      background-color: #f8fafc;
    }
    &:last-child td {
      border-bottom: none;
    }
  }
}

/* Pagination */
.bento-table-footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  background-color: #ffffff;
}
.bento-rows-select {
  width: 76px;
  :deep(.q-field__control) {
    height: 36px;
    min-height: 36px;
    border-radius: 8px;
    background-color: #f8fafc;
    border: none;
    transition: all 0.2s ease;
    &::before {
      display: none;
    }
    &:hover {
      background-color: #f1f5f9;
      cursor: pointer;
    }
  }
  :deep(.q-field__native) {
    padding: 0;
    color: $dark;
    font-weight: 700;
    text-align: center;
  }
  :deep(.q-field__append) {
    padding-left: 0;
    .q-icon {
      font-size: 18px;
      color: #94a3b8;
      transition: color 0.2s;
    }
  }
  &:hover :deep(.q-icon) {
    color: $dark;
  }
}
.pagination-btn {
  background-color: #f8fafc;
  color: #64748b;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  transition: all 0.2s ease;
  &:hover:not(.disabled) {
    background-color: #111827;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  &.disabled {
    opacity: 0.4;
    background-color: transparent;
  }
}
</style>
