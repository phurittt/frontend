<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from 'src/stores/course-store';

const store = useCourseStore();
const router = useRouter();
const slide = ref(0);

// ดึงข้อมูลเมื่อหน้าเว็บโหลด
onMounted(() => {
  store.fetchCourses();
});

const goToDetail = (id: number) => {
  router.push(`/courses/${id}`).then(() => {
    window.scrollTo(0, 0);
  });
};

const featuredCourses = computed(() => {
  return store.courses.slice(0, 3);
});

const formatPrice = (price: number) => {
  return price === 0 ? 'FREE' : `฿${price.toLocaleString()}`;
};
</script>

<template>
  <q-page class="q-pa-md q-pb-xl bg-light-theme responsive-page">
    <div class="container-width q-mx-auto">
      <div v-if="store.isLoading" class="hero-skeleton q-mb-xl flex flex-center">
        <q-spinner-dots color="primary" size="4em" />
      </div>

      <q-carousel
        v-else-if="featuredCourses.length > 0"
        v-model="slide"
        animated
        arrows
        navigation
        infinite
        autoplay
        transition-prev="slide-right"
        transition-next="slide-left"
        swipeable
        control-color="white"
        class="hero-carousel q-mb-xl shadow-4 disable-select"
      >
        <q-carousel-slide
          v-for="(course, index) in featuredCourses"
          :key="course.id"
          :name="index"
          class="q-pa-none hide-scrollbar relative-position"
        >
          <div
            class="carousel-bg absolute-top"
            :style="
              course.image
                ? `--bg-img: url('${course.image}'); background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.9) 100%), var(--bg-img) center/cover no-repeat;`
                : 'background: #2c3e50;'
            "
          ></div>

          <div class="hot-badge absolute-top-left row items-center content-layer">
            <q-icon name="local_fire_department" size="18px" class="q-mr-xs" />
            <span class="q-mr-xs">HOT</span>
          </div>

          <div
            class="hero-content-wrapper absolute-full flex flex-center content-layer click-through"
          >
            <div class="hero-content text-white q-px-md text-center click-catch">
              <h1 class="hero-title text-weight-bold q-mb-sm line-height-tight">
                {{ course.title }}
              </h1>

              <p class="hero-subtitle text-weight-regular q-mb-md mx-auto ellipsis-2-lines">
                {{ course.description }}
              </p>

              <div class="row q-gutter-md q-mb-lg justify-center text-weight-medium hero-meta">
                <div class="flex items-center">
                  <q-icon name="event_available" size="20px" class="q-mr-sm text-pink-3" />
                  {{ course.date }}
                </div>
                <div class="flex items-center">
                  <q-icon
                    :name="course.format.includes('ออนไลน์') ? 'laptop_mac' : 'business'"
                    size="20px"
                    class="q-mr-sm text-pink-3"
                  />
                  {{ course.format }}
                </div>
              </div>

              <q-btn
                label="ดูรายละเอียดหลักสูตร"
                class="btn-main text-weight-bold shadow-3 hero-btn q-mb-sm"
                rounded
                no-caps
                @click="goToDetail(course.id)"
              />
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>

      <div v-else class="hero-skeleton q-mb-xl flex flex-center bg-white border-subtle">
        <div class="text-h6 text-grey-5">ไม่พบข้อมูลคอร์สแนะนำ</div>
      </div>

      <div class="row items-center justify-between q-mb-sm q-mt-lg">
        <h2 class="section-title text-weight-bold text-dark q-my-none">หลักสูตรทั้งหมด</h2>
      </div>

      <div class="filter-bar row wrap items-center q-gutter-sm q-mb-lg q-py-sm rounded-borders">
        <q-btn-dropdown
          unelevated
          label="ทุกหมวดหมู่"
          color="white"
          text-color="dark"
          no-caps
          class="filter-btn text-weight-medium"
        />
        <q-btn-dropdown
          unelevated
          label="จัดเรียงตามวันที่"
          color="white"
          text-color="dark"
          no-caps
          class="filter-btn text-weight-medium"
        />
      </div>

      <div v-if="!store.isLoading" class="row q-col-gutter-lg">
        <div
          v-for="course in store.courses"
          :key="course.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card flat class="course-card column full-height">
            <div class="image-wrapper relative-position">
              <q-img v-if="course.image" :src="course.image" class="course-img" fit="cover" />
              <div v-else class="bg-grey-2 flex flex-center course-img">
                <q-icon name="collections" size="50px" color="grey-4" />
              </div>

              <div class="glass-badge absolute-top-left q-ma-sm">
                <q-icon name="timer" size="14px" class="q-mr-xs" /> {{ course.duration }}
              </div>

              <div
                class="price-badge absolute-top-right q-ma-sm"
                :class="course.price === 0 ? 'price-free' : 'price-paid'"
              >
                {{ formatPrice(course.price) }}
              </div>
            </div>

            <q-card-section class="col q-pa-md column">
              <div
                class="text-subtitle1 text-weight-bold text-dark q-mb-xs card-title ellipsis-2-lines"
              >
                {{ course.title }}
              </div>

              <div class="text-body2 text-grey-6 q-mb-md flex-grow-1 ellipsis-3-lines">
                {{ course.description }}
              </div>

              <div class="course-info-list q-gutter-y-sm q-mb-md">
                <div class="row items-center text-caption text-grey-8 no-wrap">
                  <q-icon name="event" size="16px" class="q-mr-xs text-primary" />
                  <span class="ellipsis">{{ course.date }} • {{ course.time }}</span>
                </div>
                <div class="row items-center text-caption text-grey-8 no-wrap">
                  <q-icon
                    :name="course.format.includes('ออนไลน์') ? 'laptop_mac' : 'business'"
                    size="16px"
                    class="q-mr-xs text-primary"
                  />
                  <span class="ellipsis">{{ course.format }}</span>
                </div>
              </div>

              <q-btn
                unelevated
                class="full-width text-weight-bold"
                :class="course.totalSeats === course.registeredSeats ? 'btn-soldout' : 'btn-detail'"
                :label="
                  course.totalSeats === course.registeredSeats ? 'ที่นั่งเต็มแล้ว' : 'ดูรายละเอียด'
                "
                no-caps
                @click="goToDetail(course.id)"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.bg-light-theme {
  background-color: $background;
  min-height: 100vh;
}
.container-width {
  max-width: 1280px;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.flex-grow-1 {
  flex-grow: 1;
}
.line-height-tight {
  line-height: 1.2;
}

.content-layer {
  z-index: 1;
}

/* ================= ป้องกันการลากคลุม & การกด ================= */

.click-through {
  pointer-events: none;
}
.click-catch {
  pointer-events: auto;
}

/* ================= Hero Carousel ================= */
.hero-carousel {
  height: 400px;
  border-radius: 20px;
  background-color: $dark;
  position: relative;
  overflow: hidden !important;

  :deep(.q-carousel__slide) {
    overflow: hidden !important;
    border-radius: inherit;
  }

  &:hover {
    .carousel-bg {
      transform: scale(1.08);
    }
  }
}

.hero-skeleton {
  min-height: 400px;
  border-radius: 20px;
  background-color: $background;
}

.carousel-bg {
  height: 100%;
  width: 100%;
  transform: scale(1);
  transition: transform 1.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  will-change: transform;
  backface-visibility: hidden;
}

:deep(.q-carousel__arrow .q-icon) {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  transition: transform 0.2s ease;
}
:deep(.q-carousel__arrow) {
  z-index: 10;
}
:deep(.q-carousel__arrow:hover .q-icon) {
  transform: scale(1.2);
}

.hot-badge {
  background: linear-gradient(135deg, #ff3d00, #ff5213);
  color: white;
  padding: 6px 16px;
  border-radius: 30px;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(255, 61, 0, 0.3);
  top: 20px;
  left: 20px;
}

.hero-content {
  max-width: 1000px;
  padding-bottom: 40px;
}

.hero-title {
  font-size: clamp(1.6rem, 3vw, 2.5rem);
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.hero-subtitle {
  font-size: clamp(0.95rem, 1.2vw, 1.1rem);
  opacity: 0.9;
  max-width: 800px;
}

.hero-btn {
  font-size: clamp(0.95rem, 1.5vw, 1.05rem);
  padding: 10px 32px;
}

/* ================= Section Title ================= */
.section-title {
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
}

/* ================= Filter Bar ================= */
.filter-btn {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
  font-size: 0.9rem;
  &:hover {
    border-color: #cbd5e1;
    background-color: #f8fafc !important;
  }
}

/* ================= Course Card ================= */
.course-card {
  border-radius: 16px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(233, 30, 99, 0.08);
    border-color: rgba(233, 30, 99, 0.1);
    .course-img {
      transform: scale(1.05);
    }
  }
}

.image-wrapper {
  height: 180px;
  overflow: hidden;
}
.course-img {
  height: 100%;
  width: 100%;
  transition: transform 0.6s ease;
}

.card-title {
  min-height: 56px;
  margin-bottom: 10px;
}

/* Badges บนรูป */
.glass-badge {
  background: rgba(255, 255, 255, 0.85);
  color: #1e293b;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.price-badge {
  padding: 4px 12px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.price-free {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
}
.price-paid {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%) !important;
}

/* ================= Buttons ================= */
.btn-main {
  background: linear-gradient(135deg, #e91e63) !important;
  color: white !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(233, 30, 99, 0.3);
  }
  &:active {
    transform: translateY(0);
  }
}

.btn-detail {
  background-color: #f8fafc;
  color: #334155;
  border-radius: 10px;
  padding: 8px 0;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  &:hover {
    background: #f1f5f9;
    color: #e91e63;
    border-color: #cbd5e1;
  }
}

.btn-soldout {
  background-color: #fee2e2;
  color: #ef4444;
  border-radius: 10px;
  padding: 8px 0;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: 1px solid #fecaca;
  &:hover {
    background: #fecaca;
  }
}

/* ================= Responsive Media Queries ================= */
@media (max-width: 768px) {
  .hero-carousel {
    height: 400px;
    border-radius: 16px;
  }

  .carousel-bg {
    height: 100%;
    background:
      linear-gradient(
        to top,
        rgba(15, 23, 42, 0.95) 0%,
        rgba(15, 23, 42, 0.6) 50%,
        rgba(0, 0, 0, 0) 100%
      ),
      var(--bg-img) center/cover no-repeat !important;
  }

  .hero-content-wrapper {
    align-items: center;
    padding-bottom: 30px;
  }

  .hero-content {
    background: transparent;
    padding: 0 16px;
  }

  .hot-badge {
    top: 12px;
    left: 12px;
    padding: 4px 10px;
    font-size: 0.7rem;
  }
  .hero-meta {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
    font-size: 0.85rem;
  }
  :deep(.q-carousel__navigation) {
    bottom: 8px;
  }
  .filter-bar {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .q-pa-md {
    padding: 12px;
  }
  .hero-carousel {
    height: 440px;
  }
  :deep(.q-carousel__arrow .q-icon) {
    font-size: 24px;
  }
  .image-wrapper {
    height: 160px;
  }
}
</style>
