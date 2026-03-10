<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useCourseStore } from 'src/stores/course-store';
import { computed, onMounted } from 'vue';

const route = useRoute();
const router = useRouter();
const store = useCourseStore();

onMounted(() => {
  if (store.courses.length === 0) {
    store.fetchCourses();
  }
});

const course = computed(() => {
  const id = Number(route.params.id);
  if (store.courses.length === 0) return undefined;
  return store.courses.find((c) => c.id === id) || store.courses[0];
});

const formatPrice = (price?: number) => {
  if (price === undefined) return 'FREE';
  return price === 0 ? 'FREE' : `฿${price.toLocaleString()}`;
};

const getButtonLabel = (price?: number) => {
  if (price === undefined) return 'ลงทะเบียนเลย';
  return price === 0 ? 'ลงทะเบียนเลย (ฟรี)' : `ลงทะเบียนเลย (฿${price.toLocaleString()})`;
};
</script>

<template>
  <q-page class="bg-light-theme q-pb-xl responsive-page">
    <div class="header-banner text-white q-pt-xl q-pb-xl relative-position overflow-hidden">
      <div
        class="bg-image absolute-full pointer-events-none"
        :style="`background-image: url('${course?.image || 'https://via.placeholder.com/800x450'}');`"
      ></div>
      <div class="absolute-full bg-gradient-overlay pointer-events-none"></div>
      <div class="bg-pattern absolute-full opacity-10 pointer-events-none"></div>

      <div class="container-width q-mx-auto q-px-md relative-position z-top">
        <div class="q-mb-xl">
          <q-btn
            flat
            icon="arrow_back_ios_new"
            label="กลับไปหน้าหลักสูตร"
            text-color="white"
            no-caps
            class="q-px-sm text-weight-medium back-btn rounded-borders"
            to="/"
          />
        </div>

        <div class="row q-col-gutter-lg items-center" v-if="course">
          <div class="col-12 col-md-9 fade-up">
            <q-chip
              color="pink-6"
              text-color="white"
              size="sm"
              class="text-weight-bold q-mb-md shadow-2 q-px-md"
            >
              <q-icon name="fiber_manual_record" size="xs" class="q-mr-xs text-green-3" />
              กำลังเปิดรับสมัคร
            </q-chip>

            <h1 class="text-h3 text-weight-bolder q-mt-none q-mb-md line-height-tight text-shadow">
              {{ course.title }}
            </h1>

            <p
              class="text-subtitle1 text-grey-3 ellipsis-3-lines q-mb-lg text-shadow"
              style="max-width: 800px; line-height: 1.6"
            >
              {{ course.description }}
            </p>

            <div
              class="bg-white-transparent q-pa-sm q-pr-lg rounded-borders flex inline items-center no-wrap instructor-box"
            >
              <q-avatar size="48px" class="shadow-1 border-white q-mr-md">
                <img src="https://cdn.quasar.dev/img/avatar5.jpg" />
              </q-avatar>
              <div class="text-body2">
                <div class="text-pink-3 text-caption text-weight-bold">วิทยากรหลัก</div>
                <div class="text-white text-weight-bold text-subtitle2">ดร. สมชาย ใจดี</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container-width q-mx-auto q-px-md q-mt-xl">
      <div class="row q-col-gutter-xl" v-if="course">
        <div
          class="col-12 col-md-7 col-lg-8 column q-gutter-y-lg content-col fade-up"
          style="animation-delay: 0.1s"
        >
          <div class="row q-col-gutter-md q-mb-sm">
            <div class="col-6 col-sm-3">
              <q-card flat class="info-card bg-white q-pa-md text-center">
                <q-avatar
                  color="pink-1"
                  text-color="primary"
                  icon="schedule"
                  size="md"
                  class="q-mb-sm"
                />
                <div class="text-caption text-grey-6 text-weight-medium">ระยะเวลา</div>
                <div class="text-weight-bold text-dark text-subtitle2">{{ course.duration }}</div>
              </q-card>
            </div>
            <div class="col-6 col-sm-3">
              <q-card flat class="info-card bg-white q-pa-md text-center">
                <q-avatar
                  color="pink-1"
                  text-color="primary"
                  icon="group"
                  size="md"
                  class="q-mb-sm"
                />
                <div class="text-caption text-grey-6 text-weight-medium">รับสมัคร</div>
                <div class="text-weight-bold text-dark text-subtitle2">
                  {{ course.totalSeats }} คน
                </div>
              </q-card>
            </div>
            <div class="col-12 col-sm-6">
              <q-card flat class="info-card bg-white q-pa-md text-center no-wrap">
                <q-avatar
                  color="pink-1"
                  text-color="primary"
                  icon="place"
                  size="md"
                  class="q-mb-sm"
                />
                <div>
                  <div class="text-caption text-grey-6 text-weight-medium">สถานที่อบรม</div>
                  <div
                    class="text-weight-bold text-dark ellipsis-2-lines line-height-tight text-subtitle2"
                  >
                    {{ course.location }}
                  </div>
                </div>
              </q-card>
            </div>
          </div>

          <q-card flat class="course-card q-pa-lg q-pa-md-xl">
            <div class="text-h5 text-weight-bolder text-dark q-mb-lg flex items-center">
              สิ่งที่คุณจะได้เรียนรู้
            </div>
            <div class="row q-col-gutter-lg">
              <div
                v-for="(objective, index) in course.objectives"
                :key="index"
                class="col-12 col-sm-6 row no-wrap items-start objective-item"
              >
                <q-icon
                  name="check"
                  color="positive"
                  size="20px"
                  class="q-mr-md q-mt-xs bg-green-1 rounded-borders q-pa-xs"
                />
                <div class="text-body1 text-grey-8" style="line-height: 1.6">{{ objective }}</div>
              </div>
            </div>
          </q-card>

          <q-card flat class="course-card q-pa-lg q-pa-md-xl q-mb-xl">
            <div class="text-h5 text-weight-bolder text-dark q-mb-lg flex items-center">
              เนื้อหาของหลักสูตร
            </div>
            <q-list separator class="outline-list">
              <q-item
                v-for="(outline, index) in course.courseOutline"
                :key="index"
                class="q-px-sm q-py-md outline-item"
              >
                <q-item-section avatar style="min-width: 48px">
                  <q-avatar
                    color="grey-1"
                    text-color="primary"
                    size="md"
                    class="text-weight-bold shadow-1"
                  >
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>
                <q-item-section class="text-body1 text-dark text-weight-medium">
                  {{ outline }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <div
          class="col-12 col-md-5 col-lg-4 relative-position sidebar-col fade-up"
          style="animation-delay: 0.2s"
        >
          <div class="sticky-sidebar">
            <q-card flat class="course-card overflow-hidden">
              <div class="image-wrapper relative-position">
                <q-img
                  :src="course.image || 'https://via.placeholder.com/800x450'"
                  fit="cover"
                  class="course-img"
                  style="height: 240px; width: 100%"
                >
                  <template v-slot:loading>
                    <q-spinner-dots color="primary" size="2em" />
                  </template>
                </q-img>
                <div class="absolute-top-left q-ma-md z-top">
                  <q-chip
                    size="lg"
                    :color="course.price === 0 ? 'positive' : 'dark'"
                    text-color="white"
                    class="text-weight-bolder shadow-4 q-ma-none price-chip"
                  >
                    {{ formatPrice(course.price) }}
                  </q-chip>
                </div>
              </div>

              <q-card-section class="q-pa-lg">
                <div
                  class="text-caption text-weight-medium text-grey-7 q-mb-sm flex justify-between items-center"
                >
                  <span
                    >ลงทะเบียนแล้ว:
                    <strong class="text-dark"
                      >{{ course.registeredSeats }}/{{ course.totalSeats }}</strong
                    ></span
                  >
                  <q-badge
                    v-if="course.totalSeats - course.registeredSeats <= 5"
                    color="negative"
                    rounded
                    class="q-px-sm q-py-xs"
                  >
                    เหลือ {{ course.totalSeats - course.registeredSeats }} ที่นั่ง!
                  </q-badge>
                </div>

                <q-linear-progress
                  rounded
                  size="10px"
                  :value="course.registeredSeats / course.totalSeats"
                  color="primary"
                  track-color="pink-1"
                  class="q-mb-xl shadow-1"
                />

                <q-btn
                  unelevated
                  class="btn-main full-width text-weight-bold q-py-md q-mb-md text-subtitle1"
                  :label="getButtonLabel(course.price)"
                  rounded
                  no-caps
                />
                <q-btn
                  outline
                  class="btn-outline full-width text-weight-bold q-py-sm"
                  color="grey-4"
                  text-color="dark"
                  icon="favorite_border"
                  label="บันทึกไว้เรียนภายหลัง"
                  rounded
                  no-caps
                />

                <q-separator class="q-my-lg opacity-50" />

                <div class="text-subtitle1 text-weight-bold text-dark q-mb-sm">
                  สรุปข้อมูลการอบรม
                </div>
                <q-list class="q-mt-none">
                  <q-item class="q-px-none q-py-sm">
                    <q-item-section avatar style="min-width: 44px">
                      <q-avatar
                        color="pink-1"
                        text-color="primary"
                        icon="event_available"
                        size="sm"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-dark">{{
                        course.date
                      }}</q-item-label>
                      <q-item-label caption class="text-grey-6">{{ course.time }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item class="q-px-none q-py-sm">
                    <q-item-section avatar style="min-width: 44px">
                      <q-avatar color="pink-1" text-color="primary" icon="desktop_mac" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-dark">รูปแบบการเรียน</q-item-label>
                      <q-item-label caption class="text-grey-6">ออฟไลน์ (On-site)</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
/* ================= โทนสีและพื้นหลัง ================= */
.bg-light-theme {
  background-color: #f1f5f9;
  min-height: 100vh;
}
.container-width {
  max-width: 1200px;
  min-height: 420px;
  width: 100%;
}
.pointer-events-none {
  pointer-events: none;
}
.instructor-box {
  width: fit-content;
}
.line-height-tight {
  line-height: 1.3;
}
.opacity-10 {
  opacity: 0.1;
}
.opacity-50 {
  opacity: 0.5;
}
.z-top {
  z-index: 2;
}
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* ================= Header Banner ================= */
.header-banner {
  background-color: $dark;
  min-height: 380px;
  display: flex;
  align-items: center;

  &:hover {
    .bg-image {
      transform: scale(1.12); /* ขยายจาก 1.05 เป็น 1.12 */
    }
  }
}
.bg-image {
  background-size: cover;
  background-position: center;
  transform: scale(1.05);

  transition: transform 1.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  will-change: transform;
  backface-visibility: hidden;
}

.bg-gradient-overlay {
  background: linear-gradient(
    to right,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(15, 23, 42, 0.7) 50%,
    rgba(15, 23, 42, 0.4) 100%
  );
}

.bg-pattern {
  background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.2) 1px, transparent 0);
  background-size: 24px 24px;
}
.bg-white-transparent {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.border-white {
  border: 2px solid white;
}

/* ================= Cards ================= */
.course-card {
  border-radius: 20px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.info-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  height: 100%;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    border-color: #e2e8f0;
  }
}

/* ================= Sidebar แบบเกาะติด (Sticky) ================= */
.sticky-sidebar {
  z-index: 10;
}

/* ================= Image Hover Effect ================= */
.image-wrapper {
  overflow: hidden;
}
.course-img {
  transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.course-card:hover .course-img {
  transform: scale(1.08);
}
.price-chip {
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* ================= Lists ================= */
.objective-item {
  transition: transform 0.2s ease;
  &:hover {
    transform: translateX(4px);
  }
}
.outline-item {
  border-radius: 12px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
  &:hover {
    background-color: #f8fafc;
    transform: scale(1.01);
  }
}

/* ================= ปุ่มต่างๆ ================= */
.back-btn {
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  &:hover {
    background: white;
    color: #0f172a !important;
    transform: translateX(-4px);
  }
}

.btn-main {
  background: linear-gradient(135deg, #e91e63) !important;
  color: white !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(233, 30, 99, 0.4);
  }
  &:active {
    transform: translateY(0);
  }
}

.btn-outline {
  transition: all 0.2s ease;
  &:hover {
    background-color: #f8fafc !important;
    border-color: #cbd5e1 !important;
  }
}

/* ================= Animations ================= */
.fade-up {
  opacity: 0;
  animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ================= Responsive ================= */
@media (max-width: 1023px) {
  .sidebar-col {
    order: -1;
  }
  .sticky-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .q-pa-md-xl {
    padding: 24px;
  }
  .text-h3 {
    font-size: 2.2rem;
  }
  .info-card {
    padding: 16px 12px;
  }
  .header-banner {
    padding-top: 32px;
    padding-bottom: 40px;
  }
}

@media (max-width: 480px) {
  .course-card {
    border-radius: 20px;
  }
  .text-h3 {
    font-size: 1.8rem;
  }
}
</style>
