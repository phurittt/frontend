<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useProjectStore } from 'src/stores/project-store';
import type { Project } from 'src/models/project';

const $q = useQuasar();
const router = useRouter();
const projectStore = useProjectStore(); // เรียกใช้ Store สำหรับจัดการข้อมูลโครงการ
const search = ref(''); // ตัวแปรสำหรับผูกกับช่องค้นหา

// ตัวแปรสำหรับควบคุมการแสดงผล Dialog รายละเอียดโครงการ
const viewDialog = ref(false);
const selectedProject = ref<Project | null>(null);

// ดึงข้อมูลโครงการทั้งหมดเมื่อ Component ถูกโหลด (Mount)
onMounted(() => {
  projectStore.fetchProjects();
});

// กำหนดโครงสร้างคอลัมน์ของตาราง (QTable)
const columns: QTableColumn[] = [
  { name: 'id', label: 'ลำดับ', field: 'index', align: 'center' },
  { name: 'year', label: 'ปีงบประมาณ', field: 'year', align: 'center', sortable: true },
  { name: 'name', label: 'ชื่อโครงการ', field: 'name', align: 'left' },
  { name: 'duration', label: 'ระยะเวลา', field: 'duration', align: 'left' },
  { name: 'regis_open', label: 'เปิดลงทะเบียน', field: 'regis_open', align: 'left' },
  { name: 'regis_close', label: 'ปิดลงทะเบียน', field: 'regis_close', align: 'left' },
  { name: 'manager', label: 'ผู้รับผิดชอบ', field: 'manager', align: 'left' },
  { name: 'course_count', label: 'จำนวนหลักสูตร', field: 'course_count', align: 'center' },
  { name: 'ask_food', label: 'สอบถามเรื่องอาหาร', field: 'ask_food', align: 'center' },
  { name: 'status', label: 'สถานะการเปิดอบรม', field: 'status', align: 'center' },
  { name: 'show_on_web', label: 'การแสดงผลบนหน้าเว็บ', field: 'show_on_web', align: 'center' },
  { name: 'actions', label: 'การจัดการ', field: 'actions', align: 'center' },
];

/**
 * แปลงข้อมูลจาก Store (projectStore.projects)
 * ให้อยู่ในรูปแบบที่ตาราง (QTable) สามารถแสดงผลได้อย่างสวยงาม
 */
const rows = computed(() => {
  return projectStore.projects.map((p, idx) => ({
    rawId: p.id,
    index: idx + 1,
    year: p.projectData.year || '-',
    name: p.projectData.projectName || 'ไม่ได้ระบุชื่อโครงการ',
    duration: `${p.projectData.dateFrom || '-'} ถึง ${p.projectData.dateTo || '-'}`,
    regis_open: `${p.projectData.regisOpenDate || '-'} ${p.projectData.timeFrom || ''}`,
    regis_close: `${p.projectData.regisCloseDate || '-'} ${p.projectData.timeTo || ''}`,
    manager: p.projectData.manager?.label || '-',
    course_count: p.courses.length,
    ask_food: p.projectData.askFood,
    status: p.projectData.isOpen,
    show_on_web: p.projectData.isVisible,
    _raw: p,
  }));
});

const toggleField = async (
  id: number | undefined,
  field: 'requireFoodSurvey' | 'status' | 'isVisible',
  value: boolean,
) => {
  if (!id) return;
  try {
    await projectStore.patchProject(id, { [field]: value });
  } catch {
    $q.notify({ type: 'negative', message: 'อัปเดตไม่สำเร็จ' });
  }
};

/**
 * แสดงรายละเอียดโครงการในรูปแบบ Dialog
 * @param project ข้อมูลโครงการที่ต้องการดู
 */
const viewItem = (project: Project) => {
  selectedProject.value = project;
  viewDialog.value = true;
};

/**
 * ย้ายหน้าไปยังการแก้ไขโครงการ
 * @param project ข้อมูลโครงการ
 * @param id ID ของโครงการ
 */
const editItem = (project: Project, id: number) => {
  projectStore.setEditProject(project);

  router.push({
    name: 'project-edit',
    params: { id: id },
  });
};

/**
 * ลบโครงการออกจากระบบ พร้อมการยืนยัน (Confirmation)
 * @param id ID ของโครงการที่ต้องการลบ
 */
const deleteItem = (id: number) => {
  $q.dialog({
    title: 'ยืนยันการลบ',
    message: 'คุณต้องการลบโครงการนี้ใช่หรือไม่?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    projectStore.deleteProject(id);
    $q.notify({ type: 'info', message: 'ลบโครงการสำเร็จ' });
  });
};

/**
 * เคลียร์ฟอร์ม (Reset) และย้ายหน้าไปยังโครงการหน้าเพิ่มโครงการใหม่
 */
const goToAddPage = () => {
  projectStore.resetForm();
  router.push('/admin/projects/add');
};
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการโครงการและหลักสูตร</div>

    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 8px">
      <q-card-section>
        <div class="row items-center q-mb-md q-gutter-x-sm">
          <q-input
            outlined
            dense
            v-model="search"
            placeholder="ค้นหาโครงการ..."
            rounded
            bg-color="grey-1"
            style="width: 320px"
          >
            <template v-slot:append><q-icon name="search" color="grey-7" /></template>
          </q-input>

          <q-btn outline color="grey-4" text-color="grey-8" icon="tune" padding="6px 12px"
            ><q-tooltip>ตัวกรอง</q-tooltip></q-btn
          >
          <q-btn
            unelevated
            color="grey-8"
            text-color="white"
            label="เพิ่มโครงการใหม่"
            no-caps
            class="q-px-md text-weight-medium"
            @click="goToAddPage"
          />
        </div>

        <q-table
          flat
          bordered
          :rows="rows"
          :columns="columns"
          row-key="rawId"
          separator="cell"
          :filter="search"
          :rows-per-page-options="[10, 20, 50]"
          table-header-class="bg-grey-1 text-weight-bold text-dark"
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props" style="max-width: 320px; white-space: normal; line-height: 1.4">{{
              props.value
            }}</q-td>
          </template>

          <template v-slot:body-cell-duration="props">
            <q-td :props="props">
              <div>{{ props.row.duration.split(' ถึง ')[0] }} ถึง</div>
              <div>{{ props.row.duration.split(' ถึง ')[1] }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-regis_open="props">
            <q-td :props="props">
              <div>{{ props.row.regis_open.split(' ')[0] }}</div>
              <div>{{ props.row.regis_open.split(' ')[1] || '' }} น.</div>
            </q-td>
          </template>

          <template v-slot:body-cell-regis_close="props">
            <q-td :props="props">
              <div>{{ props.row.regis_close.split(' ')[0] }}</div>
              <div>{{ props.row.regis_close.split(' ')[1] || '' }} น.</div>
            </q-td>
          </template>

          <template v-slot:body-cell-ask_food="props">
            <q-td :props="props" class="text-center">
              <q-toggle
                :model-value="props.row.ask_food"
                @update:model-value="
                  (val) => toggleField(props.row.rawId, 'requireFoodSurvey', val)
                "
                dense
                color="amber-8"
                :label="props.row.ask_food ? 'สอบถาม' : 'ไม่สอบถาม'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props" class="text-center">
              <q-toggle
                :model-value="props.row.status"
                @update:model-value="(val) => toggleField(props.row.rawId, 'status', val)"
                dense
                color="positive"
                :label="props.row.status ? 'เปิด' : 'ปิด'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-show_on_web="props">
            <q-td :props="props" class="text-center">
              <q-toggle
                :model-value="props.row.show_on_web"
                @update:model-value="(val) => toggleField(props.row.rawId, 'isVisible', val)"
                dense
                color="blue-6"
                :label="props.row.show_on_web ? 'แสดง' : 'ซ่อน'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row justify-center q-gutter-x-sm no-wrap">
                <q-btn
                  @click="viewItem(props.row._raw)"
                  unelevated
                  size="sm"
                  color="light-green-3"
                  text-color="dark"
                  icon="search"
                  style="border-radius: 6px; padding: 6px 10px"
                  ><q-tooltip>ดูรายละเอียด</q-tooltip></q-btn
                >
                <q-btn
                  @click="editItem(props.row._raw, props.row.rawId)"
                  unelevated
                  size="sm"
                  color="light-blue-1"
                  text-color="dark"
                  icon="edit"
                  style="border-radius: 6px; padding: 6px 10px"
                  ><q-tooltip>แก้ไข</q-tooltip></q-btn
                >
                <q-btn
                  @click="deleteItem(props.row.rawId)"
                  unelevated
                  size="sm"
                  color="pink-1"
                  text-color="dark"
                  icon="delete"
                  style="border-radius: 6px; padding: 6px 10px"
                  ><q-tooltip>ลบ</q-tooltip></q-btn
                >
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="viewDialog">
      <q-card style="min-width: 500px; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">รายละเอียดโครงการ</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md" v-if="selectedProject">
          <div class="row q-mb-sm">
            <div class="col-4 text-grey-7">ชื่อโครงการ:</div>
            <div class="col-8 text-weight-bold">{{ selectedProject.projectData.projectName }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-4 text-grey-7">ปีงบประมาณ:</div>
            <div class="col-8">{{ selectedProject.projectData.year }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-4 text-grey-7">ผู้รับผิดชอบ:</div>
            <div class="col-8">{{ selectedProject.projectData.manager?.label }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-4 text-grey-7">จำนวนหลักสูตร:</div>
            <div class="col-8">{{ selectedProject.courses.length }} หลักสูตร</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
:deep(.q-table th) {
  font-size: 13px;
  color: #555;
  text-align: center !important;
}

:deep(.q-table td) {
  font-size: 13px;
  color: #333;
}

:deep(.q-table tbody td),
:deep(.q-table thead th) {
  border-color: #f0f0f0 !important;
}
</style>
