<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from 'src/stores/project-store';
import { useRegistrantStore } from 'src/stores/registrant-store';
import CustomTableComponent from 'components/CustomTableComponent.vue';
import type { TableColumn } from 'components/CustomTableComponent.vue';

const router = useRouter();
const projectStore = useProjectStore();
const registrantStore = useRegistrantStore();

const search = ref('');
const selectedYear = ref('ทั้งหมด');

const pagination = ref({ page: 1, rowsPerPage: 10 });
watch(
  [search, selectedYear],
  () => {
    pagination.value.page = 1;
  },
  { deep: true },
);

onMounted(() => {
  projectStore.fetchProjects();
  registrantStore.fetchAll();
});

const totalProjects = computed(() => projectStore.projects.length);

const columns: TableColumn[] = [
  { name: 'name', label: 'ชื่อโครงการ', field: 'name', align: 'left', style: 'width: 35%' },
  { name: 'course', label: 'หลักสูตร', field: 'course', align: 'left', style: 'width: 25%' },
  { name: 'year', label: 'ปีงบประมาณ', field: 'year', align: 'center', style: 'width: 15%' },
  {
    name: 'regCount',
    label: 'ผู้ลงทะเบียน',
    field: 'regCount',
    align: 'center',
    style: 'width: 15%',
  },
  { name: 'actions', label: '', field: 'actions', align: 'center', style: 'width: 10%' },
];

const baseRows = computed(() =>
  projectStore.projects.map((p) => {
    const regCount = registrantStore.allRegistrations.filter((r) => r.projectId === p.id).length;
    const courseTitle = p.courses?.[0]?.course?.label || '-';
    return {
      id: p.id,
      name: p.projectData.projectName || 'ไม่ได้ระบุชื่อ',
      course: courseTitle,
      year: p.projectData.year || '-',
      regCount,
    };
  }),
);

const yearOptions = computed(() => {
  const years = new Set(projectStore.projects.map((p) => p.projectData.year).filter(Boolean));
  return ['ทั้งหมด', ...Array.from(years).sort().reverse()];
});

const filteredRows = computed(() => {
  let result = baseRows.value;
  if (selectedYear.value !== 'ทั้งหมด') {
    result = result.filter((r) => r.year === selectedYear.value);
  }
  if (search.value.trim()) {
    const kw = search.value.toLowerCase().trim();
    result = result.filter(
      (r) => r.name.toLowerCase().includes(kw) || r.course.toLowerCase().includes(kw),
    );
  }
  return result;
});

const goToDetail = (projectId: number | undefined) => {
  if (!projectId) return;
  router.push({ name: 'finance-detail', params: { projectId } });
};
</script>

<template>
  <q-page class="q-pa-md q-pa-lg-xl q-mb-xl">
    <div class="row q-col-gutter-lg">
      <!-- Header + Stats -->
      <div class="col-12 col-md-8 fade-up" style="animation-delay: 0.1s">
        <q-card flat class="bento-box bg-white full-height q-pa-xl flex column justify-center">
          <div>
            <h1 class="text-h4 text-weight-bolder text-dark q-my-none tracking-tight">
              Finance Management
            </h1>
            <p class="text-grey-6 q-mt-sm q-mb-none text-body1">
              บันทึกและตรวจสอบรายรับรายจ่ายของแต่ละโครงการ
            </p>
          </div>
          <div class="row items-center q-gutter-x-xl q-mt-xl">
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-dark line-height-none">
                {{ totalProjects }}
              </div>
              <div
                class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm"
              >
                โครงการทั้งหมด
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Filter Panel -->
      <div class="col-12 col-md-4 fade-up" style="animation-delay: 0.15s">
        <q-card flat class="bento-box bg-white full-height q-pa-xl flex column justify-center">
          <div class="text-h6 text-weight-bold text-dark q-mb-md">ค้นหาและกรองข้อมูล</div>
          <div class="column q-gutter-y-md">
            <div>
              <label class="block text-caption text-weight-medium text-grey-6 q-mb-sm"
                >ค้นหาโครงการ</label
              >
              <q-input
                outlined
                dense
                v-model="search"
                placeholder="ชื่อโครงการ, หลักสูตร..."
                class="bento-input"
              >
                <template v-slot:prepend
                  ><q-icon name="search" color="grey-5" size="sm"
                /></template>
              </q-input>
            </div>
            <div>
              <label class="block text-caption text-weight-medium text-grey-6 q-mb-sm"
                >ปีงบประมาณ</label
              >
              <q-select
                outlined
                dense
                v-model="selectedYear"
                :options="yearOptions"
                class="bento-input"
                dropdown-icon="expand_more"
              />
            </div>
          </div>
        </q-card>
      </div>

      <!-- Table -->
      <div class="col-12 fade-up" style="animation-delay: 0.2s">
        <CustomTableComponent
          :rows="filteredRows"
          :columns="columns"
          v-model:pagination="pagination"
        >
          <template #body-cell-name="{ row }">
            <div class="column justify-center q-py-xs">
              <span class="text-weight-bold text-dark text-subtitle2 line-height-tight">{{
                row.name
              }}</span>
              <span class="text-caption text-grey-5 q-mt-xs">Project ID: {{ row.id }}</span>
            </div>
          </template>

          <template #body-cell-course="{ value }">
            <div class="text-grey-8 text-subtitle2">{{ value }}</div>
          </template>

          <template #body-cell-year="{ value }">
            <q-chip :ripple="false" size="13px" class="text-weight-medium bento-chip" square flat>{{
              value
            }}</q-chip>
          </template>

          <template #body-cell-regCount="{ value }">
            <span class="text-weight-bold text-dark text-subtitle1">{{ value }}</span>
            <span class="text-caption text-grey-6 q-ml-xs">คน</span>
          </template>

          <template #body-cell-actions="{ row }">
            <q-btn
              unelevated
              color="dark"
              text-color="white"
              label="รายรับรายจ่าย"
              no-caps
              class="btn-primary"
              icon="account_balance_wallet"
              @click="goToDetail(row.id)"
            />
          </template>
        </CustomTableComponent>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.tracking-tight {
  letter-spacing: -0.5px;
}
.letter-spacing-1 {
  letter-spacing: 0.8px;
}
.line-height-tight {
  line-height: 1.2;
}
.line-height-none {
  line-height: 1;
}

.bento-box {
  background-color: #ffffff;
  border-radius: 24px;
  border: 2px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.05) !important;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.08) !important;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bento-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    background: #f8fafc;
    &::before {
      border-color: #cbd5e1;
    }
  }
}

.btn-primary {
  border-radius: 12px;
  font-weight: 600;
  padding: 6px 16px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  &:hover {
    background-color: #424242 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
}

.bento-chip {
  background-color: #f0f4f8;
  border-radius: 8px;
  padding: 4px 10px;
}

.fade-up {
  opacity: 0;
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
