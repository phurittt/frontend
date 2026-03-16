<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useCourseCategoryStore } from 'src/stores/courseCategory-store';

const $q = useQuasar();
const categoryStore = useCourseCategoryStore();

const showDialog = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);
const search = ref('');

const form = ref({
  code: '',
  name: '',
  description: ''
});

const columns: QTableColumn[] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'center', sortable: true },
  { name: 'code', label: 'รหัสประเภท', field: 'code', align: 'left', sortable: true },
  { name: 'name', label: 'ชื่อประเภทหลักสูตร', field: 'name', align: 'left', sortable: true },
  { name: 'description', label: 'คำอธิบาย', field: 'description', align: 'left' },
  { name: 'courseCount', label: 'จำนวนหลักสูตร', field: 'courseCount', align: 'center', sortable: true },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' },
];

const rows = computed(() => categoryStore.categories);

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
    if (isEdit.value && editId.value) {
      await categoryStore.updateCategory(editId.value, form.value);
      $q.notify({ type: 'positive', message: 'แก้ไขข้อมูลสำเร็จ' });
    } else {
      await categoryStore.createCategory(form.value);
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
    persistent: true
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
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-weight-bold">จัดการประเภทหลักสูตร</div>
      <q-btn unelevated color="primary" label="เพิ่มประเภทหลักสูตร" icon="add" @click="openAddDialog" />
    </div>

    <q-card flat bordered class="bg-white">
      <q-card-section class="q-pa-none">
        <div class="q-pa-md border-bottom">
          <q-input outlined dense v-model="search" placeholder="ค้นหาประเภทหลักสูตร..." style="max-width: 350px;">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </div>

        <q-table flat :rows="rows" :columns="columns" row-key="id" :filter="search" :loading="categoryStore.loading"
          table-header-class="bg-grey-1">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn flat round size="sm" color="primary" icon="edit" @click="editItem(props.row)">
                <q-tooltip>แก้ไข</q-tooltip>
              </q-btn>
              <q-btn flat round size="sm" color="negative" icon="delete" @click="deleteItem(props.row.id)">
                <q-tooltip>ลบ</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 450px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEdit ? 'แก้ไขประเภทหลักสูตร' : 'เพิ่มประเภทหลักสูตร' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="saveData" class="q-gutter-md">
            <q-input v-model="form.code" label="รหัสประเภท *" outlined dense
              :rules="[val => !!val || 'กรุณากรอกรหัส']" />
            <q-input v-model="form.name" label="ชื่อประเภทหลักสูตร *" outlined dense
              :rules="[val => !!val || 'กรุณากรอกชื่อ']" />
            <q-input v-model="form.description" label="คำอธิบาย" outlined dense type="textarea" rows="3" />

            <div class="row justify-end q-mt-lg q-gutter-sm">
              <q-btn flat label="ยกเลิก" v-close-popup color="grey-8" :disable="categoryStore.loading" />
              <q-btn unelevated :label="isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'" type="submit" color="primary"
                :loading="categoryStore.loading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #ebebeb;
}
</style>
