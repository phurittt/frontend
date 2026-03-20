<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useMasterCourseStore } from 'src/stores/masterCourse-store';
import type { MasterCourse } from 'src/models/masterCourse';

const $q = useQuasar();
const courseStore = useMasterCourseStore();
const search = ref('');

const showDialog = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);

const categoryOptions = ['Microsoft Office', 'Google Apps', 'Web Application & Web Design', 'Programming', 'Data Analytics', 'Network'];

const defaultForm = () => ({
  name: '',
  category: '',
  objectives: '',
  content: '',
  prerequisites: '',
  duration: '',
  show_on_web: true
});

const form = ref(defaultForm());

const columns: QTableColumn[] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'center', sortable: true },
  { name: 'name', label: 'ชื่อหลักสูตร', field: 'name', align: 'left', sortable: true },
  { name: 'category', label: 'ประเภทหลักสูตร', field: 'category', align: 'left', sortable: true },
  { name: 'show_on_web', label: 'การแสดงผลบนหน้าเว็บ', field: 'show_on_web', align: 'center' },
  { name: 'actions', label: 'การจัดการ', field: 'actions', align: 'center' },
];

const rows = computed(() => courseStore.courses);

function openAddDialog() {
  isEdit.value = false;
  editId.value = null;
  form.value = defaultForm();
  showDialog.value = true;
}

function editItem(item: MasterCourse) {
  isEdit.value = true;
  editId.value = item.id;
  form.value = { ...item };
  showDialog.value = true;
}

function saveData() {
  try {
    if (isEdit.value && editId.value) {
      courseStore.updateCourse(editId.value, form.value);
      $q.notify({ type: 'positive', message: 'อัปเดตหลักสูตรสำเร็จ' });
    } else {
      courseStore.createCourse(form.value);
      $q.notify({ type: 'positive', message: 'เพิ่มหลักสูตรใหม่สำเร็จ' });
    }
    showDialog.value = false;
  } catch (error) {
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาด' });
  }
}

function deleteItem(id: number) {
  $q.dialog({
    title: 'ยืนยันการลบ',
    message: 'คุณต้องการลบหลักสูตรนี้ใช่หรือไม่?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    courseStore.deleteCourse(id);
    $q.notify({ type: 'info', message: 'ลบหลักสูตรสำเร็จ' });
  });
}

onMounted(() => {
  courseStore.fetchCourses();
});
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการหลักสูตร</div>

    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 8px;">
      <q-card-section>
        <div class="row items-center q-mb-md q-gutter-x-sm">
          <q-input outlined dense v-model="search" placeholder="ค้นหาหลักสูตร..." rounded bg-color="grey-1"
            style="width: 320px;">
            <template v-slot:append><q-icon name="search" color="grey-7" /></template>
          </q-input>

          <q-btn outline color="grey-4" text-color="grey-8" icon="tune" padding="6px 12px" />
          <q-btn unelevated color="grey-8" text-color="white" label="เพิ่มหลักสูตรใหม่" no-caps
            class="q-px-md text-weight-medium" @click="openAddDialog" />
        </div>

        <q-table flat bordered :rows="rows" :columns="columns" row-key="id" separator="horizontal" :filter="search"
          :loading="courseStore.loading" table-header-class="bg-grey-1 text-weight-bold text-dark">
          <template v-slot:body-cell-show_on_web="props">
            <q-td :props="props">
              <q-chip :color="props.value ? 'light-green-13' : 'deep-orange-4'" text-color="white" size="sm"
                class="text-weight-bold q-px-sm" style="border-radius: 4px;" square :ripple="false">
                {{ props.value ? 'แสดง' : 'ไม่แสดง' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn flat round size="sm" color="primary" icon="edit" @click="editItem(props.row)" />
              <q-btn flat round size="sm" color="negative" icon="delete" @click="deleteItem(props.row.id)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 900px; max-width: 95vw; border-radius: 8px;">
        <q-card-section class="row items-center q-pb-none border-bottom q-mb-md">
          <div class="text-h6 text-weight-bold text-grey-8">
            จัดการหลักสูตร / <span class="text-dark">{{ isEdit ? 'แก้ไขหลักสูตร' : 'เพิ่มหลักสูตรใหม่' }}</span>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="saveData" class="q-gutter-y-md">

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6 column q-gutter-y-md">
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">ประเภทหลักสูตร</label>
                  <q-select v-model="form.category" :options="categoryOptions" outlined dense
                    :rules="[val => !!val || 'กรุณาเลือกประเภท']" />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">วัตถุประสงค์</label>
                  <q-input v-model="form.objectives" type="textarea" outlined rows="5" />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">ความรู้พื้นฐานผู้เข้าอบรม</label>
                  <q-input v-model="form.prerequisites" type="textarea" outlined rows="3" />
                </div>
              </div>

              <div class="col-12 col-md-6 column q-gutter-y-md">
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">ชื่อหลักสูตร</label>
                  <q-input v-model="form.name" outlined dense :rules="[val => !!val || 'กรุณากรอกชื่อหลักสูตร']" />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">เนื้อหา</label>
                  <q-input v-model="form.content" type="textarea" outlined rows="5" />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">ระยะเวลาที่ใช้</label>
                  <q-input v-model="form.duration" outlined dense placeholder="เช่น 6 ชั่วโมง" />
                </div>
              </div>
            </div>

            <q-card flat bordered class="bg-grey-1 q-pa-md q-mt-md" style="border-radius: 6px;">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-weight-bold text-dark">สถานะการแสดงผลบนหน้าเว็บ</div>
                  <div class="text-caption text-grey-6">แสดงหลักสูตรนี้ให้ผู้เข้าอบรมได้เห็น</div>
                </div>
                <q-toggle v-model="form.show_on_web" color="green" size="lg" />
              </div>
            </q-card>

            <div class="row q-gutter-sm q-mt-xl">
              <q-btn unelevated label="ยกเลิก" v-close-popup color="deep-orange-4" text-color="white" class="q-px-lg"
                style="border-radius: 4px;" :disable="courseStore.loading" />
              <q-btn unelevated label="บันทึก" type="submit" color="blue-6" class="q-px-lg" style="border-radius: 4px;"
                :loading="courseStore.loading" />
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

.border-bottom {
  border-bottom: 1px solid #ebebeb;
  padding-bottom: 16px;
}
</style>
