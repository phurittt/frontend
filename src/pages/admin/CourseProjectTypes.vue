<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useProjectTypeStore } from 'src/stores/projectType-store';

// 1. เรียกใช้งาน Store
const projectTypeStore = useProjectTypeStore();

// 2. ตัวแปรสำหรับสถานะการทำงาน
const showDialog = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);

// 3. ตัวแปรฟอร์ม
const form = ref({
  name: '',
  regis_fee: 0,
  description: ''
});

const columns: QTableColumn[] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'ชื่อประเภทโครงการ', field: 'name', align: 'left', sortable: true },
  {
    name: 'has_registration_fee',
    label: 'ค่าลงทะเบียน',
    field: 'regis_fee',
    align: 'center'
  },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' },
];

// 4. เชื่อมต่อข้อมูลจาก Store เข้ากับ Table
const rows = computed(() => projectTypeStore.projectTypes);
const search = ref('');

// 5. ฟังก์ชันเปิด Dialog เพิ่มข้อมูล
function openAddDialog() {
  isEdit.value = false;
  editId.value = null;
  form.value = { name: '', regis_fee: 0, description: '' };
  showDialog.value = true;
}

// 6. ฟังก์ชันเปิด Dialog เพื่อแก้ไข
function editItem(item: any) {
  isEdit.value = true;
  editId.value = item.id;
  // ดึงค่าเดิมมาใส่ในฟอร์ม
  form.value = {
    name: item.name,
    regis_fee: item.regis_fee,
    description: item.description || ''
  };
  showDialog.value = true;
}

// 7. ฟังก์ชันบันทึก (ทั้งเพิ่มและแก้ไข)
async function saveData() {
  try {
    if (isEdit.value && editId.value) {
      // โหมดแก้ไข
      await projectTypeStore.updateProjectType(editId.value, form.value);
    } else {
      // โหมดเพิ่มใหม่
      await projectTypeStore.createProjectType(form.value);
    }
    showDialog.value = false;
  } catch (error) {
    console.error('Save error:', error);
  }
}

// 8. ฟังก์ชันลบข้อมูล
async function deleteItem(id: number) {
  if (confirm('ยืนยันการลบประเภทโครงการนี้?')) {
    await projectTypeStore.deleteProjectType(id);
  }
}

onMounted(() => {
  projectTypeStore.fetchProjectTypes();
});
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการประเภทโครงการ</div>

    <q-card flat bordered class="bg-white">
      <q-card-section>
        <div class="row q-col-gutter-sm justify-between items-center q-mb-md">
          <div class="col-12 col-md-6">
            <q-input outlined dense v-model="search" placeholder="ค้นหาประเภทโครงการ..." rounded>
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto">
            <q-btn
              unelevated
              color="grey-9"
              text-color="white"
              label="เพิ่มประเภทโครงการใหม่"
              icon="add"
              no-caps
              @click="openAddDialog"
            />
          </div>
        </div>

        <q-table
          flat
          :rows="rows"
          :columns="columns"
          row-key="id"
          separator="horizontal"
          :filter="search"
          :loading="projectTypeStore.loading"
        >
          <template v-slot:body-cell-has_registration_fee="props">
            <q-td :props="props">
              <q-chip
                :color="props.value === 1 ? 'blue-1' : 'grey-2'"
                :text-color="props.value === 1 ? 'blue-7' : 'grey-7'"
                size="sm"
                class="text-weight-bold"
              >
                {{ props.value === 1 ? 'มีค่าลงทะเบียน' : 'ไม่มีค่าลงทะเบียน' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-xs">
              <q-btn
                unelevated
                round
                size="sm"
                color="light-blue-4"
                icon="edit"
                @click="editItem(props.row)"
              />
              <q-btn
                unelevated
                round
                size="sm"
                color="pink-4"
                icon="delete"
                @click="deleteItem(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ isEdit ? 'แก้ไขประเภทโครงการ' : 'เพิ่มประเภทโครงการ' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.name" label="ชื่อประเภทโครงการ *" outlined dense class="q-mb-md" />
          <q-input v-model="form.description" label="รายละเอียด" outlined dense type="textarea" class="q-mb-md" />

          <div class="text-subtitle2 q-mb-sm">การจัดเก็บค่าลงทะเบียน</div>
          <q-btn-toggle
            v-model="form.regis_fee"
            spread
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            color="white"
            text-color="primary"
            :options="[
              {label: 'ไม่มีค่าลงทะเบียน', value: 0},
              {label: 'มีค่าลงทะเบียน', value: 1}
            ]"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="ยกเลิก" v-close-popup color="grey-7" />
          <q-btn
            unelevated
            :label="isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'"
            color="primary"
            @click="saveData"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
