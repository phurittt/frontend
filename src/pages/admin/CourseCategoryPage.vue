<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useCourseCategoryStore } from 'src/stores/courseCategory-store';
import type { CreateCourseCategoryDto } from 'src/models/courseCategory';

const $q = useQuasar();
const categoryStore = useCourseCategoryStore();

const showDialog = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);
const search = ref('');

const form = ref({
  code: '',
  name: '',
  description: '',
});

const columns: QTableColumn[] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'center', sortable: true },
  { name: 'code', label: 'รหัสประเภท', field: 'code', align: 'left', sortable: true },
  { name: 'name', label: 'ชื่อประเภทหลักสูตร', field: 'name', align: 'left', sortable: true },
  { name: 'description', label: 'คำอธิบาย', field: 'description', align: 'left' },
  {
    name: 'courseCount',
    label: 'จำนวนหลักสูตร',
    field: 'courseCount',
    align: 'center',
    sortable: true,
  },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' },
];

const rows = computed(() => categoryStore.categories);

// คำนวณสถิติสำหรับรายงาน
const totalCategories = computed(() => categoryStore.categories.length);
const totalCourses = computed(() =>
  categoryStore.categories.reduce((sum, cat) => sum + (cat.courseCount || 0), 0),
);

function openAddDialog() {
  isEdit.value = false;
  editId.value = null;
  form.value = { code: '', name: '', description: '' };
  showDialog.value = true;
}

function editItem(item: any) {
  isEdit.value = true;
  editId.value = item.id;
  form.value = { code: item.code, name: item.name, description: item.description || '' };
  showDialog.value = true;
}

async function saveData() {
  try {
    const payload: CreateCourseCategoryDto = {
      code: form.value.code,
      name: form.value.name,
      description: form.value.description,
    };

    if (isEdit.value && editId.value) {
      await categoryStore.updateCategory(editId.value, payload);
      $q.notify({ type: 'positive', message: 'แก้ไขข้อมูลสำเร็จ' });
    } else {
      await categoryStore.createCategory(payload);
      $q.notify({ type: 'positive', message: 'เพิ่มประเภทหลักสูตรสำเร็จ' });
    }
    showDialog.value = false;
  } catch (error) {
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาด' });
  }
}

function deleteItem(id: number) {
  $q.dialog({
    title: 'ยืนยันการลบ',
    message: 'คุณต้องการลบประเภทหลักสูตรนี้ใช่หรือไม่?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await categoryStore.deleteCategory(id);
    $q.notify({ type: 'info', message: 'ลบข้อมูลสำเร็จ' });
  });
}

onMounted(() => {
  categoryStore.fetchCategories();
});
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการประเภทหลักสูตร</div>

    <!-- ส่วนแสดงสถิติ/รายงาน -->
    <q-card flat bordered class="bg-white q-mb-md">
      <q-card-section>
        <div class="row items-center q-gutter-x-xl">
          <div class="stat-item">
            <div class="text-h3 text-weight-bolder text-dark">{{ totalCategories }}</div>
            <div class="text-caption text-grey-6 text-weight-bold text-uppercase q-mt-sm">
              ประเภทหลักสูตรทั้งหมด
            </div>
          </div>
          <q-separator vertical style="height: 60px" />
          <div class="stat-item">
            <div class="text-h3 text-weight-bolder text-blue-7">{{ totalCourses }}</div>
            <div class="text-caption text-grey-6 text-weight-bold text-uppercase q-mt-sm">
              จำนวนหลักสูตรทั้งหมด
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 8px">
      <q-card-section>
        <div class="row items-center q-mb-md q-gutter-x-sm">
          <q-input
            outlined
            dense
            v-model="search"
            placeholder="ค้นหาประเภทหลักสูตร..."
            rounded
            bg-color="grey-1"
            style="width: 320px"
          >
            <template v-slot:append>
              <q-icon name="search" color="grey-7" />
            </template>
          </q-input>

          <q-btn outline color="grey-4" text-color="grey-8" icon="tune" padding="6px 12px">
            <q-tooltip>ตัวกรอง</q-tooltip>
          </q-btn>

          <q-btn
            unelevated
            color="grey-8"
            text-color="white"
            label="เพิ่มประเภทหลักสูตร"
            no-caps
            class="q-px-md text-weight-medium"
            @click="openAddDialog"
          />
        </div>

        <q-table
          flat
          bordered
          :rows="rows"
          :columns="columns"
          row-key="id"
          separator="horizontal"
          :filter="search"
          :loading="categoryStore.loading"
          table-header-class="bg-grey-1 text-weight-bold text-dark"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn flat round size="sm" color="primary" icon="edit" @click="editItem(props.row)">
                <q-tooltip>แก้ไข</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                size="sm"
                color="negative"
                icon="delete"
                @click="deleteItem(props.row.id)"
              >
                <q-tooltip>ลบ</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            {{ isEdit ? 'แก้ไขประเภทหลักสูตร' : 'เพิ่มประเภทหลักสูตร' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="saveData" class="q-gutter-md">
            <q-input
              v-model="form.code"
              label="รหัสประเภท *"
              outlined
              dense
              :rules="[(val) => !!val || 'กรุณากรอกรหัส']"
            />
            <q-input
              v-model="form.name"
              label="ชื่อประเภทหลักสูตร *"
              outlined
              dense
              :rules="[(val) => !!val || 'กรุณากรอกชื่อ']"
            />
            <q-input
              v-model="form.description"
              label="คำอธิบาย"
              outlined
              dense
              type="textarea"
              rows="3"
            />

            <div class="row justify-end q-mt-lg q-gutter-sm">
              <q-btn
                flat
                label="ยกเลิก"
                v-close-popup
                color="grey-7"
                :disable="categoryStore.loading"
              />
              <q-btn
                unelevated
                :label="isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'"
                type="submit"
                color="primary"
                :loading="categoryStore.loading"
              />
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
