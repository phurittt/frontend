<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCourseStore } from 'src/stores/course-store';

const store = useCourseStore();
const filterGroup = ref('ทุกกลุ่มเป้าหมาย');
const sortOrder = ref('จัดเรียงตาม');
const layout = ref('grid');

onMounted(() => {
  store.fetchCourses();
});

// ฟังก์ชันแปลงราคา (ปรับให้เหมือนรูป Screenshot: "FREE B" หรือ "2,000 B")
const getPriceLabel = (price: number) => {
  return price === 0 ? 'FREE B' : `${price.toLocaleString()} B`;
};
</script>

<template>
  <q-page class="q-pa-md bg-white">
    <div class="container-width q-mx-auto">
      <h1 class="text-h5 text-weight-bold q-mb-md">หลักสูตรที่เปิดอบรม</h1>

      <div class="filter-bar row items-center justify-between q-mb-lg q-pa-sm rounded-borders">
        <div class="row q-gutter-sm">
          <q-btn-dropdown
            unelevated
            color="grey-3"
            text-color="black"
            :label="filterGroup"
            no-caps
            class="filter-btn"
            dropdown-icon="expand_more"
          />
          <q-btn-dropdown
            unelevated
            color="grey-3"
            text-color="black"
            :label="sortOrder"
            no-caps
            class="filter-btn"
            dropdown-icon="expand_more"
          />
        </div>

        <div class="row q-gutter-xs">
          <q-btn
            unelevated
            round
            icon="grid_view"
            :color="layout === 'grid' ? 'grey-9' : 'grey-3'"
            :text-color="layout === 'grid' ? 'white' : 'black'"
            @click="layout = 'grid'"
            size="sm"
          />
          <q-btn
            unelevated
            round
            icon="view_list"
            :color="layout === 'list' ? 'grey-9' : 'grey-3'"
            :text-color="layout === 'list' ? 'white' : 'black'"
            @click="layout = 'list'"
            size="sm"
          />
        </div>
      </div>

      <div v-if="store.isLoading" class="row justify-center q-py-xl">
        <q-spinner-dots size="50px" color="grey-8" />
      </div>

      <div v-else class="row q-col-gutter-lg">
        <div v-for="course in store.courses" :key="course.id" class="col-12 col-md-6 col-lg-3">
          <q-card flat bordered class="course-card full-height column">
            <div v-if="course.image" style="height: 180px" class="relative-position">
              <q-img :src="course.image" style="height: 100%" fit="cover" />
            </div>

            <div v-else class="bg-grey-2 flex flex-center relative-position" style="height: 180px">
              <q-icon name="image" size="60px" color="black" style="opacity: 0.1" />
            </div>

            <q-card-section class="col q-pb-none q-pt-md">
              <div
                class="text-subtitle1 text-weight-bold q-mb-sm text-grey-9"
                style="min-height: 48px; line-height: 1.4"
              >
                {{ course.title }}
              </div>

              <div
                class="text-caption text-grey-6 q-mb-md ellipsis-3-lines"
                style="min-height: 50px"
              >
                {{ course.description }}
              </div>

              <div class="text-caption text-grey-8 q-gutter-y-xs">
                <div class="row items-center">
                  <q-icon name="calendar_month" color="red-5" class="q-mr-xs" size="xs" />
                  {{ course.date }} | {{ course.time }}
                </div>
                <div class="row items-center">
                  <q-icon name="location_on" color="red-5" class="q-mr-xs" size="xs" />
                  {{ course.location }}
                </div>
              </div>
            </q-card-section>

            <q-card-section class="row items-center justify-between q-mt-md">
              <div
                class="price-badge text-weight-bold text-grey-9 bg-grey-2 q-px-md q-py-xs rounded-borders"
              >
                {{ getPriceLabel(course.price) }}
              </div>

              <q-btn
                unelevated
                color="grey-9"
                label="ดูรายละเอียด"
                size="sm"
                padding="8px 16px"
                style="border-radius: 4px"
                @click="$router.push(`/courses/${course.id}`)"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.container-width {
  max-width: 1200px;
}

.filter-btn {
  font-weight: normal;
  border-radius: 4px;
}

.course-card {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease-in-out;
}

.course-card:hover {
  border-color: #bdbdbd;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.price-badge {
  font-size: 13px;
  min-width: 80px;
  text-align: center;
}
</style>
