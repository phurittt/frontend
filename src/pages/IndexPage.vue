<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCourseStore } from 'src/stores/course-store';

const store = useCourseStore();

// ดึงข้อมูลเมื่อหน้าเว็บโหลด
onMounted(() => {
  store.fetchCourses();
});

// --- Computed ---
// เลือกคอร์สที่จะมาโชว์บน Banner (ตัวอย่างนี้เลือกคอร์สแรกสุด)
const heroCourse = computed(() => {
  if (store.courses.length > 0) {
    return store.courses[0];
  }
  return null;
});

// --- Helper Functions ---
// ฟังก์ชันแปลงราคา (0 = FREE)
const formatPrice = (price: number) => {
  return price === 0 ? 'FREE' : `${price.toLocaleString()} ฿`;
};

// ฟังก์ชันแปลงป้ายปุ่ม (Register Now)
const getButtonLabel = (price: number) => {
  return price === 0 ? 'Register Now (FREE)' : `Register Now (${price.toLocaleString()} ฿)`;
};
</script>

<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="container-width q-mx-auto">

      <div v-if="store.isLoading" class="hero-skeleton q-mb-xl flex flex-center">
        <q-spinner color="grey-5" size="3em" />
      </div>

      <section v-else-if="heroCourse"
        class="hero-banner q-mb-xl relative-position shadow-2 text-white column justify-center items-center text-center"
        :style="heroCourse.image ? `background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroCourse.image}) center/cover no-repeat;` : ''">
        <q-badge color="deep-orange" label="HOT" class="absolute-top-left q-ma-md" />

        <h1 class="text-h3 text-weight-bold q-mb-sm q-px-md">{{ heroCourse.title }}</h1>

        <p class="text-subtitle1 q-mb-md q-px-md ellipsis-2-lines" style="opacity: 0.9; max-width: 800px;">
          {{ heroCourse.description }}
        </p>

        <div class="row q-gutter-md q-mb-lg text-subtitle1">
          <div class="flex items-center">
            <q-icon name="event" class="q-mr-xs" /> {{ heroCourse.date }}
          </div>
          <div class="flex items-center">
            <q-icon name="schedule" class="q-mr-xs" /> {{ heroCourse.time }}
          </div>
        </div>

        <q-btn :label="getButtonLabel(heroCourse.price)" color="white" text-color="black" padding="10px 32px"
          class="text-weight-bold" no-caps />
      </section>

      <div v-else class="hero-banner q-mb-xl flex flex-center bg-grey-4 text-grey-7">
        <div class="text-h6">ไม่พบข้อมูลคอร์สแนะนำ</div>
      </div>


      <div class="row items-center justify-between q-mb-md">
        <h2 class="text-h5 text-weight-bold q-my-none">หลักสูตรที่เปิดอบรม</h2>
      </div>

      <div class="bg-white q-pa-sm rounded-borders row items-center justify-between q-mb-lg shadow-1">
        <div class="row q-gutter-sm">
          <q-btn-dropdown outline label="All Categories" color="grey-7" no-caps dense />
          <q-btn-dropdown outline label="Date" color="grey-7" no-caps dense />
        </div>
      </div>


      <div v-if="!store.isLoading" class="row q-col-gutter-lg">
        <div v-for="course in store.courses" :key="course.id" class="col-12 col-md-6 col-lg-3">

          <q-card flat bordered class="course-card column full-height">

            <div v-if="course.image" style="height: 160px;" class="relative-position">
              <q-img :src="course.image" style="height: 100%;" fit="cover" />
              <q-badge color="black" :label="course.duration" class="absolute-top-left q-ma-sm" style="opacity: 0.8" />
            </div>
            <div v-else class="bg-grey-3 relative-position flex flex-center" style="height: 160px;">
              <q-icon name="image" size="50px" color="grey-5" />
              <q-badge color="black" :label="course.duration" class="absolute-top-left q-ma-sm" style="opacity: 0.7" />
            </div>

            <q-card-section class="col">
              <div class="row justify-between items-start q-mb-sm">
                <div class="text-subtitle1 text-weight-bold ellipsis-2-lines" style="height: 48px; line-height: 1.2;">
                  {{ course.title }}
                </div>
                <q-badge :color="course.price === 0 ? 'green' : 'grey-3'"
                  :text-color="course.price === 0 ? 'white' : 'black'" :label="formatPrice(course.price)" />
              </div>

              <div class="text-caption text-grey-8 ellipsis-3-lines" style="min-height: 60px;">
                {{ course.description }}
              </div>

              <div class="q-mt-sm text-caption text-grey-7 flex items-center">
                <q-icon name="place" class="q-mr-xs text-red-5" /> {{ course.location }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="bg-grey-1">
              <div class="text-caption text-grey-8 q-mb-sm">
                📅 {{ course.date }} | ⏰ {{ course.time }}
              </div>
              <q-btn unelevated color="grey-9" label="ดูรายละเอียด" class="full-width" no-caps />
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

/* Style สำหรับ Hero Banner */
.hero-banner {
  background-color: #616161;
  /* สีพื้นหลังสำรองถ้าไม่มีรูป */
  height: 350px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.hero-skeleton {
  height: 350px;
  background-color: #e0e0e0;
  border-radius: 12px;
}

/* Style สำหรับ Card */
.course-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Helper Text Colors */
.text-red-5 {
  color: #ef5350 !important;
}
</style>
