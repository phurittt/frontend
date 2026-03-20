<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// Import QTableColumn เพิ่มเข้ามาตรงนี้
import { useQuasar, type QTableColumn } from 'quasar';

import { useProjectStore } from 'src/stores/project-store';
import { useProjectTypeStore } from 'src/stores/projectType-store';
import { useUserStore } from 'src/stores/user-store';
import { useMasterCourseStore } from 'src/stores/masterCourse-store';
import { useLecturerStore } from 'src/stores/lecturer-store';

const router = useRouter();
const $q = useQuasar();

const projectStore = useProjectStore();
const projectTypeStore = useProjectTypeStore();
const userStore = useUserStore();
const masterCourseStore = useMasterCourseStore();
const lecturerStore = useLecturerStore();

onMounted(() => {
  projectTypeStore.fetchProjectTypes();
  userStore.fetchUsers();
  masterCourseStore.fetchCourses();
  lecturerStore.fetchLecturers();
});

const step = ref(1);

const projectTypeOptions = computed(() =>
  projectTypeStore.projectTypes.map((pt) => ({ label: pt.name, value: pt.id })),
);
const managerOptions = computed(() =>
  userStore.usersList.map((u) => ({
    label: `${u.title}${u.firstNameTh} ${u.lastNameTh}`,
    value: u.id,
  })),
);
const courseOptions = computed(() =>
  masterCourseStore.courses.map((c) => ({ label: c.name, value: c.id })),
);
const lecturerOptions = computed(() =>
  lecturerStore.lecturers.map((l) => ({ label: l.fullName, value: l.id })),
);
const selectedCourseOptions = computed(() => projectStore.courseList.map((c) => c.course));

const targetOptions = ['นิสิต', 'อาจารย์', 'เจ้าหน้าที่', 'บุคคลทั่วไป', 'บริษัท/หน่วยงานอื่นๆ'];

const tempCourse = ref({ course: null, targetGroups: [], targetAmount: '', isOpen: false });
const tempLecturer = ref({ course: null, lecturerName: null, assistantName: null });

// ระบุ Type QTableColumn[] ให้ชัดเจน เพื่อแก้ Error align string
const courseColumns: QTableColumn[] = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center' },
  {
    name: 'course',
    label: 'หลักสูตร',
    field: (row: any) => row.course?.label || '-',
    align: 'left',
  },
  { name: 'targetAmount', label: 'จำนวนที่รับ', field: 'targetAmount', align: 'center' },
  { name: 'isOpen', label: 'สถานะ', field: 'isOpen', align: 'center' },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' },
];

const lecturerColumns: QTableColumn[] = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'center' },
  {
    name: 'course',
    label: 'หลักสูตร',
    field: (row: any) => row.course?.label || '-',
    align: 'left',
  },
  {
    name: 'lecturerName',
    label: 'วิทยากร',
    field: (row: any) => row.lecturerName?.label || '-',
    align: 'left',
  },
  {
    name: 'assistantName',
    label: 'ผู้ช่วยวิทยากร',
    field: (row: any) => row.assistantName?.label || '-',
    align: 'left',
  },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' },
];

const onAddCourse = () => {
  if (!tempCourse.value.course)
    return $q.notify({ type: 'warning', message: 'กรุณาเลือกหลักสูตร' });
  projectStore.addCourse(tempCourse.value as any);
  tempCourse.value = { course: null, targetGroups: [], targetAmount: '', isOpen: false };
};

const onAddLecturer = () => {
  if (!tempLecturer.value.course || !tempLecturer.value.lecturerName)
    return $q.notify({ type: 'warning', message: 'กรุณากรอกข้อมูลให้ครบ' });
  projectStore.addLecturer(tempLecturer.value as any);
  tempLecturer.value = { course: null, lecturerName: null, assistantName: null };
};

const onSubmitProject = () => {
  projectStore.submitProject();
  $q.notify({ type: 'positive', message: 'บันทึกโครงการสำเร็จ!' });
  router.push('/admin/projects');
};
</script>

<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="bg-white" style="border-radius: 8px">
      <q-stepper
        v-model="step"
        ref="stepper"
        color="amber-4"
        done-color="amber-4"
        active-color="amber-4"
        inactive-color="grey-4"
        animated
        flat
        class="project-stepper"
      >
        <q-step :name="1" title="โครงการ" icon="folder" :done="step > 1">
          <div class="form-container q-py-lg">
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">ปีงบประมาณ</div>
              <div class="col-12 col-md-9">
                <q-input
                  outlined
                  dense
                  v-model="projectStore.projectForm.year"
                  placeholder="ปี"
                  style="max-width: 150px"
                />
              </div>
            </div>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">
                ประเภทโครงการ
              </div>
              <div class="col-12 col-md-9">
                <q-select
                  outlined
                  dense
                  v-model="projectStore.projectForm.projectType"
                  :options="projectTypeOptions"
                  placeholder="ค้นหาประเภทโครงการ"
                  style="max-width: 500px"
                />
              </div>
            </div>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">
                ชื่อโครงการ
              </div>
              <div class="col-12 col-md-9">
                <q-input
                  outlined
                  dense
                  v-model="projectStore.projectForm.projectName"
                  placeholder="กรอกชื่อโครงการ"
                  style="max-width: 500px"
                />
              </div>
            </div>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">
                ระยะเวลาโครงการ
              </div>
              <div class="col-12 col-md-9 row items-center q-gutter-x-sm">
                <q-input
                  outlined
                  dense
                  v-model="projectStore.projectForm.dateFrom"
                  placeholder="วว/ดด/ปปปป"
                  style="width: 160px"
                  ><template v-slot:append><q-icon name="event" class="cursor-pointer" /></template
                ></q-input>
                <span class="text-weight-medium">ถึง</span>
                <q-input
                  outlined
                  dense
                  v-model="projectStore.projectForm.dateTo"
                  placeholder="วว/ดด/ปปปป"
                  style="width: 160px"
                  ><template v-slot:append><q-icon name="event" class="cursor-pointer" /></template
                ></q-input>
              </div>
            </div>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">
                ผู้รับผิดชอบ
              </div>
              <div class="col-12 col-md-9">
                <q-select
                  outlined
                  dense
                  v-model="projectStore.projectForm.manager"
                  :options="managerOptions"
                  placeholder="ค้นหาชื่อผู้รับผิดชอบ"
                  style="max-width: 500px"
                />
              </div>
            </div>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">
                สถานที่อบรม
              </div>
              <div class="col-12 col-md-9">
                <q-input
                  outlined
                  dense
                  v-model="projectStore.projectForm.location"
                  placeholder="กรอกสถานที่อบรม"
                  style="max-width: 500px"
                />
              </div>
            </div>
            <div class="row items-center q-mb-sm q-mt-lg">
              <div class="col-12 col-md-3"></div>
              <div class="col-12 col-md-9">
                <div
                  class="bg-grey-1 q-pa-sm border-radius-6 row items-center justify-between"
                  style="max-width: 500px"
                >
                  <span class="text-weight-bold">สถานะการเปิดอบรม</span>
                  <div class="row items-center q-gutter-x-sm">
                    <span class="text-grey-6">{{
                      projectStore.projectForm.isOpen ? 'เปิด' : 'ปิด'
                    }}</span>
                    <q-toggle v-model="projectStore.projectForm.isOpen" color="primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <q-stepper-navigation>
            <div class="row q-gutter-sm q-mt-lg q-pl-md-xl">
              <q-btn
                flat
                color="grey-8"
                label="ย้อนกลับ"
                to="/admin/projects"
                class="border-grey"
              />
              <q-btn unelevated color="blue-6" label="บันทึกและไปขั้นตอนถัดไป" @click="step = 2" />
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="2" title="หลักสูตร" icon="library_books" :done="step > 2">
          <div class="form-container q-py-lg">
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">โครงการ</div>
              <div class="col-12 col-md-9">
                <q-input
                  outlined
                  dense
                  disable
                  :model-value="projectStore.projectForm.projectName"
                  style="max-width: 500px"
                />
              </div>
            </div>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">หลักสูตร</div>
              <div class="col-12 col-md-9">
                <q-select
                  outlined
                  dense
                  v-model="tempCourse.course"
                  :options="courseOptions"
                  placeholder="ค้นหาหลักสูตร"
                  style="max-width: 500px"
                />
              </div>
            </div>
            <div class="row items-start q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium q-pt-sm">
                กลุ่มเป้าหมาย
              </div>
              <div class="col-12 col-md-9 row q-gutter-x-md">
                <q-checkbox
                  v-for="t in targetOptions"
                  :key="t"
                  v-model="tempCourse.targetGroups"
                  :val="t"
                  :label="t"
                  color="primary"
                />
              </div>
            </div>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">
                จำนวนที่รับ
              </div>
              <div class="col-12 col-md-9">
                <q-input
                  outlined
                  dense
                  v-model="tempCourse.targetAmount"
                  placeholder="คน"
                  style="max-width: 500px"
                />
              </div>
            </div>
            <div class="row items-center q-mb-xl">
              <div class="col-12 col-md-3"></div>
              <div class="col-12 col-md-9 row q-gutter-sm">
                <q-btn
                  unelevated
                  color="purple-4"
                  label="บันทึกหลักสูตร (ลงในตารางล่าง)"
                  @click="onAddCourse"
                />
              </div>
            </div>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              รายละเอียดหลักสูตรที่เพิ่มแล้ว
            </div>
            <q-table
              flat
              bordered
              :rows="projectStore.courseList"
              :columns="courseColumns"
              row-key="index"
              separator="horizontal"
              table-header-class="bg-grey-1 text-weight-bold text-dark"
              hide-bottom
            >
              <template v-slot:body-cell-actions="props"
                ><q-td :props="props"
                  ><q-btn
                    flat
                    round
                    size="sm"
                    color="negative"
                    icon="delete"
                    @click="projectStore.removeCourse(props.rowIndex)" /></q-td
              ></template>
            </q-table>
          </div>

          <q-stepper-navigation>
            <div class="row q-gutter-sm q-mt-lg">
              <q-btn flat color="grey-8" label="ย้อนกลับ" @click="step = 1" class="border-grey" />
              <q-btn unelevated color="blue-6" label="ไปขั้นตอนถัดไป" @click="step = 3" />
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="3" title="วิทยากร" icon="school" :done="step > 3">
          <div class="form-container q-py-lg">
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">หลักสูตร</div>
              <div class="col-12 col-md-9">
                <q-select
                  outlined
                  dense
                  v-model="tempLecturer.course"
                  :options="selectedCourseOptions"
                  placeholder="เลือกหลักสูตรที่เพิ่มไว้แล้ว"
                  style="max-width: 500px"
                />
              </div>
            </div>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">
                รายชื่อวิทยากร
              </div>
              <div class="col-12 col-md-9">
                <q-select
                  outlined
                  dense
                  v-model="tempLecturer.lecturerName"
                  :options="lecturerOptions"
                  placeholder="ค้นหาชื่อวิทยากร"
                  style="max-width: 500px"
                />
              </div>
            </div>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-md-3 text-md-right q-pr-md text-weight-medium">
                รายชื่อผู้ช่วยวิทยากร
              </div>
              <div class="col-12 col-md-9">
                <q-select
                  outlined
                  dense
                  v-model="tempLecturer.assistantName"
                  :options="lecturerOptions"
                  placeholder="ค้นหาชื่อผู้ช่วยวิทยากร (ถ้ามี)"
                  style="max-width: 500px"
                />
              </div>
            </div>
            <div class="row items-center q-mb-xl">
              <div class="col-12 col-md-3"></div>
              <div class="col-12 col-md-9 row q-gutter-sm">
                <q-btn
                  unelevated
                  color="light-blue-5"
                  label="บันทึกวิทยากร (ลงในตารางล่าง)"
                  @click="onAddLecturer"
                />
              </div>
            </div>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">รายชื่อวิทยากรและผู้ช่วย</div>
            <q-table
              flat
              bordered
              :rows="projectStore.lecturerList"
              :columns="lecturerColumns"
              row-key="index"
              separator="horizontal"
              table-header-class="bg-grey-1 text-weight-bold text-dark"
              hide-bottom
            >
              <template v-slot:body-cell-actions="props"
                ><q-td :props="props"
                  ><q-btn
                    flat
                    round
                    size="sm"
                    color="negative"
                    icon="delete"
                    @click="projectStore.removeLecturer(props.rowIndex)" /></q-td
              ></template>
            </q-table>
          </div>

          <q-stepper-navigation>
            <div class="row q-gutter-sm q-mt-lg">
              <q-btn flat color="grey-8" label="ย้อนกลับ" @click="step = 2" class="border-grey" />
              <q-btn unelevated color="blue-6" label="ไปขั้นตอนถัดไป" @click="step = 4" />
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="4" title="ตรวจสอบและยืนยัน" icon="fact_check" :done="step > 4">
          <div class="q-py-md">
            <div class="text-h6 text-weight-bold text-dark q-mb-md">สรุปข้อมูลโครงการ</div>
            <div class="row q-mb-lg q-pl-md q-col-gutter-y-sm">
              <div class="col-12 col-md-6">
                <span class="text-grey-7">โครงการ:</span>
                <strong class="q-ml-sm">{{ projectStore.projectForm.projectName || '-' }}</strong>
              </div>
              <div class="col-12 col-md-6">
                <span class="text-grey-7">ประเภท:</span>
                <strong class="q-ml-sm">{{
                  projectStore.projectForm.projectType?.label || '-'
                }}</strong>
              </div>
              <div class="col-12 col-md-6">
                <span class="text-grey-7">ผู้รับผิดชอบ:</span>
                <strong class="q-ml-sm">{{
                  projectStore.projectForm.manager?.label || '-'
                }}</strong>
              </div>
              <div class="col-12 col-md-6">
                <span class="text-grey-7">สถานที่:</span>
                <strong class="q-ml-sm">{{ projectStore.projectForm.location || '-' }}</strong>
              </div>
            </div>
            <div class="text-h6 text-weight-bold text-dark q-mb-sm">
              หลักสูตรที่เปิดอบรม ({{ projectStore.courseList.length }})
            </div>
            <q-table
              flat
              bordered
              :rows="projectStore.courseList"
              :columns="courseColumns.filter((c) => c.name !== 'actions')"
              row-key="index"
              separator="horizontal"
              table-header-class="bg-grey-1"
              hide-bottom
              class="q-mb-lg"
            />
            <div class="text-h6 text-weight-bold text-dark q-mb-sm">
              รายชื่อวิทยากร ({{ projectStore.lecturerList.length }})
            </div>
            <q-table
              flat
              bordered
              :rows="projectStore.lecturerList"
              :columns="lecturerColumns.filter((c) => c.name !== 'actions')"
              row-key="index"
              separator="horizontal"
              table-header-class="bg-grey-1"
              hide-bottom
            />
          </div>

          <q-stepper-navigation>
            <div class="row q-gutter-sm q-mt-lg">
              <q-btn flat color="grey-8" label="ย้อนกลับ" @click="step = 3" class="border-grey" />
              <q-btn
                unelevated
                color="blue-6"
                label="ยืนยันการบันทึกข้อมูล"
                @click="onSubmitProject"
                :loading="projectStore.loading"
              />
            </div>
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
    </q-card>
  </q-page>
</template>

<style scoped>
:deep(.q-stepper__header) {
  border-bottom: 1px solid #ebebeb;
}

:deep(.q-stepper__dot) {
  font-size: 16px;
  width: 28px;
  height: 28px;
}

:deep(.q-stepper__title) {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

:deep(.q-stepper__tab--active .q-stepper__title) {
  color: #000;
}

.border-radius-6 {
  border-radius: 6px;
}

.border-grey {
  border: 1px solid #ddd;
}

.form-container {
  max-width: 900px;
}
</style>
