<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { QTableColumn } from 'quasar';
import { useQuasar } from 'quasar';
import { useLecturerStore } from 'src/stores/lecturer-store';
import type { Lecturer } from 'src/models/lecturer';

const $q = useQuasar();
const lecturerStore = useLecturerStore();
const search = ref('');

const showDialog = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);

// ตัวเลือกสำหรับ Dropdown หมวดหมู่ต่างๆ (ใส่เพิ่มได้ตามต้องการ)
const msOfficeOptions = ['Word', 'Excel', 'PowerPoint', 'Access'];
const webDesignOptions = ['HTML/CSS', 'Vue.js', 'React', 'Figma'];
const programmingOptions = ['Python', 'Java', 'C++', 'JavaScript', 'Go'];
const dataAnalysisOptions = ['Power BI', 'Tableau', 'SQL', 'Pandas'];
const networkOptions = ['Cisco', 'MikroTik', 'Network Security'];

const defaultForm = () => ({
  fullName: '',
  organization: '',
  nationalId: '',
  address: '',
  expertise: {
    microsoftOffice: [] as string[],
    webDesign: [] as string[],
    programming: [] as string[],
    dataAnalysis: [] as string[],
    network: [] as string[],
  },
  otherExpertise: ''
});

const form = ref(defaultForm());

// ฟังก์ชันดึงความเชี่ยวชาญทั้งหมดมารวมเป็น String เดียวเพื่อโชว์ในตาราง
const getExpertiseString = (row: Lecturer) => {
  const allExpertise = [
    ...row.expertise.microsoftOffice,
    ...row.expertise.webDesign,
    ...row.expertise.programming,
    ...row.expertise.dataAnalysis,
    ...row.expertise.network
  ];
  if (row.otherExpertise) {
    allExpertise.push(row.otherExpertise);
  }
  return allExpertise.join(', ') || '-';
};

const columns: QTableColumn[] = [
  { name: 'id', label: 'ลำดับ', field: 'id', align: 'center', sortable: true },
  { name: 'fullName', label: 'ชื่อวิทยากร', field: 'fullName', align: 'left', sortable: true },
  { name: 'organization', label: 'หน่วยงาน', field: 'organization', align: 'left', sortable: true },
  { name: 'expertise', label: 'ความเชี่ยวชาญ', field: row => getExpertiseString(row), align: 'left' },
  { name: 'actions', label: 'การจัดการ', field: 'actions', align: 'center' },
];

const rows = computed(() => lecturerStore.lecturers);

function openAddDialog() {
  isEdit.value = false;
  editId.value = null;
  form.value = defaultForm();
  showDialog.value = true;
}

function editItem(item: Lecturer) {
  isEdit.value = true;
  editId.value = item.id;
  // Deep clone เพื่อไม่ให้กระทบ state ตรงๆ เวลายังไม่กดเซฟ
  form.value = JSON.parse(JSON.stringify(item));
  showDialog.value = true;
}

function saveData() {
  try {
    if (isEdit.value && editId.value) {
      lecturerStore.updateLecturer(editId.value, form.value);
      $q.notify({ type: 'positive', message: 'อัปเดตข้อมูลวิทยากรสำเร็จ' });
    } else {
      lecturerStore.createLecturer(form.value);
      $q.notify({ type: 'positive', message: 'เพิ่มวิทยากรใหม่สำเร็จ' });
    }
    showDialog.value = false;
  } catch (error) {
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาด' });
  }
}

function deleteItem(id: number) {
  $q.dialog({
    title: 'ยืนยันการลบ',
    message: 'คุณต้องการลบวิทยากรท่านนี้ใช่หรือไม่?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    lecturerStore.deleteLecturer(id);
    $q.notify({ type: 'info', message: 'ลบข้อมูลสำเร็จ' });
  });
}

onMounted(() => {
  lecturerStore.fetchLecturers();
});
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-bold">จัดการข้อมูลวิทยากร</div>

    <q-card flat bordered class="bg-white q-pa-sm" style="border-radius: 8px;">
      <q-card-section>
        <div class="row items-center q-mb-md q-gutter-x-sm">
          <q-input outlined dense v-model="search" placeholder="ค้นหาวิทยากร..." rounded bg-color="grey-1"
            style="width: 320px;">
            <template v-slot:append><q-icon name="search" color="grey-7" /></template>
          </q-input>

          <q-btn outline color="grey-4" text-color="grey-8" icon="tune" padding="6px 12px" />
          <q-btn unelevated color="grey-8" text-color="white" label="เพิ่มข้อมูลวิทยากร" no-caps
            class="q-px-md text-weight-medium" @click="openAddDialog" />
        </div>

        <q-table flat bordered :rows="rows" :columns="columns" row-key="id" separator="horizontal" :filter="search"
          :loading="lecturerStore.loading" table-header-class="bg-grey-1 text-weight-bold text-dark">
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
            จัดการข้อมูลวิทยากร / <span class="text-dark">{{ isEdit ? 'แก้ไขข้อมูลวิทยากร' : 'เพิ่มข้อมูลวิทยากร'
              }}</span>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none scroll" style="max-height: 75vh;">
          <q-form @submit.prevent="saveData" class="q-gutter-y-md">

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6 column q-gutter-y-md">
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">ชื่อ - นามสกุล <span
                      class="text-negative">*</span></label>
                  <q-input v-model="form.fullName" outlined dense :rules="[val => !!val || 'กรุณากรอกชื่อ-นามสกุล']" />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">หน่วยงาน <span
                      class="text-negative">*</span></label>
                  <q-input v-model="form.organization" outlined dense placeholder="ค้นหาหน่วยงาน"
                    :rules="[val => !!val || 'กรุณากรอกหน่วยงาน']" />
                </div>

                <div class="text-subtitle2 text-weight-bold text-dark q-mt-md">ความเชี่ยวชาญ</div>

                <div>
                  <label class="text-caption text-weight-bold text-grey-7">Microsoft Office</label>
                  <q-select v-model="form.expertise.microsoftOffice" :options="msOfficeOptions" outlined dense multiple
                    use-chips placeholder="เลือก" />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">Web Application & Web Design</label>
                  <q-select v-model="form.expertise.webDesign" :options="webDesignOptions" outlined dense multiple
                    use-chips placeholder="เลือก" />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">Programming</label>
                  <q-select v-model="form.expertise.programming" :options="programmingOptions" outlined dense multiple
                    use-chips placeholder="เลือก" />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">Data Analysis</label>
                  <q-select v-model="form.expertise.dataAnalysis" :options="dataAnalysisOptions" outlined dense multiple
                    use-chips placeholder="เลือก" />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">Network</label>
                  <q-select v-model="form.expertise.network" :options="networkOptions" outlined dense multiple use-chips
                    placeholder="เลือก" />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">เพิ่มเติม</label>
                  <q-input v-model="form.otherExpertise" type="textarea" outlined rows="3" />
                </div>
              </div>

              <div class="col-12 col-md-6 column q-gutter-y-md">
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">เลขประจำตัวประชาชน</label>
                  <q-input v-model="form.nationalId" outlined dense mask="#-####-#####-##-#" unmasked-value />
                </div>
                <div>
                  <label class="text-caption text-weight-bold text-grey-7">ที่อยู่</label>
                  <q-input v-model="form.address" type="textarea" outlined rows="5" />
                </div>
              </div>
            </div>

            <div class="row q-gutter-sm q-mt-xl">
              <q-btn unelevated label="ย้อนกลับ" v-close-popup color="white" text-color="dark" class="q-px-lg"
                style="border: 1px solid #ddd; border-radius: 4px;" :disable="lecturerStore.loading" />
              <q-btn unelevated label="บันทึก" type="submit" color="blue-6" class="q-px-lg" style="border-radius: 4px;"
                :loading="lecturerStore.loading" />
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

/* ซ่อน Scrollbar ที่ไม่จำเป็นใน Dialog */
.scroll::-webkit-scrollbar {
  width: 6px;
}

.scroll::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 10px;
}
</style>
