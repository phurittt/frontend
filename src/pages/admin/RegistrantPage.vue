<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMasterCourseStore } from 'src/stores/masterCourse-store';
import { useRegistrantStore } from 'src/stores/registrant-store';

import CustomTableComponent from 'components/CustomTableComponent.vue';
import type { TableColumn } from 'components/CustomTableComponent.vue';

const router = useRouter();
const courseStore = useMasterCourseStore();
const registrantStore = useRegistrantStore();

// ค้นหาและกรอง
const search = ref('');
const selectedCategory = ref('ทั้งหมด');

const pagination = ref({ page: 1, rowsPerPage: 10 });
watch(
  [search, selectedCategory],
  () => {
    pagination.value.page = 1;
  },
  { deep: true },
);

// Stats
const totalUsers = computed(() => courseStore.courses.length);
const totalRegistrants = computed(() => registrantStore.registrants.length);

onMounted(() => {
  courseStore.fetchCourses();
  registrantStore.fetchRegistrants();
});

// --- Table Config ---
const columns: TableColumn[] = [
  {
    name: 'name',
    label: 'ข้อมูลหลักสูตร',
    field: 'name',
    align: 'left',
    style: 'width: 45%',
  },
  {
    name: 'category',
    label: 'หมวดหมู่',
    field: 'category',
    align: 'center',
    style: 'width: 20%',
  },
  {
    name: 'regCount',
    label: 'จำนวนผู้ลงทะเบียน',
    field: 'regCount',
    align: 'center',
    style: 'width: 20%',
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'center',
    style: 'width: 15%',
  },
];

// ดึงข้อมูลหลักสูตร และนับจำนวนผู้ลงทะเบียน
const baseRows = computed(() => {
  return courseStore.courses.map((course) => {
    const count = registrantStore.registrants.filter((r) => r.courseId === course.id).length;
    return { ...course, regCount: count };
  });
});

const categoryOptions = computed(() => {
  const categories = new Set(courseStore.courses.map((c) => c.category));
  return ['ทั้งหมด', ...Array.from(categories)];
});

const filteredRows = computed(() => {
  let result = baseRows.value;

  if (selectedCategory.value !== 'ทั้งหมด') {
    result = result.filter((r) => r.category === selectedCategory.value);
  }

  if (search.value) {
    const keyword = search.value.toLowerCase().trim();
    result = result.filter(
      (r) => r.name.toLowerCase().includes(keyword) || r.id.toString().includes(keyword),
    );
  }

  return result;
});

const goToManage = (courseId: number) => {
  router.push({
    name: 'registrant-manage',
    params: { courseId: courseId },
  });
};
</script>

<template>
  <q-page class="q-pa-md q-pa-lg-xl q-mb-xl">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-8 fade-up" style="animation-delay: 0.1s">
        <q-card flat class="bento-box bg-white full-height q-pa-xl flex column justify-center">
          <div class="row items-start justify-between">
            <div>
              <h1 class="text-h4 text-weight-bolder text-dark q-my-none tracking-tight">
                Registrant Management
              </h1>
              <p class="text-grey-6 q-mt-sm q-mb-none text-body1">
                ตรวจสอบและจัดการรายชื่อผู้ลงทะเบียนอบรม
              </p>
            </div>
          </div>

          <div class="row items-center q-gutter-x-xl q-mt-xl">
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-dark line-height-none">
                {{ totalUsers }}
              </div>
              <div
                class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm"
              >
                จำนวนหลักสูตรทั้งหมด
              </div>
            </div>
            <q-separator vertical color="grey-3" style="height: 78px" />
            <div class="stat-item">
              <div class="text-h3 text-weight-bolder text-teal-5 line-height-none">
                {{ totalRegistrants }}
              </div>
              <div
                class="text-caption text-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-sm"
              >
                จำนวนผู้ลงทะเบียนทั้งหมด
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-4 fade-up" style="animation-delay: 0.15s">
        <q-card flat class="bento-box bg-white full-height q-pa-xl flex column justify-center">
          <div class="text-h6 text-weight-bold text-dark q-mb-md">ค้นหาและกรองข้อมูล</div>

          <div class="column q-gutter-y-md">
            <div>
              <label class="block text-caption text-weight-medium text-grey-6 q-mb-sm">
                ค้นหาหลักสูตร
              </label>
              <q-input
                outlined
                dense
                v-model="search"
                placeholder="ชื่อหลักสูตร, รหัส (ID)..."
                class="bento-input"
              >
                <template v-slot:prepend
                  ><q-icon name="search" color="grey-5" size="sm"
                /></template>
              </q-input>
            </div>

            <div>
              <label class="block text-caption text-weight-medium text-grey-6 q-mb-sm">
                หมวดหมู่ของหลักสูตร
              </label>
              <q-select
                outlined
                dense
                v-model="selectedCategory"
                :options="categoryOptions"
                class="bento-input"
                dropdown-icon="expand_more"
              >
              </q-select>
            </div>
          </div>
        </q-card>
      </div>

      <div class="col-12 fade-up" style="animation-delay: 0.2s">
        <CustomTableComponent
          :rows="filteredRows"
          :columns="columns"
          v-model:pagination="pagination"
        >
          <template #body-cell-name="{ row }">
            <div class="column justify-center q-py-xs">
              <span class="text-weight-bold text-dark text-subtitle2 line-height-tight">
                {{ row.name }}
              </span>
              <span class="text-caption text-grey-5 q-mt-xs"> Course ID: {{ row.id }} </span>
            </div>
          </template>

          <template #body-cell-category="{ value }">
            <q-chip :ripple="false" size="13px" class="text-weight-medium bento-chip" square flat>
              {{ value }}
            </q-chip>
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
              label="ดูรายชื่อ"
              no-caps
              class="btn-primary"
              @click="goToManage(row.id)"
            >
            </q-btn>
          </template>
        </CustomTableComponent>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
/* ================= สไตล์พื้นฐานของ Bento (ใช้เฉพาะส่วนที่อยู่นอก CustomTableComponent) ================= */

.tracking-tight {
  letter-spacing: -0.5px;
}
.letter-spacing-1 {
  letter-spacing: 0.8px;
}
.line-height-tight {
  line-height: 1.2;
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
    border: 1px solid transparent;
    transition: all 0.3s ease;
    &::before {
      border-color: #cbd5e1;
    }
    &:hover {
      background: #f1f5f9;
    }
    &:focus-within {
      background: #ffffff;
      border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
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

/* Table Slots UI (Avatar & Chip) */
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
