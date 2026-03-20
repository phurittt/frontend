<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useSlideShowStore } from 'src/stores/slideshow-store';
import { useProjectStore } from 'src/stores/project-store';
import { useMasterCourseStore } from 'src/stores/masterCourse-store';
import type { CreateSlideShowDto } from 'src/models/slideshow';

const $q = useQuasar();
const slideStore = useSlideShowStore();
const projectStore = useProjectStore();
const masterCourseStore = useMasterCourseStore();

const search = ref('');
const showDialog = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);

onMounted(() => {
  projectStore.fetchProjects();
  masterCourseStore.fetchCourses();
  slideStore.fetchSlides();
});

const defaultForm = (): CreateSlideShowDto => ({
  projectId: null, courseId: null, imageUrl: '', isActive: true
});
const form = ref<CreateSlideShowDto>(defaultForm());

// ==========================================
// สร้างตัวเลือก (Dropdown) สำหรับฟอร์ม โดยดึงมาจาก Project Store
// ==========================================
// เราต้องเก็บแบบอ้างอิงเป็น Object เพื่อให้ QSelect นำไปแสดงผลและรับค่าได้ง่าย
const projectOptions = computed(() => {
  const options: { label: string; value: { projectId: number; courseId: number } }[] = [];

  projectStore.projects.forEach(project => {
    project.courses.forEach(pc => {
      const mCourse = masterCourseStore.courses.find(c => c.id === Number(pc.course?.value));
      if (mCourse && project.id) {
        options.push({
          label: `[${project.projectData.projectName}] - ${mCourse.name}`,
          value: { projectId: project.id, courseId: mCourse.id }
        });
      }
    });
  });
  return options;
});

// ตัวแปรสำหรับจับค่าจาก Dropdown
const selectedProjectCourse = ref<{ label: string; value: { projectId: number; courseId: number } } | null>(null);

// ==========================================
// ตารางและการกรองข้อมูล
// ==========================================
const columns: QTableColumn[] = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center', style: 'width: 5%' },
  { name: 'courseInfo', label: 'ข้อมูลหลักสูตรและโครงการ', field: 'courseName', align: 'left', style: 'width: 45%' },
  { name: 'image', label: 'รูปภาพ SlideShow', field: 'imageUrl', align: 'center', style: 'width: 25%' },
  { name: 'status', label: 'การแสดงผลบนหน้าเว็บ', field: 'isActive', align: 'center', style: 'width: 10%' },
  { name: 'edit', label: 'แก้ไข', field: 'edit', align: 'center', style: 'width: 5%' },
  { name: 'delete', label: 'ลบ', field: 'delete', align: 'center', style: 'width: 5%' },
];

const filteredRows = computed(() => {
  const keyword = search.value.toLowerCase().trim();
  // สังเกตว่าเราเรียก slideStore.slides (ซึ่งเป็น Getter ที่ประกอบร่างแล้ว)
  return slideStore.slides
    .map((slide, index) => ({ ...slide, index: index + 1 }))
    .filter(slide =>
      keyword === '' ||
      slide.courseName.toLowerCase().includes(keyword) ||
      slide.projectName.toLowerCase().includes(keyword)
    );
});

// ==========================================
// การจัดการฟอร์ม
// ==========================================
const openAddDialog = () => {
  isEdit.value = false;
  editId.value = null;
  form.value = defaultForm();
  selectedProjectCourse.value = null;
  showDialog.value = true;
};

const openEditDialog = (slide: any) => {
  isEdit.value = true;
  editId.value = slide.id;
  form.value = { projectId: slide.projectId, courseId: slide.courseId, imageUrl: slide.imageUrl, isActive: slide.isActive };

  // หาค่ามาใส่ใน Dropdown กลับคืน
  const foundOption = projectOptions.value.find(opt => opt.value.projectId === slide.projectId && opt.value.courseId === slide.courseId);
  selectedProjectCourse.value = foundOption || null;

  showDialog.value = true;
};

const saveData = () => {
  if (!selectedProjectCourse.value) {
    $q.notify({ type: 'warning', message: 'กรุณาเลือกโครงการและหลักสูตร' });
    return;
  }

  // แกะเอา projectId และ courseId ออกมาจากตัวที่เลือก
  form.value.projectId = selectedProjectCourse.value.value.projectId;
  form.value.courseId = selectedProjectCourse.value.value.courseId;

  if (isEdit.value && editId.value) {
    slideStore.updateSlide(editId.value, form.value);
    $q.notify({ type: 'positive', message: 'อัปเดต Slide Show สำเร็จ' });
  } else {
    slideStore.addSlide(form.value);
    $q.notify({ type: 'positive', message: 'เพิ่ม Slide Show ใหม่สำเร็จ' });
  }
  showDialog.value = false;
};

const deleteData = (id: number) => {
  $q.dialog({ title: 'ยืนยันการลบ', message: 'คุณต้องการลบ Slide Show นี้ใช่หรือไม่?', cancel: true, persistent: true })
    .onOk(() => {
      slideStore.deleteSlide(id);
      $q.notify({ type: 'info', message: 'ลบข้อมูลสำเร็จ' });
    });
};
</script>

<template>
  <q-page class="q-pa-md q-pa-lg-xl bg-grey-1">

    <div class="row items-center q-mb-md">
      <q-icon name="view_carousel" size="md" color="grey-8" class="q-mr-sm" />
      <h1 class="text-h5 text-weight-bold text-dark q-my-none tracking-tight">จัดการ Slide Show ที่หน้าแรกของระบบ</h1>
    </div>

    <q-card flat bordered class="bg-white" style="border-radius: 12px; border: 1px solid #e0e0e0;">
      <div class="bg-grey-2 q-pa-md row items-center" style="border-bottom: 1px solid #e0e0e0;">
        <q-icon name="menu" size="sm" class="q-mr-sm text-grey-8" />
        <div class="text-subtitle1 text-weight-bold text-dark">ข้อมูล Slide Show ที่หน้าแรกของระบบ</div>
      </div>

      <q-card-section class="q-pa-lg">
        <div class="row justify-between items-center q-mb-md">
          <div class="col-auto">
            <q-select outlined dense :options="[10, 20, 50]" :model-value="10" style="width: 80px" />
          </div>

          <div class="col-auto row q-gutter-sm items-center">
            <q-input outlined dense v-model="search" placeholder="ค้นหาชื่อหลักสูตร หรือชื่อโครงการ"
              style="width: 320px;" bg-color="white">
              <template v-slot:append><q-icon name="search" color="grey-6" /></template>
            </q-input>
            <q-btn unelevated color="green-7" icon="add_circle" label="เพิ่มข้อมูล Slide Show ใหม่" no-caps
              class="text-weight-bold q-px-md" style="border-radius: 6px;" @click="openAddDialog" />
          </div>
        </div>

        <q-table flat bordered :rows="filteredRows" :columns="columns" row-key="id" separator="cell"
          :pagination="{ rowsPerPage: 10 }" table-header-class="bg-grey-1 text-weight-bold text-dark text-center">
          <template v-slot:body-cell-index="props">
            <q-td :props="props" class="text-center"><span class="text-body2 text-grey-8">{{ props.row.index
                }}</span></q-td>
          </template>

          <template v-slot:body-cell-courseInfo="props">
            <q-td :props="props">
              <div class="column q-py-sm">
                <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs" style="line-height: 1.3;">{{
                  props.row.courseName }}</div>
                <div class="text-caption text-green-7 text-weight-medium q-mb-xs">โครงการ: {{ props.row.projectName }}
                </div>
                <div class="text-caption text-pink-6">วันที่อบรม: {{ props.row.trainingDate }}</div>
                <div class="text-caption text-indigo-6">เวลาอบรม: {{ props.row.trainingTime }}</div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-image="props">
            <q-td :props="props" class="text-center">
              <q-img :src="props.row.imageUrl"
                style="width: 100%; max-width: 250px; height: 90px; border-radius: 4px; border: 1px solid #eee;"
                fit="cover" />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props" class="text-center">
              <q-chip clickable @click="slideStore.toggleStatus(props.row.id)"
                :color="props.row.isActive ? 'green-7' : 'grey-5'" text-color="white" size="sm" class="text-weight-bold"
                square>
                {{ props.row.isActive ? 'แสดง' : 'ซ่อน' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-edit="props">
            <q-td :props="props" class="text-center">
              <q-btn unelevated round color="blue-8" icon="edit" size="sm" class="action-btn-circle"
                @click="openEditDialog(props.row)" />
            </q-td>
          </template>

          <template v-slot:body-cell-delete="props">
            <q-td :props="props" class="text-center">
              <q-btn unelevated round color="red-8" icon="delete" size="sm" class="action-btn-circle"
                @click="deleteData(props.row.id)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 600px; max-width: 90vw; border-radius: 12px;">
        <q-card-section class="row items-center q-pb-none q-mb-md">
          <div class="text-h6 text-weight-bold text-dark">
            <q-icon :name="isEdit ? 'edit' : 'add_photo_alternate'" color="primary" class="q-mr-sm" />
            {{ isEdit ? 'แก้ไขข้อมูล Slide Show' : 'เพิ่มข้อมูล Slide Show ใหม่' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="saveData" class="q-gutter-md">

            <div>
              <label class="text-weight-bold q-mb-xs block">เลือกโครงการและหลักสูตร <span
                  class="text-red">*</span></label>
              <q-select outlined dense v-model="selectedProjectCourse" :options="projectOptions"
                placeholder="คลิกเพื่อเลือกโครงการที่ต้องการทำ Slide Show"
                :rules="[val => !!val || 'กรุณาเลือกโครงการและหลักสูตร']" />
              <div class="text-caption text-grey-6 q-mt-xs">
                *ชื่อโครงการ, หลักสูตร, วันที่ และเวลา จะถูกดึงมาแสดงอัตโนมัติ
              </div>
            </div>

            <div class="q-mt-md">
              <label class="text-weight-bold q-mb-xs block">ลิงก์รูปภาพแบนเนอร์ (URL) <span
                  class="text-red">*</span></label>
              <q-input outlined dense v-model="form.imageUrl" placeholder="https://..."
                :rules="[val => !!val || 'กรุณาใส่ลิงก์รูปภาพ']" />
            </div>

            <div class="row items-center justify-between q-mt-sm q-pa-sm bg-grey-1 rounded-borders">
              <span class="text-weight-bold">แสดงผลบนหน้าเว็บ</span>
              <q-toggle v-model="form.isActive" color="green" />
            </div>

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat label="ยกเลิก" v-close-popup color="grey-8" style="border: 1px solid #ddd;" />
              <q-btn unelevated label="บันทึกข้อมูล" type="submit" color="green-7" class="q-px-lg text-weight-bold" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<style scoped lang="scss">
.tracking-tight {
  letter-spacing: -0.5px;
}

:deep(.q-table th) {
  font-size: 13px;
  color: #333;
}

:deep(.q-table td) {
  font-size: 13px;
  color: #333;
}

.action-btn-circle {
  border-radius: 50% !important;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}
</style>
